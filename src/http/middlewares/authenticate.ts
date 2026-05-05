import type { FastifyRequest, FastifyReply } from "fastify";
import type { IContractAuthProvider } from "../../infra/auth/contractAuthProvider";

declare module "@fastify/jwt" {
  interface FastifyJWT{
    user: {
      id: string;
      email: string | undefined;
    };
  }
}

export function makeAuthenticate(authProvider: IContractAuthProvider) {
  return async function authenticate(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (process.env.AUTH_ENABLED !== "true") {
      req.user = { id: "dev-user-id", email: "dev@local" };
      return;
    }

    const apiKey = req.headers["x-api-key"];
    if (apiKey) {
      if (apiKey !== process.env.SERVICE_API_KEY) {
        reply.status(401).send({ error: "unauthorized", message: "Invalid API key" });
        return;
      }
      req.user = { id: "service-account", email: "service@internal" };
      return;
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      reply.status(401).send({ error: "unauthorized", message: "Token required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      reply.status(401).send({ error: "unauthorized", message: "Token required" });
      return;
    }

    try {
      const decoded = await authProvider.verifyToken(token);
      req.user = { id: decoded.uid, email: decoded.email };
    } catch {
      reply.status(401).send({ error: "unauthorized", message: "Invalid or expired token" });
    }
  };
}