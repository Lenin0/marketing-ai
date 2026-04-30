import Fastify from "fastify";
import { fileURLToPath } from "node:url";
import { campaignRoutes } from "./http/routes/campaings/campaigns.routes";

export function buildApp() {
  const app = Fastify({ logger: false });
  app.register(campaignRoutes);
  return app;
}

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const app = buildApp();

  try {
    await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });
    console.log(`running on port ${process.env.PORT ?? 3000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}