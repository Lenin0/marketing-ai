export class AIParserError extends Error {
    constructor(
      public readonly detail: string, 
      public readonly raw?: string
    ) {
    
      super("AI_PARSER_ERROR"); 
      this.name = "AI_PARSER_ERROR";
    }
  
    public getFullMessage(): string {
      return `[AI_PARSER] ${this.detail} | raw: ${this.raw?.slice(0, 100)}`;
    }
  }