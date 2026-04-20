import { createGoogleGenerativeAI } from "@ai-sdk/google";

/* ─── Model IDs ──────────────────────────────────────────── */
export const MODELS = {
  default: "gemini-2.0-flash",
  premium: "gemini-2.0-flash",
} as const;

/* ─── Provider factory ───────────────────────────────────── */
export function gemini() {
  return createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY ?? "",
  });
}

/* ─── System prompt compiler ─────────────────────────────── */
export function compileSystemPrompt(aiConfig: {
  language:             string;
  tone:                 string;
  businessDescription:  string;
  faqs:                 { question: string; answer: string }[];
  paymentLink?:         string;
  discountInstruction?: string;
  escalationPhrase?:    string;
}): string {
  const langInstructions: Record<string, string> = {
    english:  "Reply only in English. Be clear, professional, and friendly.",
    hindi:    "Reply only in Hindi using Devanagari script. Be warm and helpful.",
    hinglish: "Reply in Hinglish — a natural mix of Hindi and English written in Roman script. This is how most Indian people text. Example: 'Yaar, aapka program bahut accha hai! Price sirf Rs. 4,999 hai.' Keep it conversational and warm.",
    tamil:    "Reply only in Tamil using Tamil script. Be warm and professional.",
    telugu:   "Reply only in Telugu using Telugu script. Be warm and professional.",
    marathi:  "Reply only in Marathi using Marathi script. Be warm and helpful.",
  };

  const langInstruction = langInstructions[aiConfig.language] ?? langInstructions.hinglish;

  const faqSection = aiConfig.faqs.length > 0
    ? `\n\nFREQUENTLY ASKED QUESTIONS — answer these accurately:\n${aiConfig.faqs.map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join("\n")}`
    : "";

  const paymentSection = aiConfig.paymentLink
    ? `\n\nPAYMENT LINK: When the lead confirms they want to buy or asks how to pay, share this link: ${aiConfig.paymentLink}`
    : "";

  const discountSection = aiConfig.discountInstruction
    ? `\n\nDISCOUNT HANDLING: ${aiConfig.discountInstruction}`
    : "";

  const escalationSection = aiConfig.escalationPhrase
    ? `\n\nHUMAN ESCALATION: If the lead says "${aiConfig.escalationPhrase}", tell them you are connecting them with the owner and stop the conversation.`
    : "";

  return `You are a sales assistant for the following business:

${aiConfig.businessDescription}

LANGUAGE: ${langInstruction}

TONE: ${aiConfig.tone}

YOUR JOB:
- Answer questions about the business, product, or service accurately
- Handle price objections naturally and empathetically
- Qualify the lead by understanding their needs
- Guide interested leads toward making a purchase
- Keep responses concise — this is a WhatsApp/Instagram DM conversation, not an email
- Never make up information not provided to you
- If you don't know something, say you'll check and get back to them${faqSection}${paymentSection}${discountSection}${escalationSection}

IMPORTANT: Keep replies short (2-4 sentences max). This is a chat conversation. Be human, warm, and helpful.`;
}

/* ─── Message types ──────────────────────────────────────── */
export type ChatMessage = {
  role:    "system" | "user" | "assistant";
  content: string;
};

/* ─── Message history builder ────────────────────────────── */
export function buildMessageHistory(
  systemPrompt: string,
  messages: { role: string; messageText: string }[],
  maxMessages: number,
): ChatMessage[] {
  const history = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-maxMessages)
    .map((m): ChatMessage => ({
      role:    m.role as "user" | "assistant",
      content: m.messageText,
    }));

  return [
    { role: "system", content: systemPrompt },
    ...history,
  ];
}