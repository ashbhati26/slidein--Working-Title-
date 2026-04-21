import { Shield } from "lucide-react";

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

export function PrivacyContent() {
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
          <Shield size={12} color="var(--accent)" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--accent)",
              letterSpacing: "0.01em",
            }}
          >
            Privacy Policy
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
          Your privacy matters to us
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
          Svation is built for Indian creators and business owners. We collect
          only what we need to make your automations work — nothing more.
        </p>
        <p style={{ fontSize: 12, color: "var(--ink-3)" }}>
          Last updated: April 2026 · Operated by Script Valley
        </p>
      </div>

      <div
        style={{
          height: "0.5px",
          background: "var(--rule-md)",
          marginBottom: 44,
        }}
      />

      <Section title="1. Who we are">
        <P>
          Svation is a WhatsApp and Instagram automation platform operated by
          Script Valley, based in India. We help creators and business owners
          automatically respond to DMs and comments using keyword triggers, drip
          sequences, and AI-powered conversations.
        </P>
        <P>
          For privacy questions:{" "}
          <a
            href="mailto:privacy@Svation.com"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            privacy@Svation.com
          </a>
        </P>
      </Section>

      <Section title="2. What data we collect">
        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Account information
          </strong>
        </P>
        <Ul
          items={[
            "Your name and email address (via Google OAuth or email signup through Clerk)",
            "Your profile photo (from Google, if you use Google Sign-In)",
            "Your Clerk user ID for authentication",
          ]}
        />

        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Instagram connection data
          </strong>
        </P>
        <Ul
          items={[
            "Your Instagram username, profile picture, and numeric user ID",
            "An access token from Meta allowing Svation to send DMs and reply to comments on your behalf",
            "Token expiry date so we can remind you to reconnect before it expires",
          ]}
        />

        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            WhatsApp connection data
          </strong>
        </P>
        <Ul
          items={[
            "Your WhatsApp Business phone number ID and display number",
            "Your WhatsApp Business Account (WABA) ID",
            "A permanent system user access token issued by Meta",
          ]}
        />

        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Lead and conversation data
          </strong>
        </P>
        <Ul
          items={[
            "Sender ID of people who trigger your automations (Instagram user ID or WhatsApp number)",
            "Messages exchanged in conversations — inbound from leads, outbound from your automation or AI",
            "Lead status, drip sequence progress, and AI session state",
          ]}
        />

        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Automation configuration
          </strong>
        </P>
        <Ul
          items={[
            "Your automation names, keywords, reply messages, drip steps, and AI configuration",
            "Your business description and FAQs used to train the AI chatbot",
            "Payment links you choose to share through the AI",
          ]}
        />

        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            Usage and billing data
          </strong>
        </P>
        <Ul
          items={[
            "Number of automations created and leads captured per billing period",
            "Razorpay subscription ID and customer ID for billing",
            "Webhook logs from Meta for debugging and compliance",
          ]}
        />
      </Section>

      <Section title="3. How we use your data">
        <P>We use your data exclusively to provide and improve Svation:</P>
        <Ul
          items={[
            "To authenticate you and manage your account",
            "To connect to your Instagram and WhatsApp accounts via the Meta API",
            "To detect keyword triggers and fire your automations",
            "To send automated replies, drip messages, and AI responses on your behalf",
            "To track leads, conversation history, and automation stats in your dashboard",
            "To process subscription payments through Razorpay",
            "To send transactional emails about your account",
          ]}
        />
        <P>
          <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            We do not sell your data.
          </strong>{" "}
          We do not use your data for advertising. We do not share your data
          with third parties except as described in Section 5.
        </P>
      </Section>

      <Section title="4. How the AI chatbot works">
        <P>
          When you enable Smart AI, Svation sends your business description,
          FAQs, tone, and the lead's conversation history to Google Gemini to
          generate a reply. Google processes this data under its own privacy
          policy. We do not use your conversation data to train any AI model. AI
          sessions expire after 30 days of inactivity.
        </P>
      </Section>

      <Section title="5. Data sharing">
        <P>We share your data only with these providers to operate Svation:</P>
        <Ul
          items={[
            "Clerk — authentication and session management",
            "Convex — database, backend functions, and file storage",
            "Vercel — hosting and deployment",
            "Google Gemini — AI chatbot responses (Smart AI plan only)",
            "Meta — to send and receive messages via WhatsApp Cloud API and Instagram Graph API",
            "Razorpay — subscription billing and payment processing",
          ]}
        />
        <P>We do not share your data with any other third parties.</P>
      </Section>

      <Section title="6. Meta platform data">
        <P>
          By connecting your Instagram or WhatsApp account to Svation, you
          authorise us to receive webhook events when someone messages or
          comments, send DMs and replies on your behalf, and read your Instagram
          posts to select which post to attach an automation to.
        </P>
        <P>
          You can revoke Svation's access from Instagram Settings → Apps and
          Websites at any time. For WhatsApp, disconnect from Svation Settings →
          WhatsApp.
        </P>
      </Section>

      <Section title="7. Data retention">
        <Ul
          items={[
            "Account data: retained until you delete your account",
            "Lead and conversation data: retained for 12 months from the last message, then deleted",
            "AI conversation sessions: archived after 30 days of inactivity",
            "Webhook logs: retained for 30 days for debugging, then deleted",
            "Billing data: retained as required by Indian tax law (7 years)",
          ]}
        />
      </Section>

      <Section title="8. Your rights">
        <P>
          You have the right to access, correct, delete, or export your data. To
          exercise any right, email{" "}
          <a
            href="mailto:privacy@Svation.com"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            privacy@Svation.com
          </a>
          . We respond within 7 business days.
        </P>
      </Section>

      <Section title="9. Security">
        <P>
          All data is encrypted in transit using TLS. Access tokens are stored
          in Convex's encrypted database. We do not expose your Meta access
          tokens in any client-side code or logs. To report a security
          vulnerability:{" "}
          <a
            href="mailto:security@Svation.com"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            security@Svation.com
          </a>
        </P>
      </Section>

      <Section title="10. Children's privacy">
        <P>
          Svation is not intended for anyone under 18. If you believe a minor
          has created an account, contact privacy@Svation.com and we will delete
          it promptly.
        </P>
      </Section>

      <Section title="11. Changes to this policy">
        <P>
          When we make significant changes, we will notify you by email and
          display a notice in the Svation dashboard. Continued use after changes
          constitutes acceptance.
        </P>
      </Section>

      <Section title="12. Contact">
        <Ul
          items={[
            "Email: privacy@Svation.com",
            "Company: Script Valley",
            "Country: India",
          ]}
        />
      </Section>
    </div>
  );
}
