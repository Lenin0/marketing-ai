import type Anthropic from "@anthropic-ai/sdk";
import { IAIProvider, CompletionOptions } from "../contract/contractAI";

const TOP_P_MAP = {
  none:   0.1,
  low:    0.7,
  medium: 0.9,
  high:   1.0,
} satisfies Record<NonNullable<CompletionOptions["creativity"]>, number>;

export class AnthropicAdapter implements IAIProvider {
  constructor(private readonly client: Anthropic) {}

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const response = await this.client.messages.create({
      model:      options?.model    ?? "claude-sonnet-4-6",
      max_tokens: options?.maxTokens ?? 1024,
      ...(options?.creativity && { top_p: TOP_P_MAP[options.creativity] }),
      messages:   [{ role: "user", content: prompt }],
    });

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("AnthropicAdapter: no text block in response");
    }
    
    return block.text;
  }
}
