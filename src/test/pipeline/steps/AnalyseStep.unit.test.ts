import { describe, it, expect, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { PipelineContext } from "../PipelineContext";
import { messages } from "@electric-sql/pglite";
import { AnalyseStep } from "./AnalyseStep";

const baseCtx: PipelineContext = {
  briefing:
    "Gateway IoT da BZU monitora temperatura com precisão de ±0.1°C para indústrias alimentícias.",
  channel: "linkedin_post",
  clientProfile: {
    companyName: "BZU",
    voiceDescription: "técnico e confiável",
    colors: ["#0057B7", "#FFFFFF"],
  },
};

const validAnalysis = {
  product: "Gateway IoT BZU",
  keyBenefit:
    "Monitoramento de temperatura em tempo real com precisão de ±0.1°C",
  audience: "Gestores de qualidade em indústrias alimentícias",
  tone: "technical",
  goal: "awareness",
  keywords: ["IoT", "temperatura", "ANVISA", "gateway", "monitoramento"],
};

function makeAI(text: string): Anthropic {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text }],
      }),
    },
  } as unknown as Anthropic;
}

describe("AnalyseStep", () => {
  describe("path", async () => {
    const step = new AnalyseStep(makeAI(JSON.stringify(validAnalysis)));
    const result = await step.exec(baseCtx);

    expect(result.analysedBriefing).toBeDefined();
    expect(result.analysedBriefing?.product).toBe("Gateway IoT BZU");
    expect(result.analysedBriefing?.tone).toBe("technical");
    expect(result.analysedBriefing?.goal).toBe("awareness");
  });
});
