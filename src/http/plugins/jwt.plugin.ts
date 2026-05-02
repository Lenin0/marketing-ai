import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";

export const jwtPlugin = fp(async (app: FastifyInstance) => {
  if (process.env.AUTH_ENABLED !== "true") return;

  await app.register(jwt, {
    secret: {
      private: process.env.JWT_PRIVATE_KEY!,
      public: process.env.JWT_PUBLIC_KEY!,
    },
    sign: {
      algorithm: "RS256",
      expiresIn: "15m",
    },
    verify: {
      algorithms: ["RS256"],
    },
  });
});
