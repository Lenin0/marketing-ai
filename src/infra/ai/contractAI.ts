export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface IAIProvider {
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
}