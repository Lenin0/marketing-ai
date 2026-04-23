import { PipelineContext } from "../../PipelineContext";
import { IStep } from "../../IStep";
import { buildAnalysePrompt } from "./analyse.prompt";

import { AnalysedBriefingSchema } from "./analyse.schema";
import { IAIProvider } from "../../../infra/ai/contractAI";
import { AIParser } from "../../../utils/AIparse";

export class AnalyseStep implements IStep {
  constructor(private readonly ai: IAIProvider) {}

  async exec(ctx: PipelineContext): Promise<PipelineContext> {
    const prompt = buildAnalysePrompt(ctx);
    const raw = await this.ai.complete(prompt, { temperature: 0.1 });
    const result = AIParser.parse(raw, AnalysedBriefingSchema);
    return { ...ctx, analysedBriefing: result };
  }
}
