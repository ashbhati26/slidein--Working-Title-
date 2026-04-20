// PAGE: /automations/new — Automation creation wizard
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { WizardStepper }                  from "./_components/wizard-stepper";
import { Step1Trigger, type TriggerType } from "./_components/step1-trigger";
import { Step2Post }                       from "./_components/step2-post";
import { Step3Keyword }                    from "./_components/step3-keyword";
import { Step4Reply, type AiConfig }       from "./_components/step4-reply";
import { Step5Drip, type DripStep }        from "./_components/step5-drip";

type ListenerType = "fixed_message" | "smart_ai";
type MatchType    = "exact" | "contains" | "fuzzy";

function stepTitle(raw: number, triggerType: TriggerType | null): string {
  if (triggerType === "ig_comment") {
    return ({ 1: "Choose trigger", 2: "Select post", 3: "Set keyword", 4: "Set reply", 5: "Add drip" } as Record<number, string>)[raw] ?? "";
  }
  return ({ 1: "Choose trigger", 3: "Set keyword", 4: "Set reply", 5: "Add drip" } as Record<number, string>)[raw] ?? "";
}

export default function NewAutomationPage() {
  const router     = useRouter();
  const limits     = useQuery(api.accounts.getMyLimits);
  const account    = useQuery(api.accounts.getMyAccount);
  const createAuto = useMutation(api.automations.createAutomation);

  const plan        = limits?.plan ?? "starter";
  const igConnected = !!account?.instagram;
  const waConnected = !!account?.whatsapp;
  const isPaid      = plan !== "starter";

  const [step, setStep]               = useState<number>(1);
  const [triggerType, setTriggerType] = useState<TriggerType | null>(null);

  const isComment = (t: TriggerType | null) => t === "ig_comment";
  const maxStep   = isComment(triggerType) ? 5 : isPaid ? 4 : 3;

  function displayStep(raw: number): number {
    if (isComment(triggerType)) return raw;
    if (raw === 1) return 1;
    if (raw === 3) return 2;
    if (raw === 4) return 3;
    if (raw === 5) return 4;
    return raw;
  }

  function next() { if (step === 1 && !isComment(triggerType)) { setStep(3); return; } setStep((s) => Math.min(5, s + 1)); }
  function prev() { if (step === 3 && !isComment(triggerType)) { setStep(1); return; } setStep((s) => Math.max(1, s - 1)); }

  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [name,         setName]         = useState("");
  const [keywords,     setKeywords]     = useState<string[]>([]);
  const [matchType,    setMatchType]    = useState<MatchType>("exact");
  const [listenerType, setListenerType] = useState<ListenerType>("fixed_message");
  const [message,      setMessage]      = useState("");
  const [publicReply,  setPublicReply]  = useState("");
  const [aiConfig,     setAiConfig]     = useState<AiConfig>({ language: "hinglish", tone: "", businessDescription: "", faqs: [], paymentLink: "", escalationPhrase: "" });
  const [dripEnabled,  setDripEnabled]  = useState(false);
  const [dripSteps,    setDripSteps]    = useState<DripStep[]>([]);
  const [stopOnReply,  setStopOnReply]  = useState(true);
  const [submitting,   setSubmitting]   = useState(false);

  function updateAiConfig(partial: Partial<AiConfig>) { setAiConfig((prev) => ({ ...prev, ...partial })); }

  async function handleSubmit() {
    if (!triggerType) return;
    setSubmitting(true);
    try {
      await createAuto({
        name: name.trim(),
        channel: triggerType === "wa_message" ? "whatsapp" : "instagram",
        trigger: { type: triggerType, keywords, keywordMatchType: matchType, ...(isComment(triggerType) && selectedPost ? { igPostIds: [selectedPost] } : {}) },
        listener: {
          type: listenerType,
          ...(listenerType === "fixed_message"
            ? { message: { text: message, mediaType: "none" as const, ...(isComment(triggerType) && publicReply.trim() ? { igPublicReply: publicReply.trim() } : {}) } }
            : { aiConfig: { language: aiConfig.language, tone: aiConfig.tone, businessDescription: aiConfig.businessDescription, faqs: aiConfig.faqs.filter((f) => f.question && f.answer), paymentLink: aiConfig.paymentLink || undefined, escalationPhrase: aiConfig.escalationPhrase || undefined }, ...(isComment(triggerType) && publicReply.trim() ? { message: { igPublicReply: publicReply.trim(), mediaType: "none" as const } } : {}) }
          ),
        },
        ...(dripEnabled && dripSteps.length > 0 ? { drip: { enabled: true, steps: dripSteps, stopOnReply, stopKeywords: ["STOP", "stop"] } } : {}),
      });
      toast.success("Automation is live!");
      router.push("/automations");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Something went wrong. Please try again.");
    } finally { setSubmitting(false); }
  }

  function step4Next() { isPaid ? next() : handleSubmit(); }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 28px 80px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => router.push("/automations")} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", marginBottom: 18, padding: 0, letterSpacing: "-0.005em" }}>
          <ArrowLeft size={13} /> Automations
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink-1)", letterSpacing: "-0.03em", marginBottom: 3 }}>
          New automation
        </h1>
        <p style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "-0.005em" }}>
          Step {displayStep(step)} of {maxStep} — {stepTitle(step, triggerType)}
        </p>
      </div>

      <WizardStepper currentStep={displayStep(step)} maxStep={maxStep} />

      {/* Step card */}
      <div style={{ background: "var(--bg)", border: "0.5px solid var(--rule-md)", borderRadius: 14, padding: "24px" }}>
        {step === 1 && <Step1Trigger triggerType={triggerType} plan={plan} igConnected={igConnected} waConnected={waConnected} onSelect={setTriggerType} onNext={next} />}
        {step === 2 && isComment(triggerType) && <Step2Post selectedPostId={selectedPost} onSelect={setSelectedPost} onBack={prev} onNext={next} />}
        {step === 3 && triggerType && <Step3Keyword name={name} keywords={keywords} matchType={matchType} plan={plan} triggerType={triggerType} onName={setName} onKeywords={setKeywords} onMatchType={setMatchType} onBack={prev} onNext={next} />}
        {step === 4 && triggerType && <Step4Reply listenerType={listenerType} message={message} publicReply={publicReply} aiConfig={aiConfig} plan={plan} triggerType={triggerType} onType={setListenerType} onMessage={setMessage} onPublicReply={setPublicReply} onAiConfig={updateAiConfig} onBack={prev} onNext={step4Next} />}
        {step === 5 && triggerType && <Step5Drip enabled={dripEnabled} steps={dripSteps} stopOnReply={stopOnReply} plan={plan} submitting={submitting} onToggle={setDripEnabled} onSteps={setDripSteps} onStopOnReply={setStopOnReply} onBack={prev} onSubmit={handleSubmit} />}
      </div>

      {plan === "starter" && (
        <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 9, background: "var(--accent-muted)", border: "0.5px solid var(--accent-border)" }}>
          <p style={{ fontSize: 12, color: "var(--accent)", lineHeight: 1.55, letterSpacing: "-0.005em" }}>
            Free plan: 5 automations · Instagram only · 1 keyword · no drip.{" "}
            <button onClick={() => router.push("/settings")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 12, fontWeight: 600, padding: 0, textDecoration: "underline" }}>
              Upgrade to Creator
            </button>{" "}
            for WhatsApp, multiple keywords, and drip sequences.
          </p>
        </div>
      )}
    </div>
  );
}