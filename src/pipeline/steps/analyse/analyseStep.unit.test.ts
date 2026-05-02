import { describe, it, expect, vi } from "vitest";
import type { PipelineContext } from "../../PipelineContext";
import { AnalyseStep } from "./analyse.step";
import { IAIProvider } from "../../../infra/contract/ai.contract";

const baseCtx: PipelineContext = {
  briefing: "Gateway IoT da BZU monitora temperatura com precisão de ±0.1°C...",
  channel: "linkedin_post",
  clientProfile: {
    companyName: "BZU",
    voiceDescription: "técnico e confiável",
  },
};

const validAnalysis = {
  product: "Gateway IoT BZU",
  keyBenefit: "Monitoramento de temperatura",
  audience: "Gestores",
  tone: "technical",
  goal: "awareness",
  keywords: ["IoT"],
};

function makeAI(text: string): IAIProvider {
  return {
    complete: vi.fn().mockResolvedValue(text),
  };
}

describe("AnalyseStep", () => {
  it("returns context with analysedBriefing populated", async () => {
    const ai = makeAI(JSON.stringify(validAnalysis));
    const step = new AnalyseStep(ai);
    const result = await step.exec(baseCtx);

    expect(result.analysedBriefing?.product).toBe("Gateway IoT BZU");
    expect(ai.complete).toHaveBeenCalled();
  });

  it("accepts JSON with markdown fence (handled by AIParser)", async () => {
    const withFence = `\`\`\`json\n${JSON.stringify(validAnalysis)}\n\`\`\``;
    const step = new AnalyseStep(makeAI(withFence));
    const result = await step.exec(baseCtx);

    expect(result.analysedBriefing?.product).toBe("Gateway IoT BZU");
  });

  describe("error handling", () => {
    it("throws if AI returns invalid JSON", async () => {
      const step = new AnalyseStep(makeAI("Not a JSON"));

      await expect(step.exec(baseCtx)).rejects.toThrow("AI_PARSER_ERROR");
    });

    it("throws if schema validation fails (Zod)", async () => {
      const invalid = { ...validAnalysis, tone: "invalid_tone" };
      const step = new AnalyseStep(makeAI(JSON.stringify(invalid)));

      await expect(step.exec(baseCtx)).rejects.toThrow(/AI_PARSER_ERROR/);
    });
  });

  describe("prompt", () => {
    it("sends the correct prompt to the AI provider", async () => {
      const ai = makeAI(JSON.stringify(validAnalysis));
      const step = new AnalyseStep(ai);
      await step.exec(baseCtx);

      expect(ai.complete).toHaveBeenCalledWith(
        expect.stringContaining(baseCtx.briefing),
        expect.any(Object),
      );

      expect(ai.complete).toHaveBeenCalledWith(
        expect.stringContaining("BZU"),
        expect.anything(),
      );
    });
  });
});
