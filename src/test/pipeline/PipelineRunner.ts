import type { IStep } from "./steps/IStep";
import type { PipelineContext } from "./PipelineContext";

export class PipelineRunner {
  constructor(
    private readonly steps: IStep[],
    private readonly options = { maxRetries: 1 }
  ) {}

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    throw new Error("not implemented");
  }
}