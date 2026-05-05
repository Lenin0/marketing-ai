import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { CreateCampaignBodySchema } from "./campaigns.schema";
import { makeCampaingController } from "./campaigns.controller";
import type { IAIProvider } from "../../../infra/contract/ai.contract";
import type { IImageProvider } from "../../../infra/contract/imageAI.contract";
import { generationRateLimit } from "../../middlewares/rateLimiter";

interface CampaignRouteOptions extends FastifyPluginOptions {
  aiProvider: IAIProvider;
  imageProvider: IImageProvider;
  authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
}

export async function campaignRoutes(
  app: FastifyInstance,
  opts: CampaignRouteOptions
): Promise<void> {
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  const controller = makeCampaingController(
    opts.aiProvider,
    opts.imageProvider
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/campaigns",
    {
      onRequest: [opts.authenticate],
      config: { rateLimit: generationRateLimit },
      schema: {
        body: CreateCampaignBodySchema,
      },
    },
    controller.create
  );
}
