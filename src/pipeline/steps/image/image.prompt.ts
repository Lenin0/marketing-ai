import { PipelineContext } from "../../PipelineContext";

export const buildImagePrompt = (ctx: PipelineContext) => {
  const { analysedBriefing, generatedCopy } = ctx;

  return `
  You are a specialized Visual Prompt Engineer for AI Image Generation (like DALL-E or Midjourney).
  Based on the marketing copy and strategic analysis below, create a highly detailed visual prompt.
  Respond ONLY with the final prompt string — no explanations.

  STRATEGIC CONTEXT:
  - Product: ${analysedBriefing?.product}
  - Target Audience: ${analysedBriefing?.audience}
  - Tone: ${analysedBriefing?.tone}

  THE COPY CONTENT:
  - Title: ${generatedCopy?.title}
  - Hook: ${generatedCopy?.hook}
  - Body: ${generatedCopy?.body}

  INSTRUCTIONS FOR THE VISUAL PROMPT:
  - Describe the scene, lighting, and style (e.g., photorealistic, 3D render, minimalist).
  - Ensure the mood matches the tone: ${analysedBriefing?.tone}.
  - Avoid text inside the image.
  - Focus on professional commercial photography aesthetics.
  `.trim();
};