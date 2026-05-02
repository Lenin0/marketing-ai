import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateCampaignBody } from "./campaigns.schema";
import { PipelineRunner } from "../../../pipeline/PipelineRunner";
import { AnalyseStep } from "../../../pipeline/steps/analyse/analyse.step";
import { CopyStep } from "../../../pipeline/steps/copy/copy.step";
import { ImageStep } from "../../../pipeline/steps/image/image.step";
import { IAIProvider } from "../../../infra/contract/ai.contract";
import { IImageProvider } from "../../../infra/contract/imageAI.contract";

export function makeCampaingController(
  aiProvider: IAIProvider,
  imageProvider: IImageProvider
) {
  return {
    async create(
      req: FastifyRequest<{ Body: CreateCampaignBody }>,
      reply: FastifyReply
    ): Promise<void> {
      const { briefing, channel, brandProfile, referenceImageUrl } = req.body;

      const runner = new PipelineRunner(
        [
          new AnalyseStep(aiProvider),
          new CopyStep(aiProvider),
          new ImageStep(aiProvider, imageProvider),
        ],
        { maxRetries: 3, backoffMs: 1000 }
      );

      const result = await runner.run({
        briefing,
        channel,
        clientProfile: brandProfile,
        referenceImageUrl,
      });

      reply.status(201).send({
        output: {
          ...result.generatedCopy,
          imageUrl: result.generatedImageUrl,
        },
      });
    },
  };
}
