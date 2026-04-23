import type { FastifyInstance } from "fastify";

export async function campaignRoutes(app: FastifyInstance): Promise<void> {
  app.post("/campaigns", async (_req, reply) => {
    return reply.status(501).send({ error: "not implemented" });
  });
}
