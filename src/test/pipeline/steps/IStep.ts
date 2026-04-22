import type Anthropic from "@anthropic-ai/sdk";
import type { PipelineContext } from "../PipelineContext";

export interface IStep {
    exec(ctx: PipelineContext): Promise<PipelineContext>;
}