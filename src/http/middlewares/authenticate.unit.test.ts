import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  authenticate,
  authenticateJWT,
  authenticateApiKey,
} from "./authenticate";


function makeReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send:   vi.fn().mockReturnThis(),
  };
  return reply as unknown as FastifyReply;
}

function makeRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    headers:    {},
    jwtVerify:  vi.fn().mockResolvedValue(undefined),
    user:       {} as any,
    log:        { info: vi.fn(), error: vi.fn() },
    ...overrides,
  } as unknown as FastifyRequest;
}

describe("authenticate", () => {
  describe("AUTH_ENABLED=false", () => {
    beforeEach(() => {
      process.env.AUTH_ENABLED = "false";
    });

    it("should bypass verification when authentication is disabled", async () => {
      const req = makeRequest();
      const reply = makeReply();

      await authenticate(req, reply);

      expect(reply.status).not.toHaveBeenCalled();
    });

    it("should inject dev-user-id into req.user", async () => {
      const req = makeRequest();
      const reply = makeReply();

      await authenticate(req, reply);

      expect(req.user.id).toBe("dev-user-id");
    });
  });

  describe("AUTH_ENABLED=true", () => {
    beforeEach(() => {
      process.env.AUTH_ENABLED = "true";
    });

    it("should use authenticateApiKey when x-api-key is present", async () => {
      process.env.SERVICE_API_KEY = "valid-key";

      const req = makeRequest({
        headers: { "x-api-key": "valid-key" },
      });
      const reply = makeReply();

      await authenticate(req, reply);

      expect(reply.status).not.toHaveBeenCalled();
    });

    it("should use authenticateJWT when x-api-key is absent", async () => {
      const req = makeRequest({
        jwtVerify: vi.fn().mockResolvedValue(undefined),
      });
      const reply = makeReply();

      await authenticate(req, reply);

      expect(req.jwtVerify).toHaveBeenCalled();
    });
  });
});

describe("authenticateJWT", () => {
  it("should pass when token is valid", async () => {
    const req = makeRequest({
      jwtVerify: vi.fn().mockResolvedValue(undefined),
    });
    const reply = makeReply();

    await authenticateJWT(req, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should return 401 when token is invalid", async () => {
    const req = makeRequest({
      jwtVerify: vi.fn().mockRejectedValue(new Error("invalid token")),
    });
    const reply = makeReply();

    await authenticateJWT(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: "unauthorized" })
    );
  });

  it("should return 401 when token is expired", async () => {
    const req = makeRequest({
      jwtVerify: vi.fn().mockRejectedValue(new Error("token expired")),
    });
    const reply = makeReply();

    await authenticateJWT(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
  });
});

describe("authenticateApiKey", () => {
  beforeEach(() => {
    process.env.SERVICE_API_KEY = "valid-key-123";
  });

  it("should pass when API key is valid", async () => {
    const req = makeRequest({
      headers: { "x-api-key": "valid-key-123" },
    });
    const reply = makeReply();

    await authenticateApiKey(req, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should return 401 when API key is missing", async () => {
    const req = makeRequest({ headers: {} });
    const reply = makeReply();

    await authenticateApiKey(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: "unauthorized", message: "API key required" })
    );
  });

  it("should return 401 when API key is invalid", async () => {
    const req = makeRequest({
      headers: { "x-api-key": "wrong-key" },
    });
    const reply = makeReply();

    await authenticateApiKey(req, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: "unauthorized", message: "Invalid API key" })
    );
  });
});