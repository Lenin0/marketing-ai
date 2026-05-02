import { IStep } from "../../IStep";
import { PipelineContext } from "../../PipelineContext";
import { IAIProvider } from "../../../infra/contract/ai.contract";
import { IImageProvider } from "../../../infra/contract/imageAI.contract";
import { buildImagePrompt } from "./image.prompt";

export class ImageStep implements IStep {
  constructor(
    private readonly ai: IAIProvider,
    private readonly imageProvider: IImageProvider
  ) {}

  async exec(ctx: PipelineContext): Promise<PipelineContext> {
    if (!ctx.analysedBriefing) {
      throw new Error("ImageStep: analysedBriefing is required");
    }
    if (ctx.referenceImageUrl) {
      return { 
        ...ctx, 
        generatedImageUrl: ctx.referenceImageUrl 
      };
    }
    const promptToDescribeImage = buildImagePrompt(ctx);
    const visualDescription = await this.ai.complete(promptToDescribeImage, { creativity: "high" });
    const finalPrompt = ctx.clientProfile.colors 
      ? `${visualDescription} - Colors: ${ctx.clientProfile.colors.join(", ")}`
      : visualDescription;
    const imageUrl = await this.imageProvider.generateImage(finalPrompt);

    return {
      ...ctx,
      generatedImageUrl: imageUrl
    };
  }
}