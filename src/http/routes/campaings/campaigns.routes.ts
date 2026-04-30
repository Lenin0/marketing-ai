import type { FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { CreateCampaignBodySchema } from "./campaigns.schema";
import { makeCampaingController } from "./campaigns.controller";
import type { IAIProvider } from "../../../infra/contract/contractAI";
import type { IImageProvider } from "../../../infra/contract/contractImage";

export async function campaignRoutes(
  app: FastifyInstance,
  opts: { aiProvider: IAIProvider; imageProvider: IImageProvider }
): Promise<void> {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const controller = makeCampaingController(opts.aiProvider, opts.imageProvider);
  
  app.post(
    "/campaigns",
    {
      schema: {
        body: CreateCampaignBodySchema,
      },
    },
    controller.create
  )

}
