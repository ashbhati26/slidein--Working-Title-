import { FileText } from "lucide-react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--ink-1)",
          letterSpacing: "-0.015em",
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: "0.5px solid var(--rule)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 13,
          color: "var(--ink-2)",
          lineHeight: 1.8,
          letterSpacing: "-0.005em",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: 10 }}>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 5 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function TermsContent() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "52px 28px 96px" }}>
      {/* Header */}
      <div style={{ marginBottom: 44 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 12px",
            borderRadius: 99,
            background: "var(--accent-muted)",
            border: "0.5px solid var(--accent-border)",
            marginBottom: 18,
          }}
        >
          <FileText size={12} color="var(--accent)" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--accent)",
              letterSpacing: "0.01em",
            }}
          >
            Terms of Service
          </span>
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "var(--ink-1)",
            letterSpacing: "-0.04em",
            lineHeight: 1.15,
            marginBottom: 14,
          }}
        >
          Terms of Service
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--ink-3)",
            lineHeight: 1.7,
            maxWidth: 520,
            marginBottom: 14,
            letterSpacing: "-0.01em",
          }}
        >
          By using Svation, you agree to these terms. Written in plain language,
          not legalese.
        </p>
        <p style={{ fontSize: 12, color: "var(--ink-3)" }}>
          Last updated: April 2026 · Operated by Script Valley · India
        </p>
      </div>

      <div
        style={{
          height: "0.5px",
          background: "var(--rule-md)",
          marginBottom: 44,
        }}
      />

      <Section title="1. Acceptance of terms">
        <P>
          By creating a Svation account or using any part of the platform, you
          agree to these Terms and our Privacy Policy. If you do not agree, do
          not use Svation.
        </P>
        <P>
          Svation is operated by Script Valley, India. These terms constitute a
          legally binding agreement between you and Script Valley.
        </P>
      </Section>

      <Section title="2. What Svation does">
        <P>
          Svation is a messaging automation platform that connects to your
          Instagram and WhatsApp Business accounts to automatically respond to
          DMs and comments using keyword triggers, drip sequences, and an AI
          chatbot. Svation uses Meta's official APIs. By using Svation, you also
          agree to Meta's Terms of Service.
        </P>
      </Section>

      <Section title="3. Eligibility">
        <P>
          You may use Svation only if you are at least 18, have the legal
          authority to enter these terms, have a legitimate Instagram Business
          or Creator account or registered WhatsApp Business number, and your
          use complies with all applicable laws.
        </P>
      </Section>

      <Section title="4. Your account">
        <P>
          You are responsible for maintaining the security of your account
          credentials. You are fully responsible for all activity that occurs
          under your account. Notify us immediately at{" "}
          <a
            href="mailto:support@Svation.app"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            support@Svation.app
          </a>{" "}
          if you suspect unauthorised access.
        </P>
        <P>
          We may suspend or terminate your account if we detect fraudulent
          activity, abuse, or violation of these terms.
        </P>
      </Section>

      <Section title="5. Acceptable use">
        <P>You must not use Svation to:</P>
        <Ul
          items={[
            "Send spam or unsolicited bulk messages without recipient consent",
            "Harass, threaten, or abuse any person",
            "Impersonate any person, business, or organisation",
            "Promote illegal products or services",
            "Violate Meta's WhatsApp Business Policy or Instagram Platform Policy",
            "Attempt to bypass Meta's rate limits or spam filters",
            "Use the AI chatbot to provide medical, legal, or financial advice without disclaimers",
            "Reverse engineer or attempt to extract Svation's source code",
          ]}
        />
        <P>
          Violation may result in immediate account termination without refund.
        </P>
      </Section>

      <Section title="6. Meta platform compliance">
        <P>
          You are responsible for ensuring your use of Svation complies with
          Meta's WhatsApp Business Policy, Instagram's Platform Policy, Meta's
          24-hour messaging window rules, and India's Digital Personal Data
          Protection Act.
        </P>
        <P>
          If Meta suspends your WhatsApp or Instagram account due to your
          behaviour, Svation is not responsible and no refund will be issued.
        </P>
      </Section>

      <Section title="7. Plans and billing">
        <P>
          Svation offers three plans: Starter (free), Creator (₹999/month), and
          Smart AI (₹2,499/month).
        </P>
        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Payments
          </strong>{" "}
          are processed by Razorpay. By subscribing, you authorise recurring
          monthly charges to your payment method.
        </P>
        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Cancellation:
          </strong>{" "}
          Cancel anytime from Settings → Billing. Your plan stays active until
          the billing period ends. No partial refunds for unused days.
        </P>
        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Refunds:
          </strong>{" "}
          7-day refund on your first payment if Svation does not work as
          described. After 7 days, all payments are non-refundable. Email{" "}
          <a
            href="mailto:support@Svation.app"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            support@Svation.app
          </a>{" "}
          to request a refund.
        </P>
        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Price changes:
          </strong>{" "}
          30 days advance notice. Existing subscribers can cancel before the new
          price takes effect.
        </P>
      </Section>

      <Section title="8. WhatsApp message costs">
        <P>
          Drip messages outside the 24-hour window are sent as Meta-approved
          template messages. Meta charges approximately ₹0.13 per message to
          Indian numbers. Svation currently absorbs these costs. We reserve the
          right to introduce usage-based charges with 30 days notice.
        </P>
      </Section>

      <Section title="9. AI chatbot">
        <P>
          You are responsible for the accuracy of information you provide to
          train the AI, all messages sent by the AI on your behalf, and ensuring
          AI responses comply with applicable laws. Svation does not guarantee
          the accuracy of AI-generated responses.
        </P>
      </Section>

      <Section title="10. Intellectual property">
        <P>
          Svation and all its content are owned by Script Valley. You retain
          ownership of all content you create. By using Svation, you grant
          Script Valley a limited licence to store and process your content
          solely to provide the service.
        </P>
      </Section>

      <Section title="11. Data and privacy">
        <P>
          Your use of Svation is governed by our{" "}
          <a
            href="/privacy"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            Privacy Policy
          </a>
          , incorporated into these terms by reference. You are responsible for
          obtaining necessary consents from your leads.
        </P>
      </Section>

      <Section title="12. Limitation of liability">
        <P>
          To the maximum extent permitted by Indian law, Script Valley shall not
          be liable for indirect or consequential damages, loss of business or
          leads from downtime, actions taken by Meta affecting your accounts,
          inaccurate AI responses, or unauthorised account access.
        </P>
        <P>
          Our total liability shall not exceed the amount you paid us in the 3
          months before the claim arose.
        </P>
      </Section>

      <Section title="13. Disclaimers">
        <P>
          Svation is provided "as is" without warranties of any kind. We are not
          affiliated with, endorsed by, or in partnership with Meta, Google,
          Razorpay, or any other third-party service.
        </P>
      </Section>

      <Section title="14. Termination">
        <P>
          You may delete your account at any time from Settings. We may suspend
          or terminate your account for violations of these terms. Serious
          violations (spam, abuse, illegal activity) result in immediate
          termination without refund.
        </P>
      </Section>

      <Section title="15. Governing law">
        <P>
          These terms are governed by the laws of India. Disputes shall be
          subject to the exclusive jurisdiction of the courts of India.
        </P>
      </Section>

      <Section title="16. Changes to these terms">
        <P>
          We will notify you of significant changes by email and in-app notice
          at least 14 days before they take effect. Continued use constitutes
          acceptance.
        </P>
      </Section>

      <Section title="17. Contact">
        <Ul
          items={[
            "Email: support@Svation.app",
            "Company: Script Valley",
            "Country: India",
          ]}
        />
      </Section>
    </div>
  );
}
