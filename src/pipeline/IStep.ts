import { PipelineContext } from "./PipelineContext";
export interface IStep {
    exec(ctx: PipelineContext): Promise<PipelineContext>;
}