import OpenAI from "openai";
import { IAIProvider, CompletionOptions } from "../contract/ai.contract";
import { IImageProvider, ImageOptions } from "../contract/imageAI.contract";

const TEMPERATURE_MAP = {
  none: 0.0,
  low: 0.3,
  medium: 0.7,
  high: 1.2,
} satisfies Record<NonNullable<CompletionOptions["creativity"]>, number>;

export class OpenAIAdapter implements IAIProvider, IImageProvider {
  constructor(private readonly client: OpenAI) {}

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options?.model ?? "gpt-4o",
      max_tokens: options?.maxTokens ?? 1024,
      ...(options?.creativity && {
        temperature:
          TEMPERATURE_MAP[options.creativity as keyof typeof TEMPERATURE_MAP],
      }),
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("OpenAIAdapter: no content in response");
    }

    return content;
  }

  async generateImage(prompt: string, options?: ImageOptions): Promise<string> {
    const response = await this.client.images.generate({
      model: options?.model ?? "dall-e-3",
      prompt,
      n: 1,
      size: options?.size ?? "1024x1024",
      quality: options?.quality ?? "standard",
      style: options?.style ?? "vivid",
    });
    const url = response.data?.[0]?.url;
    if (!url) {
      throw new Error("OpenAIAdapter: no image URL in response");
    }

    return url;
  }
}
