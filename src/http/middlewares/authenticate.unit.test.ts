import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { makeAuthenticate } from "./authenticate";
import type { IContractAuthProvider } from "../../infra/auth/contractAuthProvider";

function makeReply(): FastifyReply {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send:   vi.fn().mockReturnThis(),
  };
  return reply as unknown as FastifyReply;
}

function makeRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    headers:   {},
    jwtVerify: vi.fn().mockResolvedValue(undefined),
    user:      {} as any,
    log:       { info: vi.fn(), error: vi.fn() },
    ...overrides,
  } as unknown as FastifyRequest;
}

function makeAuthProvider(uid = "user-123"): IContractAuthProvider {
  return {
    verifyToken: vi.fn().mockResolvedValue({ uid, email: "user@test.com" }),
  };
}

describe("authenticate", () => {

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.AUTH_ENABLED;
    delete process.env.SERVICE_API_KEY;
  });

  describe("AUTH_ENABLED=false", () => {
    beforeEach(() => {
      process.env.AUTH_ENABLED = "false";
    });

    it("should inject dev-user-id without verifying token", async () => {
      const authenticate = makeAuthenticate(makeAuthProvider());
      const req  = makeRequest();
      const reply = makeReply();

      await authenticate(req, reply);

      expect(req.user.id).toBe("dev-user-id");
      expect(reply.status).not.toHaveBeenCalled();
    });

    it("should not call the authProvider when auth is disabled", async () => {
      const provider = makeAuthProvider();
      const authenticate = makeAuthenticate(provider);

      await authenticate(makeRequest(), makeReply());

      expect(provider.verifyToken).not.toHaveBeenCalled();
    });
  });

  describe("AUTH_ENABLED=true", () => {
    beforeEach(() => {
      process.env.AUTH_ENABLED = "true";
    });

    describe("Firebase JWT", () => {
      it("should verify token and inject user into request", async () => {
        const provider = makeAuthProvider("firebase-uid-123");
        const authenticate = makeAuthenticate(provider);
        const req = makeRequest({
          headers: { authorization: "Bearer valid-token" },
        });

        await authenticate(req, makeReply());

        expect(req.user.id).toBe("firebase-uid-123");
        expect(req.user.email).toBe("user@test.com");
      });

      it("should call verifyToken with the token extracted from header", async () => {
        const provider = makeAuthProvider();
        const authenticate = makeAuthenticate(provider);
        const req = makeRequest({
          headers: { authorization: "Bearer meu-token-aqui" },
        });

        await authenticate(req, makeReply());

        expect(provider.verifyToken).toHaveBeenCalledWith("meu-token-aqui");
      });

      it("should return 401 if token is invalid", async () => {
        const provider: IContractAuthProvider = {
          verifyToken: vi.fn().mockRejectedValue(new Error("invalid token")),
        };
        const authenticate = makeAuthenticate(provider);
        const req   = makeRequest({ headers: { authorization: "Bearer bad-token" } });
        const reply = makeReply();

        await authenticate(req, reply);

        expect(reply.status).toHaveBeenCalledWith(401);
        expect(reply.send).toHaveBeenCalledWith(
          expect.objectContaining({ error: "unauthorized" })
        );
      });

      it("should return 401 if Authorization header is missing", async () => {
        const authenticate = makeAuthenticate(makeAuthProvider());
        const req   = makeRequest({ headers: {} });
        const reply = makeReply();

        await authenticate(req, reply);

        expect(reply.status).toHaveBeenCalledWith(401);
        expect(reply.send).toHaveBeenCalledWith(
          expect.objectContaining({ message: "Token required" })
        );
      });

      it("should return 401 if header does not start with Bearer", async () => {
        const authenticate = makeAuthenticate(makeAuthProvider());
        const req   = makeRequest({ headers: { authorization: "Basic abc123" } });
        const reply = makeReply();

        await authenticate(req, reply);

        expect(reply.status).toHaveBeenCalledWith(401);
      });

      it("should return 401 if Bearer value is empty", async () => {
        const authenticate = makeAuthenticate(makeAuthProvider());
        const req   = makeRequest({ headers: { authorization: "Bearer " } });
        const reply = makeReply();

        await authenticate(req, reply);

        expect(reply.status).toHaveBeenCalledWith(401);
      });
    });

    describe("API Key", () => {
      beforeEach(() => {
        process.env.SERVICE_API_KEY = "valid-key-123";
      });

      it("should accept valid API Key and inject service-account", async () => {
        const authenticate = makeAuthenticate(makeAuthProvider());
        const req   = makeRequest({ headers: { "x-api-key": "valid-key-123" } });
        const reply = makeReply();

        await authenticate(req, reply);

        expect(req.user.id).toBe("service-account");
        expect(reply.status).not.toHaveBeenCalled();
      });

      it("should not call verifyToken when API Key is used", async () => {
        const provider = makeAuthProvider();
        const authenticate = makeAuthenticate(provider);
        const req = makeRequest({ headers: { "x-api-key": "valid-key-123" } });

        await authenticate(req, makeReply());

        expect(provider.verifyToken).not.toHaveBeenCalled();
      });

      it("should return 401 if API Key is invalid", async () => {
        const authenticate = makeAuthenticate(makeAuthProvider());
        const req   = makeRequest({ headers: { "x-api-key": "wrong-key" } });
        const reply = makeReply();

        await authenticate(req, reply);

        expect(reply.status).toHaveBeenCalledWith(401);
        expect(reply.send).toHaveBeenCalledWith(
          expect.objectContaining({ error: "unauthorized", message: "Invalid API key" })
        );
      });

      it("should prioritize API Key over JWT when both are present", async () => {
        const provider = makeAuthProvider();
        const authenticate = makeAuthenticate(provider);
        const req = makeRequest({
          headers: {
            "x-api-key":     "valid-key-123",
            authorization:   "Bearer some-token",
          },
        });

        await authenticate(req, makeReply());
        
        expect(provider.verifyToken).not.toHaveBeenCalled();
        expect(req.user.id).toBe("service-account");
      });
    });
  });
});