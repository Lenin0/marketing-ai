import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";

export const securityPlugin = fp(async (app: FastifyInstance) => {
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      error: "rate_limit_exceeded",
      message: "Too many requests, please try again later",
    }),
  });
});
