import type { FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import {
  CreateClientProfileSchema,
  UpdateClientProfileBodySchema,
  ClientProfileParamsSchema,
} from "./clientProfile.schema";

import { IClientProfileRepository } from "../../../infra/contract/clientProfile.contratc";
import { makeClientProfileController } from "./clientProfile.controler";


export async function brandRoutes(
  app: FastifyInstance,
  opts: { brandRepository: IClientProfileRepository }
): Promise<void> {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const controller = makeClientProfileController(opts.brandRepository);

  app.post(
    "/profile",
    { schema: { body: CreateClientProfileSchema } },
    controller.create
  );

  app.get("/brands", controller.findAll);

  app.get(
    "/profile/:id",
    { schema: { params: ClientProfileParamsSchema } },
    controller.findById
  );

  app.patch(
    "/profile/:id",
    { schema: { params: ClientProfileParamsSchema, body: UpdateClientProfileBodySchema } },
    controller.update
  );

  app.delete(
    "/profile/:id",
    { schema: { params: ClientProfileParamsSchema } },
    controller.delete
  );
}