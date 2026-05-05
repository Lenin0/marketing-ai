import type { FastifyRequest, FastifyReply } from "fastify";

export async function requestLogger(
  req: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  req.log.info({
    method: req.method,
    url:    req.url,
    ip:     req.ip,
  });
}