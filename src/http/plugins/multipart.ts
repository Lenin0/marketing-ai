import fp from "fastify-plugin";
import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

export const multipartPlugin = fp(async (app: FastifyInstance) => {
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
      fieldSize: 1024 * 1024,
    },
    attachFieldsToBody: false,
  });
});
