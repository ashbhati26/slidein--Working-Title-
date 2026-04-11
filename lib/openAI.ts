import { createOpenAI } from "@ai-sdk/openai";
import { AI_MAX_TOKENS, AI_TEMPERATURE } from "./constants";

/* ─── OpenAI client ───────────────────────────────────────── */
/* Lazy client — process.env read inside handler, not at module level */
export const getOpenAIClient = () =>
  createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* Convenience alias for direct use inside Convex actions */
export const openai = getOpenAIClient;

export const MODELS = {
  default: "gpt-4o-mini",
  premium: "gpt-4o",
} as const;

export type OpenAIModel = (typeof MODELS)[keyof typeof MODELS];

/* ─── Language instruction map ────────────────────────────── */
const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  english:
    "Always respond in clear, natural English only.",
  hindi:
    "हमेशा शुद्ध हिंदी में जवाब दें। देवनागरी लिपि का उपयोग करें। अंग्रेज़ी शब्दों का उपयोग न करें।",
  hinglish:
    "Always respond in Hinglish — a natural mix of Hindi and English the way Indians actually text. Use Roman script for Hindi words. Example tone: 'Yaar, program ka price sirf Rs. 4,999 hai! Kya aap serious hain results ke liye?'",
  tamil:
    "எப்போதும் தமிழில் மட்டுமே பதில் அளிக்கவும். இயற்கையான, உரையாடல் தமிழ் பயன்படுத்தவும்.",
  telugu:
    "ఎల్లప్పుడూ తెలుగులో మాత్రమే సమాధానం ఇవ్వండి. సహజమైన, సంభాషణాత్మక తెలుగు ఉపయోగించండి.",
  marathi:
    "नेहमी मराठीत उत्तर द्या. नैसर्गिक, संवादात्मक मराठी वापरा.",
};

/* ─── System prompt compiler ──────────────────────────────── */
export interface AiConfig {
  language: string;
  tone: string;
  businessDescription: string;
  faqs: Array<{ question: string; answer: string }>;
  paymentLink?: string;
  discountInstruction?: string;
  escalationPhrase?: string;
}

export function compileSystemPrompt(config: AiConfig): string {
  const languageInstruction =
    LANGUAGE_INSTRUCTIONS[config.language] ?? LANGUAGE_INSTRUCTIONS["hinglish"];

  const faqBlock =
    config.faqs.length > 0
      ? `\n\nFREQUENTLY ASKED QUESTIONS — answer these accurately:\n${config.faqs
          .map((f, i) => `Q${i + 1}: ${f.question}\nA${i + 1}: ${f.answer}`)
          .join("\n\n")}`
      : "";

  const paymentBlock = config.paymentLink
    ? `\n\nWHEN THE CUSTOMER IS READY TO BUY: Share this payment link: ${config.paymentLink}\nOnly share this link when the customer clearly says they want to enroll, buy, or proceed.`
    : "";

  const discountBlock = config.discountInstruction
    ? `\n\nWHEN THE CUSTOMER ASKS FOR A DISCOUNT OR SAYS IT'S TOO EXPENSIVE: ${config.discountInstruction}`
    : "";

  const escalationBlock = config.escalationPhrase
    ? `\n\nWHEN THE CUSTOMER SAYS "${config.escalationPhrase}": Tell them the owner will get back to them shortly, then stop responding.`
    : "";

  return `You are a sales assistant for the following business:

${config.businessDescription}

YOUR TONE: ${config.tone}

LANGUAGE RULE (highest priority — never break this):
${languageInstruction}

CORE BEHAVIOUR:
- Keep responses short — 2 to 4 sentences maximum per reply.
- Never use bullet points or markdown. Write the way people text on WhatsApp.
- Be warm, helpful, and human. Never sound like a robot or a corporate FAQ page.
- If you don't know the answer, say you'll check and ask if you can help with anything else.
- Never make up prices, dates, or promises not in your instructions.
- Never discuss competitors.
- Collect the customer's name naturally during conversation if not already known.${faqBlock}${paymentBlock}${discountBlock}${escalationBlock}

Remember: You represent a real Indian business. Every reply should feel like it came from a helpful, knowledgeable team member — not a chatbot.`;
}

/* ─── Build OpenAI message history from stored conversation ── */
export interface StoredMessage {
  role: "user" | "assistant" | "system";
  messageText: string;
}

export function buildMessageHistory(
  systemPrompt: string,
  messages: StoredMessage[],
  maxMessages = 50
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const history: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: systemPrompt }];

  const recent = messages
    .filter((m) => m.role !== "system")
    .slice(-maxMessages);

  for (const msg of recent) {
    if (msg.role === "user" || msg.role === "assistant") {
      history.push({ role: msg.role, content: msg.messageText });
    }
  }

  return history;
}