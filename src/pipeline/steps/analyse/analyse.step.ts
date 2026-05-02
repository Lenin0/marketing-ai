import { PipelineContext } from "../../PipelineContext";
import { IStep } from "../../IStep";
import { buildAnalysePrompt } from "./analyse.prompt";

import { AnalysedBriefingSchema } from "./analyse.schema";
import { IAIProvider } from "../../../infra/contract/ai.contract";
import { AIParser } from "../../../utils/AIparse";

export class AnalyseStep implements IStep {
  constructor(private readonly ai: IAIProvider) {}

  async exec(ctx: PipelineContext): Promise<PipelineContext> {
    const prompt = buildAnalysePrompt(ctx);
    const raw = await this.ai.complete(prompt, { creativity: "low" });
    const result = AIParser.parse(raw, AnalysedBriefingSchema);
    return { ...ctx, analysedBriefing: result };
  }
}
