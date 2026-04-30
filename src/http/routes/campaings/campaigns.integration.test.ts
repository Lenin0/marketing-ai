import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../../server";
import { PipelineRunner } from "../../../pipeline/PipelineRunner";
import { PipelineContext } from "../../../pipeline/PipelineContext";


vi.mock("../../pipeline/PipelineRunner");

const validPayload: PipelineContext = {
  briefing: "Gateway IoT BZU para indústria alimentícia",
  channel: "instagram_post",
  clientProfile: {
    companyName: "BZU",
    voiceDescription: "técnico e confiável",
  },
};

const validOutput: PipelineContext = {
  briefing: validPayload.briefing,
  channel: validPayload.channel,
  clientProfile: validPayload.clientProfile,
  finalOutput: { headline: "Monitore com precisão", body: "Conteúdo gerado" },
};


describe("POST /campaigns", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();

    vi.mocked(PipelineRunner.prototype.run).mockResolvedValue(validOutput);
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  describe("valid payload", () => {
    it("should return 201 with the generated output", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/campaigns",
        payload: validPayload,
      });

      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res.body)).toMatchObject({
        output: { headline: "Monitore com precisão" },
      });
    });

    it("should call PipelineRunner with the correct context", async () => {
      await app.inject({
        method: "POST",
        url: "/campaigns",
        payload: validPayload,
      });

      expect(PipelineRunner.prototype.run).toHaveBeenCalledWith(
        expect.objectContaining({
          briefing: validPayload.briefing,
          channel: validPayload.channel,
        })
      );
    });
  });

  describe("payload validation", () => {
    it("should return 400 if briefing is missing", async () => {
      const { briefing: _, ...withoutBriefing } = validPayload;

      const res = await app.inject({
        method: "POST",
        url: "/campaigns",
        payload: withoutBriefing,
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 if channel is missing", async () => {
      const { channel: _, ...withoutChannel } = validPayload;

      const res = await app.inject({
        method: "POST",
        url: "/campaigns",
        payload: withoutChannel,
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 if channel is an invalid value", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/campaigns",
        payload: { ...validPayload, channel: "tiktok" as any },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 if clientProfile is missing", async () => {
      const { clientProfile: _, ...withoutBrand } = validPayload;

      const res = await app.inject({
        method: "POST",
        url: "/campaigns",
        payload: withoutBrand,
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("pipeline errors", () => {
    it("should return 422 if pipeline fails due to AI validation", async () => {
      vi.mocked(PipelineRunner.prototype.run).mockRejectedValue(
        new Error("schema validation failed")
      );

      const res = await app.inject({
        method: "POST",
        url: "/campaigns",
        payload: validPayload,
      });

      expect(res.statusCode).toBe(422);
      expect(JSON.parse(res.body)).toMatchObject({ error: "generation_failed" });
    });

    it("should return 500 for unexpected pipeline errors", async () => {
      vi.mocked(PipelineRunner.prototype.run).mockRejectedValue(
        new Error("S3 connection timeout")
      );

      const res = await app.inject({
        method: "POST",
        url: "/campaigns",
        payload: validPayload,
      });

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toMatchObject({ error: "internal_error" });
    });
  });
});