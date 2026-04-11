import {
  internalMutation,
  internalAction,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { META_GRAPH_URL } from "../lib/constants";

/* ═══════════════════════════════════════════════════════════
   SCHEDULE DRIP
   Called right after the first trigger reply is sent.
   Creates one drip_jobs row per step + schedules Convex jobs.
═══════════════════════════════════════════════════════════ */

export const scheduleDrip = internalMutation({
  args: {
    accountId: v.id("accounts"),
    leadId: v.id("leads"),
    automationId: v.id("automations"),
    steps: v.array(
      v.object({
        stepNumber: v.number(),
        delayHours: v.number(),
        message: v.string(),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(
          v.union(v.literal("image"), v.literal("pdf"), v.literal("none"))
        ),
      })
    ),
    stopOnReply: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const step of args.steps) {
      const scheduledFor = now + step.delayHours * 60 * 60 * 1000;
      const requiresTemplate = step.delayHours >= 24;

      /* Insert job row first so we have the ID */
      const jobRowId = await ctx.db.insert("drip_jobs", {
        accountId: args.accountId,
        leadId: args.leadId,
        automationId: args.automationId,
        stepNumber: step.stepNumber,
        scheduledFor,
        message: step.message,
        mediaUrl: step.mediaUrl,
        mediaType: step.mediaType,
        status: "scheduled",
        requiresTemplate,
        createdAt: now,
      });

      /* Schedule the Convex job — returns an Id<"_scheduled_functions"> */
      const convexJobId = await ctx.scheduler.runAt(
        scheduledFor,
        internal.drip.executeDripStep,
        { dripJobId: jobRowId }
      );

      /* Store as string so we can cancel later */
      await ctx.db.patch(jobRowId, {
        convexJobId: convexJobId as string,
      });
    }

    await ctx.db.patch(args.leadId, {
      dripStatus: "running",
      dripCurrentStep: 0,
      updatedAt: now,
    });
  },
});

/* ═══════════════════════════════════════════════════════════
   EXECUTE DRIP STEP
   Fired by Convex Scheduler at scheduledFor time.
   Runs safety checks before sending.
═══════════════════════════════════════════════════════════ */

export const executeDripStep = internalAction({
  args: { dripJobId: v.id("drip_jobs") },
  handler: async (ctx, { dripJobId }) => {
    const job = await ctx.runQuery(internal.drip.getDripJob, { dripJobId });
    if (!job || job.status !== "scheduled") return;

    const lead = await ctx.runQuery(internal.leads.getLeadById, {
      leadId: job.leadId,
    });
    if (!lead) return;

    /* Abort conditions */
    if (lead.status === "opted_out") {
      await ctx.runMutation(internal.drip.markJobStatus, {
        dripJobId,
        status: "cancelled",
        cancelReason: "lead_opted_out",
      });
      return;
    }

    if (lead.dripStatus === "stopped") {
      await ctx.runMutation(internal.drip.markJobStatus, {
        dripJobId,
        status: "cancelled",
        cancelReason: "drip_stopped",
      });
      return;
    }

    const account = await ctx.runQuery(internal.accounts.getAccountById, {
      accountId: job.accountId,
    });
    if (!account) return;

    const accessToken =
      lead.channel === "instagram"
        ? account.instagram?.accessToken
        : account.whatsapp?.accessToken;

    if (!accessToken) {
      await ctx.runMutation(internal.drip.markJobStatus, {
        dripJobId,
        status: "failed",
        failureReason: "no_access_token",
      });
      return;
    }

    try {
      if (lead.channel === "instagram") {
        await sendIgDM(lead.senderId, job.message, accessToken);
      } else if (lead.channel === "whatsapp" && account.whatsapp?.phoneNumberId) {
        await sendWaMessage(
          account.whatsapp.phoneNumberId,
          lead.senderId,
          job.message,
          accessToken,
          job.requiresTemplate ? job.templateName : undefined
        );
      }

      await ctx.runMutation(internal.leads.saveOutboundMessage, {
        accountId: job.accountId,
        leadId: job.leadId,
        automationId: job.automationId,
        messageText: job.message,
        source: "drip",
        insideWindow: lead.windowOpen,
      });

      await ctx.runMutation(internal.drip.markJobStatus, {
        dripJobId,
        status: "sent",
      });

      await ctx.runMutation(internal.drip.updateLeadDripStep, {
        leadId: job.leadId,
        stepNumber: job.stepNumber,
      });
    } catch (err) {
      await ctx.runMutation(internal.drip.markJobStatus, {
        dripJobId,
        status: "failed",
        failureReason: err instanceof Error ? err.message : "unknown_error",
      });
    }
  },
});

