import type { FastifyReply, FastifyRequest } from "fastify";
import { IClientProfileRepository } from "../../../infra/contract/clientProfile.contratc";
import {
  ClientProfileParamsSchema,
  CreateClientProfileSchema,
  UpdateClientProfileBodySchema,
} from "./clientProfile.schema";

export function makeClientProfileController(
  repository: IClientProfileRepository
) {
  return {
    async create(req: FastifyRequest, reply: FastifyReply): Promise<void> {
      const body = CreateClientProfileSchema.parse(req.body);
      const profile = await repository.create(body);
      reply.status(201).send(profile);
    },

    async findAll(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
      const profileList = await repository.findAll();
      reply.status(200).send(profileList);
    },

    async findById(req: FastifyRequest, reply: FastifyReply): Promise<void> {
      const { id } = ClientProfileParamsSchema.parse(req.params);
      const profile = await repository.findById(id);

      if (!profile) {
        reply
          .status(404)
          .send({ error: "not_found", message: "profile not found" });
        return;
      }

      reply.status(200).send(profile);
    },

    async update(req: FastifyRequest, reply: FastifyReply): Promise<void> {
      const { id } = ClientProfileParamsSchema.parse(req.params);
      const body = UpdateClientProfileBodySchema.parse(req.body);
      const profile = await repository.update(id, body);

      if (!profile) {
        reply
          .status(404)
          .send({ error: "not_found", message: "profile not found" });
        return;
      }

      reply.status(200).send(profile);
    },

    async delete(
      req: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = ClientProfileParamsSchema.parse(req.params)
      const userId  = req.user?.id; 
      await repository.delete(id, userId);
      reply.status(204).send();
    },
  };
}
