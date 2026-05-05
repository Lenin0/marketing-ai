import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { buildApp } from "../../../server";
import { container } from "../../../container";
import type { IAIProvider } from "../../../infra/contract/ai.contract";
import type { IImageProvider } from "../../../infra/contract/imageAI.contract";

const validPayload = {
  briefing:     "Gateway IoT BZU para indústria alimentícia",
  channel:      "instagram_post",
  brandProfile: {
    companyName:      "BZU",
    voiceDescription: "técnico e confiável",
  },
};

const validAnalysis = JSON.stringify({
  product:    "Gateway IoT BZU",
  keyBenefit: "Monitoramento de temperatura em tempo real",
  audience:   "Indústrias alimentícias",
  tone:       "technical",
  goal:       "awareness",
  keywords:   ["IoT", "temperatura", "ANVISA"],
});

const validCopy = JSON.stringify({
  title:    "Monitore com precisão",
  hook:     "Sua indústria precisa de conformidade",
  body:     "Conteúdo gerado pela IA",
  cta:      "Fale com a BZU",
  hashtags: ["#IoT", "#ANVISA"],
});


function makeAIProvider(responses: string[]): IAIProvider {
  let callCount = 0;
  return {
    complete: vi.fn().mockImplementation(async () => {
      return responses[callCount++] ?? validCopy;
    }),
  };
}

function makeImageProvider(url = "https://img.example.com/test.jpg"): IImageProvider {
  return {
    generateImage: vi.fn().mockResolvedValue(url),
  };
}

function mockAuthenticate(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  (req as any).user = { id: "dev-user-id", email: "dev@local" };
  return Promise.resolve();
}

describe("POST /campaigns", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    container.reset();
    container.overrideDependency("authenticate",   mockAuthenticate);
    container.overrideDependency("aiProvider",     makeAIProvider([validAnalysis, validCopy, "visual description"]));
    container.overrideDependency("imageProvider",  makeImageProvider());

    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  describe("valid payload", () => {
    it("should return 201 with generated output", async () => {
      const res = await app.inject({
        method:  "POST",
        url:     "/campaigns",
        payload: validPayload,
      });

      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res.body)).toMatchObject({
        output: { title: "Monitore com precisão" },
      });
    });

    it("should call aiProvider with briefing context", async () => {
      const aiProvider = makeAIProvider([validAnalysis, validCopy, "visual description"]);
      container.overrideDependency("aiProvider", aiProvider);

      await app.close();
      app = buildApp();
      await app.ready();

      await app.inject({
        method:  "POST",
        url:     "/campaigns",
        payload: validPayload,
      });

      expect(aiProvider.complete).toHaveBeenCalled();
      const firstCallPrompt = vi.mocked(aiProvider.complete).mock.calls[0]?.[0];
      expect(firstCallPrompt).toContain("Gateway IoT BZU");
    });
  });

  describe("payload validation", () => {
    it("should return 400 if briefing is missing", async () => {
      const { briefing: _, ...payload } = validPayload;
      const res = await app.inject({ method: "POST", url: "/campaigns", payload });
      expect(res.statusCode).toBe(400);
    });

    it("should return 400 if channel is missing", async () => {
      const { channel: _, ...payload } = validPayload;
      const res = await app.inject({ method: "POST", url: "/campaigns", payload });
      expect(res.statusCode).toBe(400);
    });

    it("should return 400 if channel is invalid", async () => {
      const res = await app.inject({
        method:  "POST",
        url:     "/campaigns",
        payload: { ...validPayload, channel: "tiktok" },
      });
      expect(res.statusCode).toBe(400);
    });

    it("should return 400 if brandProfile is missing", async () => {
      const { brandProfile: _, ...payload } = validPayload;
      const res = await app.inject({ method: "POST", url: "/campaigns", payload });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("pipeline errors", () => {
    it("should return 422 if AI validation fails", async () => {
      container.overrideDependency("aiProvider", {
        complete: vi.fn().mockRejectedValue(new Error("schema validation failed")),
      });

      await app.close();
      app = buildApp();
      await app.ready();

      const res = await app.inject({
        method:  "POST",
        url:     "/campaigns",
        payload: validPayload,
      });

      expect(res.statusCode).toBe(422);
      expect(JSON.parse(res.body)).toMatchObject({ error: "generation_failed" });
    }, 15_000);

    it("should return 500 for unexpected errors", async () => {
      container.overrideDependency("aiProvider", {
        complete: vi.fn().mockRejectedValue(new Error("S3 connection timeout")),
      });

      await app.close();
      app = buildApp();
      await app.ready();

      const res = await app.inject({
        method:  "POST",
        url:     "/campaigns",
        payload: validPayload,
      });

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toMatchObject({ error: "internal_error" });
    });
  });
});