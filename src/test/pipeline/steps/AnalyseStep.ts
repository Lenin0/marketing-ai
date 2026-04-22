import type Anthropic from "@anthropic-ai/sdk";
import type { PipelineContext } from "../PipelineContext";
import { IStep } from "./IStep";

export class AnalyseStep implements IStep {
    constructor(private readonly ai: Anthropic) {}

    async exec(ctx: PipelineContext): Promise<PipelineContext> {
        throw new Error("Method not implemented.");
    }
}