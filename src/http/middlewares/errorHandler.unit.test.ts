import { describe, it, expect, vi } from "vitest";
import type { FastifyRequest, FastifyReply, FastifyError } from "fastify";
import { errorHandler } from "./errorHandler";

function makeReply() {
  return {
    status: vi.fn().mockReturnThis(),
    send:   vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;
}

function makeRequest() {
  return {} as FastifyRequest;
}

function makeError(message: string, statusCode?: number): FastifyError {
  return { message, statusCode, name: "Error" } as FastifyError;
}


describe("errorHandler", () => {
  describe("payload validation errors", () => {
    it("should return 400 for Fastify validation error", () => {
      const reply = makeReply();
      errorHandler(makeError("validation error", 400), makeRequest(), reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "validation_error" })
      );
    });
  });

  describe("authentication errors", () => {
    it("should return 401 for invalid token", () => {
      const reply = makeReply();
      errorHandler(makeError("Unauthorized", 401), makeRequest(), reply);

      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "unauthorized" })
      );
    });
  });

  describe("rate limit errors", () => {
    it("should return 429 for rate limit exceeded", () => {
      const reply = makeReply();
      errorHandler(makeError("rate limit exceeded", 429), makeRequest(), reply);

      expect(reply.status).toHaveBeenCalledWith(429);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "rate_limit_exceeded" })
      );
    });
  });

  describe("AI pipeline errors", () => {
    it("should return 422 for AI schema validation failure", () => {
      const reply = makeReply();
      errorHandler(makeError("schema validation failed"), makeRequest(), reply);

      expect(reply.status).toHaveBeenCalledWith(422);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "generation_failed" })
      );
    });

    it("should return 422 for AI_PARSER error", () => {
      const reply = makeReply();
      errorHandler(makeError("[AI_PARSER] invalid JSON"), makeRequest(), reply);

      expect(reply.status).toHaveBeenCalledWith(422);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "generation_failed" })
      );
    });
  });

  describe("unexpected errors", () => {
    it("should return 500 for unmapped errors", () => {
      const reply = makeReply();
      errorHandler(makeError("S3 connection timeout"), makeRequest(), reply);

      expect(reply.status).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ error: "internal_error" })
      );
    });

    it("should expose error message in development", () => {
      process.env.NODE_ENV = "development";
      const reply = makeReply();

      errorHandler(makeError("internal details"), makeRequest(), reply);

      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "internal details" })
      );
    });

    it("should hide error message in production", () => {
      process.env.NODE_ENV = "production";
      const reply = makeReply();

      errorHandler(makeError("internal details"), makeRequest(), reply);

      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Something went wrong" })
      );
    });
  });
});