import Fastify from "fastify";
import { campaignRoutes } from "./http/routes/campaings/campaigns.routes";
import { clientProfileRoutes } from "./http/routes/clientProfile/clientProfile.routes";
import { securityPlugin } from "./http/plugins/security.plugin";
import { multipartPlugin } from "./http/plugins/multipart.plugin";
import { errorHandler } from "./http/middlewares/errorHandler";
import { container } from "./container";

export function buildApp() {
  const app  = Fastify({ logger: process.env.NODE_ENV !== "test" });
  const deps = container.getDependencies();

  app.register(securityPlugin);
  app.register(multipartPlugin);
  app.setErrorHandler(errorHandler);

  app.register(campaignRoutes, {
    aiProvider:    deps.aiProvider,
    imageProvider: deps.imageProvider,
    authenticate:  deps.authenticate,
  });

  app.register(clientProfileRoutes, {
    clientProfileRepository: deps.clientProfileRepository,
    authenticate:            deps.authenticate,
  });

  return app;
}
