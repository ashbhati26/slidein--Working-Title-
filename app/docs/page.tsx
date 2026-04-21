"use client";

import { Book } from "lucide-react";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} style={{ marginBottom: 48, scrollMarginTop: 80 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "var(--ink-1)",
          letterSpacing: "-0.02em",
          marginBottom: 16,
          paddingBottom: 12,
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

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          flexShrink: 0,
          background: "var(--accent-muted)",
          border: "0.5px solid var(--accent-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--accent)",
          marginTop: 2,
        }}
      >
        {n}
      </div>
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink-1)",
            marginBottom: 4,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </p>
        <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "11px 14px",
        borderRadius: 9,
        background: "var(--accent-muted)",
        border: "0.5px solid var(--accent-border)",
        marginBottom: 16,
      }}
    >
      <p style={{ fontSize: 12, color: "var(--accent)", lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontSize: 11,
        fontFamily: "monospace",
        background: "var(--bg-subtle)",
        border: "0.5px solid var(--rule-md)",
        borderRadius: 5,
        padding: "1px 6px",
        color: "var(--ink-1)",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </code>
  );
}

const NAV = [
  { id: "getting-started", label: "Getting started" },
  { id: "instagram-setup", label: "Instagram setup" },
  { id: "whatsapp-setup", label: "WhatsApp setup" },
  { id: "create-automation", label: "Create automation" },
  { id: "smart-ai", label: "Smart AI" },
  { id: "drip-sequences", label: "Drip sequences" },
  { id: "leads", label: "Leads dashboard" },
  { id: "faq", label: "FAQ" },
];

