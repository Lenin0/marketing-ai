import type { FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { CreateCampaignBodySchema } from "./campaigns.schema";
import { makeCampaingController } from "./campaigns.controller";
import type { IAIProvider } from "../../../infra/contract/ai.contract";
import type { IImageProvider } from "../../../infra/contract/imageAI.contract";
import { generationRateLimit } from "../../middlewares/rateLimiter";

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
      config: { rateLimit: generationRateLimit },
      schema: { body: CreateCampaignBodySchema },
    },
    controller.create
  )

}
