"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WizardStepper } from "./_components/wizard-stepper";
import { Step1Channel } from "./_components/step1-channel";
import { Step2Keyword } from "./_components/step2-keyword";
import { Step3Action } from "./_components/step3-action";
import { Step4Drip } from "./_components/step4-drip";

const STEPS = [
  { label: "Channel"  },
  { label: "Keyword"  },
  { label: "Action"   },
  { label: "Drip"     },
];

type Channel     = "instagram" | "whatsapp";
type MatchType   = "exact" | "contains" | "fuzzy";
type ListenerType = "fixed_message" | "smart_ai";
type Language    = "english" | "hindi" | "hinglish" | "tamil" | "telugu" | "marathi";

interface AiConfig {
  language:            Language;
  tone:                string;
  businessDescription: string;
  faqs:                { question: string; answer: string }[];
  paymentLink?:        string;
  escalationPhrase?:   string;
}

interface DripStep {
  stepNumber:  number;
  delayHours:  number;
  message:     string;
}

export default function NewAutomationPage() {
  const router     = useRouter();
  const limits     = useQuery(api.accounts.getMyLimits);
  const createAuto = useMutation(api.automations.createAutomation);

  const plan = limits?.plan ?? "starter";

  /* ── Wizard state ─────────────────────────────────────── */
  const [step, setStep] = useState(1);

  // Step 1
  const [channel, setChannel] = useState<Channel | undefined>();

  // Step 2
  const [name,      setName]      = useState("");
  const [keywords,  setKeywords]  = useState<string[]>([]);
  const [matchType, setMatchType] = useState<MatchType>("exact");

  // Step 3
  const [listenerType, setListenerType] = useState<ListenerType>("fixed_message");
  const [message,      setMessage]      = useState("");
  const [aiConfig,     setAiConfig]     = useState<AiConfig>({
    language:            "hinglish",
    tone:                "",
    businessDescription: "",
    faqs:                [],
    paymentLink:         "",
    escalationPhrase:    "",
  });

  // Step 4
  const [dripEnabled,  setDripEnabled]  = useState(false);
  const [dripSteps,    setDripSteps]    = useState<DripStep[]>([]);
  const [stopOnReply,  setStopOnReply]  = useState(true);
  const [submitting,   setSubmitting]   = useState(false);

  function updateAiConfig(partial: Partial<AiConfig>) {
    setAiConfig((prev) => ({ ...prev, ...partial }));
  }

  /* ── Submit ───────────────────────────────────────────── */
  async function handleSubmit() {
    if (!channel) return;
    setSubmitting(true);

    try {
      const triggerType =
        channel === "whatsapp" ? "wa_message" :
        listenerType === "smart_ai" ? "ig_dm" : "ig_comment";

      const automationId = await createAuto({
        name: name.trim(),
        channel,
        trigger: {
          type:             triggerType,
          keywords,
          keywordMatchType: matchType,
        },
        listener: {
          type: listenerType,
          ...(listenerType === "fixed_message"
            ? { message: { text: message, mediaType: "none" as const } }
            : { aiConfig: {
                language:            aiConfig.language,
                tone:                aiConfig.tone,
                businessDescription: aiConfig.businessDescription,
                faqs:                aiConfig.faqs.filter((f) => f.question && f.answer),
                paymentLink:         aiConfig.paymentLink || undefined,
                escalationPhrase:    aiConfig.escalationPhrase || undefined,
              }}
          ),
        },
        ...(dripEnabled && dripSteps.length > 0
          ? { drip: { enabled: true, steps: dripSteps, stopOnReply, stopKeywords: ["STOP", "stop"] } }
          : {}
        ),
      });

      toast.success("Automation is live! 🚀");
      router.push("/automations");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px 64px" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => router.push("/automations")}
          style={{ fontSize: 13, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}
        >
          ← Back to automations
        </button>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--ink-1)", letterSpacing: "-0.02em" }}>
          New automation
        </h1>
      </div>

      {/* Stepper */}
      <WizardStepper currentStep={step} steps={STEPS} />

      {/* Step content */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--rule)", borderRadius: 14, padding: "28px 28px" }}>
        {step === 1 && (
          <Step1Channel
            channel={channel}
            plan={plan}
            onSelect={setChannel}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && channel && (
          <Step2Keyword
            channel={channel}
            name={name}
            keywords={keywords}
            matchType={matchType}
            plan={plan}
            onName={setName}
            onKeywords={setKeywords}
            onMatch={setMatchType}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Action
            listenerType={listenerType}
            message={message}
            aiConfig={aiConfig}
            plan={plan}
            onType={setListenerType}
            onMessage={setMessage}
            onAiConfig={updateAiConfig}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <Step4Drip
            dripEnabled={dripEnabled}
            steps={dripSteps}
            stopOnReply={stopOnReply}
            plan={plan}
            submitting={submitting}
            onToggle={setDripEnabled}
            onSteps={setDripSteps}
            onStopOnReply={setStopOnReply}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Plan note for starter users */}
      {plan === "starter" && (
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: "var(--accent-muted)", border: "1px solid var(--accent-border)" }}>
          <p style={{ fontSize: 12, fontWeight: 300, color: "var(--accent)", lineHeight: 1.5 }}>
            Free plan: 5 automations, Instagram only, exact keyword matching.{" "}
            <button onClick={() => router.push("/settings/billing")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 12, fontWeight: 500, padding: 0, textDecoration: "underline" }}>
              Upgrade to Creator
            </button>{" "}
            for WhatsApp, advanced keywords, and drip sequences.
          </p>
        </div>
      )}
    </div>
  );
}