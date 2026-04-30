import { describe, it, expect, vi } from "vitest";
import { PipelineContext } from "../../PipelineContext";
import { IAIProvider } from "../../../infra/contract/contractAI";
import { CopyStep } from "./copy.step";


const mockContext: PipelineContext = {
  briefing: "Vinho tinto seco premium da serra gaúcha.",
  channel: "instagram_post",
  clientProfile: { companyName: "Vinícola XPTO", voiceDescription: "Refinado" },
  analysedBriefing: {
    product: "Vinho Tinto XPTO Reserve",
    keyBenefit: "Sabor encorpado com notas de carvalho",
    audience: "Entusiastas de vinhos",
    tone: "inspirational",
    goal: "awareness",
    keywords: ["vinho", "serra gaúcha", "premium"]
  }
};

const validCopyResponse = {
  title: "A Essência da Serra em cada Taça",
  hook: "Você já sentiu o tempo parar enquanto degusta um segredo?",
  body: "Apresentamos o novo Reserve...",
  cta: "Conheça nossa adega no link da bio.",
  hashtags: ["#vinho", "#premium"]
};

function makeAI(text: string): IAIProvider {
  return {
    complete: vi.fn().mockResolvedValue(text),
  };
}

describe("CopyStep", () => {
  it("should generate copy using the strategic analysis from context", async () => {
    const ai = makeAI(JSON.stringify(validCopyResponse));
    const step = new CopyStep(ai);
    
    const result = await step.exec(mockContext);
    expect(result.generatedCopy).toBeDefined();
    expect(result.generatedCopy?.title).toBe(validCopyResponse.title);
    expect(ai.complete).toHaveBeenCalled();
  });

  it("should include strategic keywords in the prompt sent to AI", async () => {
    const ai = makeAI(JSON.stringify(validCopyResponse));
    const step = new CopyStep(ai);
    
    await step.exec(mockContext);

    const sentPrompt = vi.mocked(ai.complete).mock.calls[0]![0];

    expect(sentPrompt).toContain("Vinho Tinto XPTO Reserve");
    expect(sentPrompt).toContain("inspirational");
    expect(sentPrompt).toContain("instagram_post");
  });

  it("should throw an error if AI return is missing required JSON fields", async () => {
    const incompleteResponse = { title: "Só o título" };
    const ai = makeAI(JSON.stringify(incompleteResponse));
    const step = new CopyStep(ai);
  
    await expect(step.exec(mockContext)).rejects.toThrow(/AI_PARSER/);
  });

  it("should not mutate the original context", async () => {
    const ai = makeAI(JSON.stringify(validCopyResponse));
    const step = new CopyStep(ai);
  
    await step.exec(mockContext);
  
    expect(mockContext.generatedCopy).toBeUndefined();
  });
  
  it("should throw if analysedBriefing is missing from context", async () => {
    const ctxWithoutAnalysis: PipelineContext = {
      briefing: "teste",
      channel: "instagram_post",
      clientProfile: { companyName: "BZU", voiceDescription: "direto" },
    };
  
    const ai = makeAI(JSON.stringify(validCopyResponse));
    const step = new CopyStep(ai);
  
    await expect(step.exec(ctxWithoutAnalysis)).rejects.toThrow();
  });
});