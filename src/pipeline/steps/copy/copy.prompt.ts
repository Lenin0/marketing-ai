import { PipelineContext } from "../../PipelineContext";

export const buildCopyPrompt = (ctx: PipelineContext) => {
  const { analysedBriefing, channel } = ctx;

  return `
  You are an expert copywriter for ${channel}.
  Use the strategic analysis below to create a high-converting post.
  Respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.
  
  PRODUCT: ${analysedBriefing?.product}
  TARGET AUDIENCE: ${analysedBriefing?.audience}
  TONE OF VOICE: ${analysedBriefing?.tone}
  GOAL: ${analysedBriefing?.goal}
  KEYWORDS: ${analysedBriefing?.keywords.join(", ")}
  
  REQUIRED JSON SCHEMA:
  {
    "title": "post title",
    "hook": "opening line to grab attention",
    "body": "main post content",
    "cta": "call to action focused on ${analysedBriefing?.goal}",
    "hashtags": ["up to 5 relevant hashtags"]
  }
  
  RULES:
  - The CTA must be focused on ${analysedBriefing?.goal}.
  - Use psychological triggers aligned with the tone ${analysedBriefing?.tone}.
    `.trim();
};
