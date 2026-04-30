import { spleep } from "../utils/sleep";
import type { IStep } from "./IStep";
import type { PipelineContext } from "./PipelineContext";

export interface PipelineOptions {
  maxRetries?: number;
  backoffMs?: number;
}

export class PipelineRunner {
  constructor(
    private readonly steps: IStep[],
    private readonly options: PipelineOptions = {}
  ) {}

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    let currentCtx = { ...ctx };

    for (const step of this.steps) {
      currentCtx = await this.runWithRetry(step, currentCtx);
    }

    return currentCtx;
  }

  private async runWithRetry(step: IStep, ctx: PipelineContext): Promise<PipelineContext> {
    const maxAttempts = (this.options.maxRetries ?? 1);
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await step.exec(ctx);
      } catch (error) {
        lastError = error;

        const isLastAttempt = attempt === maxAttempts;
        if (isLastAttempt) break;

        const delay = attempt * (this.options.backoffMs ?? 1000);
        await spleep(delay);
      }
    }

    throw lastError;
  }
}