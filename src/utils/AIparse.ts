import { z } from "zod";

export class AIParser {

  static parse<T>(raw: string, schema: z.ZodType<T>): T {
    try {
      const cleaned = raw
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      
      if (start === -1 || end === -1) {
        throw new Error("No JSON object found in AI response");
      }
      
      const jsonStr = cleaned.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr);

      return schema.parse(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`[AI_PARSER_ERROR]: ${message} | Raw: ${raw.slice(0, 50)}...`);
    }
  }
}