import type { FastifyReply, FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      type: "user" | "service";
    };
    user: {
      id: string;
      email: string;
      type: "user" | "service";
    };
  }
}

export async function authenticateJWT(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await req.jwtVerify();
  } catch {
    reply
      .status(401)
      .send({ error: "unauthorized", message: "Invalid or expired token" });
  }
}

export async function authenticateApiKey(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || typeof apiKey !== "string") {
    reply
      .status(401)
      .send({ error: "unauthorized", message: "API key required" });
    return;
  }

  const validKey = process.env.SERVICE_API_KEY;
  if (apiKey !== validKey) {
    reply
      .status(401)
      .send({ error: "unauthorized", message: "Invalid API key" });
    return;
  }
}

export async function authenticate(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  
  if (process.env.AUTH_ENABLED !== "true") {
    req.user = { id: "dev-user-id", email: "dev@local", type: "user" };
    return;
  }
  const hasApiKey = !!req.headers["x-api-key"];

  if (hasApiKey) {
    return authenticateApiKey(req, reply);
  }

  return authenticateJWT(req, reply);
}
