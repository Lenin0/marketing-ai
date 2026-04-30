import { PipelineContext } from "./PipelineContext";

export interface PipelineOptions {
    maxRetries?: number;
    backoffMs?: number;
  }

export interface IStep {
    exec(ctx: PipelineContext): Promise<PipelineContext>;
}