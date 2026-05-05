import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyPluginOptions,
} from "fastify";
import {
  CreateClientProfileSchema,
  UpdateClientProfileBodySchema,
  ClientProfileParamsSchema,
} from "./clientProfile.schema";

import { IClientProfileRepository } from "../../../infra/contract/clientProfile.contratc";
import { makeClientProfileController } from "./clientProfile.controller";
import {
  validatorCompiler,
  serializerCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

interface clientProfileRoutesOptions extends FastifyPluginOptions {
  clientProfileRepository: IClientProfileRepository;
  authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
}

export async function clientProfileRoutes(
  app: FastifyInstance,
  opts: clientProfileRoutesOptions
): Promise<void> {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  const controller = makeClientProfileController(opts.clientProfileRepository);
  

  typedApp.post(
    "/client-profiles",
    {
      onRequest: [opts.authenticate],
      schema: { body: CreateClientProfileSchema },
    },
    controller.create
  );

  typedApp.get("/brands", controller.findAll);

  typedApp.get(
    "/profile/:id",
    {
      onRequest: [opts.authenticate],
      schema: { params: ClientProfileParamsSchema },
    },
    controller.findById
  );

  typedApp.patch(
    "/profile/:id",
    {
      onRequest: [opts.authenticate],
      schema: {
        params: ClientProfileParamsSchema,
        body: UpdateClientProfileBodySchema,
      },
    },
    controller.update
  );

  typedApp.delete(
    "/profile/:id",
    {
      onRequest: [opts.authenticate],
      schema: { params: ClientProfileParamsSchema },
    },
    controller.delete
  );
}
