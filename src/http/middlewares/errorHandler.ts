import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply
): void {
  
  req.log.error({
    err:    error,
    method: req.method,
    url:    req.url,
  });

  if (error.statusCode === 400) {
    reply.status(400).send({ error: "validation_error", message: error.message });
    return;
  }

  if (error.statusCode === 401) {
    reply.status(401).send({ error: "unauthorized", message: error.message });
    return;
  }

  if (error.statusCode === 429) {
    reply.status(429).send({ error: "rate_limit_exceeded", message: error.message });
    return;
  }

  if (
    error.message.includes("schema validation failed") ||
    error.message.includes("AI_PARSER")
  ) {
    reply.status(422).send({ error: "generation_failed", message: error.message });
    return;
  }

  const isDev = process.env.NODE_ENV === "development";
  reply.status(500).send({
    error:   "internal_error",
    message: isDev ? error.message : "Something went wrong",
  });
}