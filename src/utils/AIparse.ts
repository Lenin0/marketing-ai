import { z } from "zod";
import { AIParserError } from "./AIparseErro";

export class AIParser {
  static parse<T>(raw: string, schema: z.ZodType<T>): T {
    const jsonString = this.extractJson(raw);
    const obj = this.safeJsonParse(jsonString, raw);
    return this.validateSchema(obj, schema);
  }

  private static extractJson(raw: string): string {
    if (!raw) {
      throw new AIParserError(
        "received empty or undefined string from AI",
        "EMPTY_INPUT"
      );
    }
    const cleaned = raw.replace(/```json\s*|```\s*/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new AIParserError("no JSON object found", raw);
    }
    return cleaned.slice(start, end + 1);
  }

  private static safeJsonParse(jsonString: string, raw: string): unknown {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      throw new AIParserError(
        err instanceof Error ? err.message : "invalid format",
        raw
      );
    }
  }

  private static validateSchema<T>(obj: unknown, schema: z.ZodType<T>): T {
    const result = schema.safeParse(obj);
    if (!result.success) {
      const fields = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      throw new AIParserError(`schema validation failed: ${fields}`);
    }
    return result.data;
  }
}