/* ═══════════════════════════════════════════════════════════
   CANCEL DRIP
   Atomically cancels all pending drip jobs for a lead.
═══════════════════════════════════════════════════════════ */

export const cancelDrip = internalMutation({
  args: {
    leadId: v.id("leads"),
    reason: v.string(),
  },
  handler: async (ctx, { leadId, reason }) => {
    const pendingJobs = await ctx.db
      .query("drip_jobs")
      .withIndex("by_lead_status", (q) =>
        q.eq("leadId", leadId).eq("status", "scheduled")
      )
      .collect();

    for (const job of pendingJobs) {
      if (job.convexJobId) {
        try {
          /* convexJobId is stored as string — cast to the scheduler ID type */
          await ctx.scheduler.cancel(
            job.convexJobId as Id<"_scheduled_functions">
          );
        } catch {
          /* Job already fired or doesn't exist — safe to ignore */
        }
      }

      await ctx.db.patch(job._id, {
        status: "cancelled",
        cancelledAt: Date.now(),
        cancelReason: reason,
      });
    }

    await ctx.db.patch(leadId, {
      dripStatus: "stopped",
      updatedAt: Date.now(),
    });
  },
});

/* ═══════════════════════════════════════════════════════════
   INTERNAL QUERIES + MUTATIONS
═══════════════════════════════════════════════════════════ */

export const getDripJob = internalQuery({
  args: { dripJobId: v.id("drip_jobs") },
  handler: async (ctx, { dripJobId }) => {
    return ctx.db.get(dripJobId);
  },
});

export const markJobStatus = internalMutation({
  args: {
    dripJobId: v.id("drip_jobs"),
    status: v.union(
      v.literal("sent"),
      v.literal("cancelled"),
      v.literal("failed"),
      v.literal("skipped")
    ),
    cancelReason: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, { dripJobId, status, cancelReason, failureReason }) => {
    const now = Date.now();
    await ctx.db.patch(dripJobId, {
      status,
      ...(status === "sent" ? { sentAt: now } : {}),
      ...(status === "cancelled" ? { cancelledAt: now, cancelReason } : {}),
      ...(status === "failed" ? { failureReason } : {}),
    });
  },
});

export const updateLeadDripStep = internalMutation({
  args: {
    leadId: v.id("leads"),
    stepNumber: v.number(),
  },
  handler: async (ctx, { leadId, stepNumber }) => {
    const remaining = await ctx.db
      .query("drip_jobs")
      .withIndex("by_lead_status", (q) =>
        q.eq("leadId", leadId).eq("status", "scheduled")
      )
      .collect();

    const isDone = remaining.length === 0;

    const lead = await ctx.db.get(leadId);

    await ctx.db.patch(leadId, {
      dripCurrentStep: stepNumber,
      dripStatus: isDone ? "completed" : "running",
      /* If all drip steps exhausted and lead never replied → mark as lost */
      ...(isDone && lead?.status === "new" ? { status: "lost" as const } : {}),
      updatedAt: Date.now(),
    });
  },
});

/* ═══════════════════════════════════════════════════════════
   META SEND HELPERS
═══════════════════════════════════════════════════════════ */

async function sendIgDM(
  recipientId: string,
  text: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${META_GRAPH_URL}/me/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      messaging_type: "MESSAGE_TAG",
      tag: "CONFIRMED_EVENT_UPDATE",
    }),
  });
  if (!res.ok) {
    throw new Error(`IG DM failed: ${await res.text()}`);
  }
}

async function sendWaMessage(
  phoneNumberId: string,
  to: string,
  text: string,
  accessToken: string,
  templateName?: string
): Promise<void> {
  const body = templateName
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            { type: "body", parameters: [{ type: "text", text }] },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text, preview_url: false },
      };

  const res = await fetch(`${META_GRAPH_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`WA message failed: ${await res.text()}`);
  }
}