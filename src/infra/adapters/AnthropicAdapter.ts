import type Anthropic from "@anthropic-ai/sdk";
import { IAIProvider, CompletionOptions } from "../ai/contractAI";

export class AnthropicAdapter implements IAIProvider {
  constructor(private readonly client: Anthropic) {}

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const response = await this.client.messages.create({
      model: options?.model || "claude-sonnet-4-6",
      max_tokens: options?.maxTokens || 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("ClaudeProvider: no text block in response");
    }

    return block.text;
  }
}
