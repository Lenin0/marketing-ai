import type { PipelineContext } from "../../PipelineContext";

export const buildAnalysePrompt = (ctx: PipelineContext): string => {
  return `You are a marketing strategist. Analyse the briefing below and extract
structured information. Respond ONLY with a valid JSON object — no markdown,
no explanation, no extra text.

BRIEFING:
${ctx.briefing}

CHANNEL: ${ctx.channel}

BRAND PROFILE:
- Company: ${ctx.clientProfile.companyName}
- Voice: ${ctx.clientProfile.voiceDescription}
${ctx.clientProfile.colors ? `- Colors: ${ctx.clientProfile.colors.join(", ")}` : ""}

REQUIRED JSON SCHEMA:
{
  "product": "product name and one-line description",
  "keyBenefit": "the single most important benefit to highlight",
  "audience": "who is this for, be specific",
  "tone": "one of: technical | emotional | direct | inspirational",
  "goal": "one of: awareness | conversion | retention | education",
  "keywords": ["up to 5 keywords relevant to the product"]
}`;
};
