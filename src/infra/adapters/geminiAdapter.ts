import { GoogleGenAI } from "@google/genai";
import type { IAIProvider, CompletionOptions } from "../contract/ai.contract";
import type {
  IImageProvider,
  ImageOptions,
} from "../contract/imageAI.contract";

const TEMPERATURE_MAP = {
  none: 0.0,
  low: 0.3,
  medium: 0.7,
  high: 1.0,
} satisfies Record<NonNullable<CompletionOptions["creativity"]>, number>;

export class GeminiAdapter implements IAIProvider, IImageProvider {
  constructor(private readonly client: GoogleGenAI) {}

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    console.log("text prompt:", prompt)
    try {
      const modelName = options?.model ?? "gemini-2.5-flash";
      const result = await this.client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          maxOutputTokens: options?.maxTokens ?? 2048,
          temperature: options?.creativity
            ? TEMPERATURE_MAP[options.creativity]
            : TEMPERATURE_MAP.medium,
        },
      });

      const text = result.text;

      if (!text) {
        throw new Error("GeminiAdapter: no content in response");
      }

      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async generateImage(prompt: string, options?: ImageOptions): Promise<string> {
    console.log("image prompt:", prompt)
    try {
      const modelName = options?.model ?? "gemini-3.1-flash-image-preview";
      const result = await this.client.models.generateContent({
        model: modelName,
        contents: [prompt],
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: options?.aspectRatio ?? "1:1",
          },
        },
      });

      const part = result.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData
      );

      if (!part || !part.inlineData) {
        throw new Error("GeminiAdapter: No image was generated");
      }

      return `data:image/png;base64,${part.inlineData.data}`;
    } catch (error) {
      console.error("Gemini Image API Error:", error);
      throw error;
    }
  }
}
