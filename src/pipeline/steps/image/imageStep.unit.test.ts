import { describe, it, expect, vi } from "vitest";
import { PipelineContext } from "../../PipelineContext";
import { IImageProvider } from "../../../infra/contract/contractImage";
import { ImageStep } from "./image.step";
import { IAIProvider } from "../../../infra/contract/contractAI";

const baseCtx: PipelineContext = {
  briefing: "Gateway IoT BZU para indústria alimentícia",
  channel: "instagram_post",
  clientProfile: {
    companyName: "BZU",
    voiceDescription: "técnico e confiável",
    colors: ["#0057B7", "#FFFFFF"],
  },
  analysedBriefing: {
    product: "Gateway IoT BZU",
    keyBenefit: "Monitoramento de temperatura em tempo real",
    audience: "Gestores de qualidade em indústrias alimentícias",
    tone: "technical",
    goal: "awareness",
    keywords: ["IoT", "temperatura", "ANVISA"],
  },
  generatedCopy: {
    title: "Título Mock",
    hook: "Hook Mock",
    body: "Corpo Mock",
    cta: "CTA Mock",
    hashtags: [],
  },
};

function makeAI(): IAIProvider {
  return {
    complete: vi.fn().mockResolvedValue("Gateway IoT BZU"),
  };
}

function makeImageProvider(
  url = "https://cdn.example.com/generated.jpg"
): IImageProvider {
  return {
    generateImage: vi.fn().mockResolvedValue(url),
  };
}

describe("ImageStep", () => {
  describe("quando referenceImageUrl está presente", () => {
    it("usa a imagem de referência sem chamar o provider", async () => {
      const ctxWithRef: PipelineContext = {
        ...baseCtx,
        referenceImageUrl: "https://cdn.example.com/generated.jpg",
      };

      const imageProvider = makeImageProvider();
      const step = new ImageStep(makeAI(), imageProvider);
      const result = await step.exec(ctxWithRef);

      expect(result.generatedImageUrl).toBe(
        "https://cdn.example.com/generated.jpg"
      );
      expect(imageProvider.generateImage).not.toHaveBeenCalled();
    });

    it("não muta o contexto original", async () => {
      const ctxWithRef: PipelineContext = {
        ...baseCtx,
        referenceImageUrl: "https://cdn.example.com/generated.jpg",
      };

      const step = new ImageStep(makeAI(), makeImageProvider());
      await step.exec(ctxWithRef);

      expect(ctxWithRef.generatedImageUrl).toBeUndefined();
    });
  });

  describe("quando referenceImageUrl está ausente", () => {
    it("chama o imageProvider para gerar a imagem", async () => {
      const imageProvider = makeImageProvider();
      const step = new ImageStep(makeAI(), imageProvider);

      await step.exec(baseCtx);

      expect(imageProvider.generateImage).toHaveBeenCalledOnce();
    });

    it("retorna a URL gerada pelo provider", async () => {
      const generatedUrl = "https://cdn.openai.com/dalle/abc123.jpg";
      const step = new ImageStep(makeAI(), makeImageProvider(generatedUrl));

      const result = await step.exec(baseCtx);

      expect(result.generatedImageUrl).toBe(generatedUrl);
    });

    it("inclui o produto no prompt enviado ao imageProvider", async () => {
      const imageProvider = makeImageProvider();
      const step = new ImageStep(makeAI(), imageProvider);

      await step.exec(baseCtx);

      const prompt = vi.mocked(imageProvider.generateImage).mock.calls[0]?.[0];
      expect(prompt).toContain("Gateway IoT BZU");
    });

    it("inclui as cores da marca no prompt", async () => {
      const imageProvider = makeImageProvider();
      const step = new ImageStep(makeAI(), imageProvider);

      await step.exec(baseCtx);

      const prompt = vi.mocked(imageProvider.generateImage).mock.calls[0]?.[0];
      expect(prompt).toContain("#0057B7");
    });

    it("não muta o contexto original", async () => {
      const step = new ImageStep(makeAI(), makeImageProvider());
      await step.exec(baseCtx);

      expect(baseCtx.generatedImageUrl).toBeUndefined();
    });

    it("lança erro se analysedBriefing estiver ausente no contexto", async () => {
      const ctxWithoutAnalysis: PipelineContext = {
        briefing: "teste",
        channel: "instagram_post",
        clientProfile: { companyName: "BZU", voiceDescription: "direto" },
      };

      const step = new ImageStep(makeAI(), makeImageProvider());

      await expect(step.exec(ctxWithoutAnalysis)).rejects.toThrow(
        "ImageStep: analysedBriefing is required"
      );
    });

    it("propaga erro do imageProvider", async () => {
      const failingProvider: IImageProvider = {
        generateImage: vi
          .fn()
          .mockRejectedValue(new Error("DALL-E rate limit")),
      };

      const step = new ImageStep(makeAI(), failingProvider);

      await expect(step.exec(baseCtx)).rejects.toThrow("DALL-E rate limit");
    });
  });
});
