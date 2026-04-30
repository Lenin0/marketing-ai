import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAIProvider, CompletionOptions } from "../contract/contractAI";
import { IImageProvider, ImageOptions } from "../contract/contractImage";

const TEMPERATURE_MAP = {
  none:   0.0,
  low:    0.3,
  medium: 0.7,
  high:   1.2,
} satisfies Record<NonNullable<CompletionOptions["creativity"]>, number>;

export class GeminiAdapter implements IAIProvider, IImageProvider {
  constructor(private readonly client: GoogleGenerativeAI) {}

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const model = this.client.getGenerativeModel({ 
      model: options?.model ?? "gemini-1.5-flash" 
    });

    const { response } = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: options?.maxTokens ?? 1024,
        temperature: options?.creativity 
          ? TEMPERATURE_MAP[options.creativity] 
          : TEMPERATURE_MAP.medium,
      },
    });

    const text = response.text();

    if (!text) {
      throw new Error("GeminiAdapter: no content in response");
    }

    return text;
  }

  async generateImage(prompt: string, options?: ImageOptions): Promise<string> {
    const model = this.client.getGenerativeModel({ 
      model: options?.model ?? "gemini-3-flash-image" 
    });
    const { response } = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        candidateCount: 1,
      }
    });
  
    const imagePart = response.candidates?.[0]?.content.parts.find(part => part.inlineData);
  
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("GeminiAdapter: No image data returned in response");
    }
  
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }
}