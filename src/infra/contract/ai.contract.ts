export interface CompletionOptions {
  creativity?: "none" | "low" | "medium" | "high";
  maxTokens?: number;
  model?: string;
}

export interface IAIProvider {
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
}