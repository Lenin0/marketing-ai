import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions } from "fastify";
import {
  CreateClientProfileSchema,
  UpdateClientProfileBodySchema,
  ClientProfileParamsSchema,
} from "./clientProfile.schema";

import { IClientProfileRepository } from "../../../infra/contract/clientProfile.contratc";
import { makeClientProfileController } from "./clientProfile.controler";

interface clientProfileRoutesOptions extends FastifyPluginOptions {
  clientProfileRepository: IClientProfileRepository;
  authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
}

export async function clientProfileRoutes(
  app: FastifyInstance,
  opts: clientProfileRoutesOptions,
): Promise<void> {

  const controller = makeClientProfileController(opts.clientProfileRepository);

  app.post(
    "/profile",
    { 
      onRequest: [opts.authenticate],
      schema: { body: CreateClientProfileSchema } 
    },
    controller.create
  );

  app.get("/brands", controller.findAll);

  app.get(
    "/profile/:id",
    { 
      onRequest: [opts.authenticate],
      schema: { params: ClientProfileParamsSchema } 
    },
    controller.findById
  );

  app.patch(
    "/profile/:id",
    { 
      onRequest: [opts.authenticate],
      schema: { params: ClientProfileParamsSchema, body: UpdateClientProfileBodySchema } 
    },
    controller.update
  );

  app.delete(
    "/profile/:id",
    { 
      onRequest: [opts.authenticate],
      schema: { params: ClientProfileParamsSchema } 
    },
    controller.delete
  );
}