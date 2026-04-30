import { IAIProvider } from "../../../infra/contract/contractAI";
import { AIParser } from "../../../utils/AIparse";
import { IStep } from "../../IStep";
import { PipelineContext } from "../../PipelineContext";
import { buildCopyPrompt } from "./copy.prompt";
import { CopySchema } from "./copy.schema";

export class CopyStep implements IStep {
  constructor(private readonly ai: IAIProvider) {}

  async exec(ctx: PipelineContext): Promise<PipelineContext> {
    if(!ctx.analysedBriefing){
        throw new Error("CopyStep: analysedBriefing is required in context")
    }
    const prompt = buildCopyPrompt(ctx);
    const raw = await this.ai.complete(prompt, { creativity: "medium" });
    const copyResult = AIParser.parse(raw, CopySchema);

    return { 
      ...ctx, 
      generatedCopy: copyResult 
    };
  }
}