export default function DocsPage() {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "52px 28px 96px",
        display: "flex",
        gap: 60,
      }}
    >
      {/* Sidebar nav — CSS hover, no JS handlers */}
      <aside
        style={{
          width: 180,
          flexShrink: 0,
          position: "sticky",
          top: 80,
          alignSelf: "flex-start",
        }}
        className="docs-sidebar"
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--ink-3)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          On this page
        </p>
        {NAV.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="docs-nav-link">
            {item.label}
          </a>
        ))}
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
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
            <Book size={12} color="var(--accent)" />
            <span
              style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)" }}
            >
              Documentation
            </span>
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "var(--ink-1)",
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            Svation Documentation
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--ink-3)",
              lineHeight: 1.7,
              maxWidth: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Everything you need to set up automations, connect channels, and
            start capturing leads in under 2 minutes.
          </p>
        </div>

        <div
          style={{
            height: "0.5px",
            background: "var(--rule-md)",
            marginBottom: 44,
          }}
        />

        <Section id="getting-started" title="Getting started">
          <p style={{ marginBottom: 16 }}>
            Svation has three steps to go live: create an account, connect a
            channel, and create your first automation. The whole process takes
            under 5 minutes.
          </p>
          <Step n={1} title="Create your account">
            Go to{" "}
            <a href="/" className="docs-link">
              Svation.com
            </a>{" "}
            and click <strong>Get started free</strong>. Sign up with Google or
            your email. Email verification is required for email signups.
          </Step>
          <Step n={2} title="Connect a channel">
            Go to <strong>Settings</strong> and connect Instagram, WhatsApp, or
            both. Instagram is the fastest — no Facebook Page required.
          </Step>
          <Step n={3} title="Create your first automation">
            Go to <strong>Automations → New automation</strong>. Follow the 4–5
            step wizard to set your keyword, reply message, and go live.
          </Step>
        </Section>

        <Section id="instagram-setup" title="Instagram setup">
          <Note>
            Your Instagram account must be a Business or Creator account — not
            Personal. Switch in 30 seconds: Instagram → Profile → ☰ → Settings
            → Account → Switch to Professional Account.
          </Note>
          <Step n={1} title="Go to Settings → Instagram">
            Click <strong>Connect Instagram</strong>. You'll be redirected to
            Instagram's login page.
          </Step>
          <Step n={2} title="Log in with your Instagram credentials">
            Enter your Instagram username and password. Svation requests three
            permissions: read profile, manage messages, manage comments.
          </Step>
          <Step n={3} title="You're connected">
            You'll be redirected back with your account connected. Your username
            and profile picture appear in Settings.
          </Step>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 8 }}>
            <strong style={{ color: "var(--ink-2)", fontWeight: 500 }}>
              Token expiry:
            </strong>{" "}
            Instagram tokens expire every 60 days. Svation auto-refreshes them.
            You'll get a warning if manual reconnect is needed.
          </p>
        </Section>

        <Section id="whatsapp-setup" title="WhatsApp setup">
          <Note>
            WhatsApp requires Creator plan (₹999/month). You need a number not
            already on personal WhatsApp — a dedicated SIM costs ₹0–50.
          </Note>
          <Step n={1} title="Create a Meta Developer app">
            Go to{" "}
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="docs-link"
            >
              developers.facebook.com
            </a>{" "}
            → My Apps → Create App → type: Business. Add the WhatsApp product.
          </Step>
          <Step n={2} title="Get your Phone Number ID and WABA ID">
            In your app → WhatsApp → API Setup. Copy the{" "}
            <Code>Phone Number ID</Code> and{" "}
            <Code>WhatsApp Business Account ID</Code>.
          </Step>
          <Step n={3} title="Generate a permanent access token">
            Business Manager → Settings → System Users → Add → Generate Token.
            Add <Code>whatsapp_business_messaging</Code> permission.
          </Step>
          <Step n={4} title="Enter credentials in Svation">
            Settings → WhatsApp → Enter credentials. Paste all four values and
            click Connect.
          </Step>
          <Step n={5} title="Configure your webhook">
            In Meta Developer Dashboard → WhatsApp → Configuration → set webhook
            URL to your Svation webhook URL (shown in Settings). Subscribe to{" "}
            <Code>messages</Code> field.
          </Step>
        </Section>

        <Section id="create-automation" title="Creating your first automation">
          <p style={{ marginBottom: 16 }}>
            An automation has three parts: a <strong>trigger</strong> (keyword),
            a <strong>reply</strong> (what to send), and an optional{" "}
            <strong>drip</strong> (follow-ups).
          </p>
          <Step n={1} title="Choose a trigger type">
            <strong>Instagram Comment</strong> — fires when someone comments
            your keyword on a post or reel.
            <br />
            <strong>Instagram DM</strong> — fires when someone DMs your account
            with the keyword.
            <br />
            <strong>WhatsApp Message</strong> — fires when someone messages your
            WhatsApp number.
          </Step>
          <Step n={2} title="Set your keyword">
            Keywords are uppercase by default: <Code>PRICE</Code>,{" "}
            <Code>FIT</Code>, <Code>COURSE</Code>. On paid plans, add multiple
            keywords and choose Exact, Contains, or Fuzzy match.
          </Step>
          <Step n={3} title="Write your reply">
            Choose <strong>Fixed reply</strong> for a pre-written message, or{" "}
            <strong>Smart AI</strong> for a full AI conversation in your chosen
            language.
          </Step>
          <Step n={4} title="Add drip (optional)">
            On Creator and Smart AI plans, add timed follow-up messages.
            Example: 24h "Still interested?", 48h "Only 5 spots left."
          </Step>
        </Section>

        <Section id="smart-ai" title="Smart AI">
          <p style={{ marginBottom: 16 }}>
            Smart AI (Smart AI plan) uses Google Gemini to handle full sales
            conversations in Hinglish, Hindi, English, Tamil, Telugu, or
            Marathi.
          </p>
          <Step n={1} title="Describe your business">
            Clear description of what you sell, pricing, and what's included.
            Example:{" "}
            <em>
              "3-month online fitness program. Meal plan, workout videos, weekly
              calls. ₹4,999."
            </em>
          </Step>
          <Step n={2} title="Set the AI tone">
            Example:{" "}
            <em>
              "Friendly and motivating, like a coach talking to a student. Use
              Hinglish naturally."
            </em>
          </Step>
          <Step n={3} title="Add FAQs (optional)">
            Up to 5 common questions and answers. The AI uses these to answer
            accurately.
          </Step>
          <Step n={4} title="Add a payment link (optional)">
            The AI shares this automatically when it detects strong buying
            intent.
          </Step>
          <Step n={5} title="Set an escalation phrase (optional)">
            When a lead sends this phrase (e.g. <Code>talk to owner</Code>), the
            AI pauses and you get notified.
          </Step>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
            AI sessions expire after 30 days of inactivity. Conversation history
            is always included so context is never lost.
          </p>
        </Section>

        <Section id="drip-sequences" title="Drip sequences">
          <p style={{ marginBottom: 12 }}>
            A drip is a series of time-delayed follow-up messages. Drip stops
            the moment a lead replies.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
              Message costs:
            </strong>{" "}
            Messages within 24 hours are free. Messages after 24 hours cost
            ~₹0.13 each (Meta template messages).
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
              Recommended sequence:
            </strong>
          </p>
          <ul style={{ paddingLeft: 18 }}>
            <li style={{ marginBottom: 6 }}>
              Immediately: Send brochure or price details
            </li>
            <li style={{ marginBottom: 6 }}>
              24h: "Did you get a chance to check the program?"
            </li>
            <li style={{ marginBottom: 6 }}>
              48h: "Only 5 spots left in this batch."
            </li>
            <li style={{ marginBottom: 6 }}>
              72h: "Last chance — price increases after today."
            </li>
          </ul>
        </Section>

        <Section id="leads" title="Leads dashboard">
          <p style={{ marginBottom: 12 }}>
            Every person who triggers an automation becomes a lead. The Leads
            page shows a two-panel layout — list on the left, conversation on
            the right.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
              Lead statuses:
            </strong>{" "}
            New → In conversation → Qualified → Converted (or Lost / Opted out).
            Update manually from the conversation panel.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
              Manual reply:
            </strong>{" "}
            Type in the reply box at the bottom. Press ⌘+Enter or click Send. If
            AI is active, click <strong>Take over</strong> first.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong style={{ color: "var(--ink-1)", fontWeight: 500 }}>
              24-hour window:
            </strong>{" "}
            Instagram allows free-form messages only within 24h of the lead's
            last message. A warning appears when the window is closed.
          </p>
        </Section>

        <Section id="faq" title="FAQ">
          {[
            {
              q: "Do I need a Facebook Page to connect Instagram?",
              a: "No. Svation uses the Instagram Login API — connect directly with your Instagram username and password. No Facebook Page required.",
            },
            {
              q: "Can I use a personal WhatsApp number?",
              a: "No. WhatsApp requires a number not registered on personal WhatsApp. Use a dedicated SIM. Jio and BSNL SIMs cost ₹0–50.",
            },
            {
              q: "What happens when a lead opts out?",
              a: "If a lead sends STOP, they are permanently excluded from all your automations.",
            },
            {
              q: "Can I connect multiple Instagram accounts?",
              a: "Currently one Instagram account per Svation account. Multi-account support is planned.",
            },
            {
              q: "What is the Instagram rate limit?",
              a: "Svation enforces a safe ceiling of 200 DMs per hour per automation to protect your account.",
            },
            {
              q: "Will AI respond in the middle of the night?",
              a: "Yes. AI responds 24/7. This is one of the main benefits — no leads are lost while you sleep.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              style={{
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: "0.5px solid var(--rule)",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink-1)",
                  marginBottom: 6,
                  letterSpacing: "-0.01em",
                }}
              >
                {q}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ink-3)",
                  lineHeight: 1.65,
                }}
              >
                {a}
              </p>
            </div>
          ))}
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
            Still have questions?{" "}
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="docs-link"
            >
              Chat on WhatsApp
            </a>
          </p>
        </Section>
      </div>

      <style>{`
        .docs-sidebar { display: none; }
        @media (min-width: 860px) { .docs-sidebar { display: block !important; } }
        .docs-nav-link {
          display: block; font-size: 12px; color: var(--ink-3);
          text-decoration: none; padding: 5px 0; letter-spacing: -0.005em;
          transition: color 0.1s ease;
        }
        .docs-nav-link:hover { color: var(--ink-1); }
        .docs-link { color: var(--accent); text-decoration: none; }
        .docs-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
