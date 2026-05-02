import type { FastifyReply, FastifyRequest } from "fastify";
import { IClientProfileRepository } from "../../../infra/contract/clientProfile.contratc";
import type {
  CreateClientProfileBody,
  UpdateClientProfileBody,
} from "./clientProfile.schema";
import { z } from "zod";


export function makeClientProfileController(repository: IClientProfileRepository) {
  return {
    async create(
      req: FastifyRequest<{ Body: CreateClientProfileBody }>,
      reply: FastifyReply
    ): Promise<void> {
      const profile = await repository.create(req.body);
      reply.status(201).send(profile);
    },

    async findAll(
      _req: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const profileList = await repository.findAll();
      reply.status(200).send(profileList);
    },

    async findById(
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ): Promise<void> {
      const profile = await repository.findById(req.params.id);

      if (!profile) {
        reply.status(404).send({ error: "not_found", message: "profile not found" });
        return;
      }

      reply.status(200).send(profile);
    },

    async update(
      req: FastifyRequest<{ Params: { id: string }; Body: UpdateClientProfileBody }>,
      reply: FastifyReply
    ): Promise<void> {
      const profile = await repository.update(req.params.id, req.body);

      if (!profile) {
        reply.status(404).send({ error: "not_found", message: "profile not found" });
        return;
      }

      reply.status(200).send(profile);
    },

    async delete(
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ): Promise<void> {
      await repository.delete(req.params.id);
      reply.status(204).send();
    },
  };
}