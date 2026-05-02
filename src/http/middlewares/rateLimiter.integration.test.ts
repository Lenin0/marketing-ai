import { describe, it, expect, afterEach } from "vitest";
import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";

describe("rate limiter", () => {
  let app: ReturnType<typeof Fastify>;

  afterEach(async () => {
    await app.close();
  });

  it("permite requests dentro do limite", async () => {
    app = Fastify();
    await app.register(rateLimit, { max: 3, timeWindow: "1 minute" });
    app.get("/test", async () => ({ ok: true }));
    await app.ready();

    for (let i = 0; i < 3; i++) {
      const res = await app.inject({ method: "GET", url: "/test" });
      expect(res.statusCode).toBe(200);
    }
  });

  it("bloqueia requests acima do limite", async () => {
    app = Fastify();
    await app.register(rateLimit, { max: 2, timeWindow: "1 minute" });
    app.get("/test", async () => ({ ok: true }));
    await app.ready();

    await app.inject({ method: "GET", url: "/test" });
    await app.inject({ method: "GET", url: "/test" });

    const res = await app.inject({ method: "GET", url: "/test" });
    expect(res.statusCode).toBe(429);
  });

  it("retorna header com limite restante", async () => {
    app = Fastify();
    await app.register(rateLimit, { max: 5, timeWindow: "1 minute" });
    app.get("/test", async () => ({ ok: true }));
    await app.ready();

    const res = await app.inject({ method: "GET", url: "/test" });
    expect(res.headers["x-ratelimit-limit"]).toBeDefined();
    expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
  });
});