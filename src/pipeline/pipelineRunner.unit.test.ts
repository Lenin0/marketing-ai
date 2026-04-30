import { describe, it, expect, vi } from "vitest";
import { PipelineRunner } from "./PipelineRunner";

import { PipelineContext } from "./PipelineContext";
import { IStep } from "./IStep";

const baseCtx: PipelineContext = {
  briefing: "Produto X para público Y",
  channel: "instagram_post",
  clientProfile: {
    companyName: "BZU",
    voiceDescription: "direto",
  },
};

function makeStep(patch: Partial<PipelineContext>): IStep {
  return {
    exec: vi.fn(async (ctx: PipelineContext) => ({ ...ctx, ...patch })),
  };
}

describe("PipelineRunner", () => {
  describe("sequential execution", () => {
    it("execute the steps in the correct order", async () => {
      const order: number[] = [];

      const step1: IStep = {
        exec: vi.fn(async (ctx) => {
          order.push(1);
          return ctx;
        }),
      };
      const step2: IStep = {
        exec: vi.fn(async (ctx) => {
          order.push(2);
          return ctx;
        }),
      };
      const step3: IStep = {
        exec: vi.fn(async (ctx) => {
          order.push(3);
          return ctx;
        }),
      };

      const runner = new PipelineRunner([step1, step2, step3]);
      await runner.run(baseCtx);

      expect(order).toEqual([1, 2, 3]);
    });

    it("each step recives context enriched by the previous step", async () => {
      const step1 = makeStep({ analysedBriefing: { product: "x" } as never });
      const step2 = makeStep({
        generatedCopy: {
          title: "y",
          hook: "hook",
          body: "body",
          cta: "cta",
          hashtags: [],
        },
      });

      const runner = new PipelineRunner([step1, step2]);
      await runner.run(baseCtx);

      expect(vi.mocked(step2.exec).mock.calls[0]?.[0]).toMatchObject({
        analysedBriefing: { product: "x" },
      });
    });

    it("returns the final context with all accumulated enriched", async () => {
      const step1 = makeStep({ analysedBriefing: { product: "x" } as never });
      const step2 = makeStep({
        generatedCopy: {
          title: "y",
          hook: "hook",
          body: "body",
          cta: "cta",
          hashtags: [],
        },
      });

      const runner = new PipelineRunner([step1, step2]);
      const result = await runner.run(baseCtx);

      expect(result.analysedBriefing).toEqual({ product: "x" });
      expect(result.generatedCopy).toEqual({
        title: "y",
        hook: "hook",
        body: "body",
        cta: "cta",
        hashtags: [],
      });
    });

    it("it does not change the original context between steps", async () => {
      const frozen = Object.freeze({ ...baseCtx }) as PipelineContext;
      const step = makeStep({
        generatedCopy: {
          title: "y",
          hook: "hook",
          body: "body",
          cta: "cta",
          hashtags: [],
        },
      });

      const runner = new PipelineRunner([step]);

      await expect(runner.run(frozen)).resolves.toBeDefined();
    });
  });

  describe("failure tratament", () => {
    it("the pipeline is interrupted when a step throws an error", async () => {
      const step1 = makeStep({ analysedBriefing: { product: "x" } as never });
      const step2: IStep = {
        exec: vi.fn().mockRejectedValue(new Error("schema validation falied")),
      };
      const step3 = makeStep({ generatedCopy: {} as any });

      const runner = new PipelineRunner([step1, step2, step3]);

      await expect(runner.run(baseCtx)).rejects.toThrow(
        "schema validation falied"
      );
      expect(vi.mocked(step3.exec)).not.toHaveBeenCalled();
    });

    it("propagates the original error message from the step", async () => {
      const step: IStep = {
        exec: vi.fn().mockRejectedValue(new Error("AI provider timeout")),
      };

      const runner = new PipelineRunner([step]);
      await expect(runner.run(baseCtx)).rejects.toThrow("AI provider timeout");
    });
  });

  describe("retry", () => {
    it("try again when the step fails and then succed", async () => {
      let attemps = 0;

      const flakyStep: IStep = {
        exec: vi.fn(async (ctx: PipelineContext) => {
          attemps++;
          if (attemps < 3) throw new Error("transient error");
          return { ...ctx, analysedBriefing: { product: "x" } as never };
        }),
      };

      const runner = new PipelineRunner([flakyStep], { maxRetries: 3 });
      const result = await runner.run(baseCtx);

      expect(attemps).toBe(3);
      expect(result.analysedBriefing).toBeDefined();
    });

    it("throw an error after exhausting all attempts", async () => {
      const failingStep: IStep = {
        exec: vi.fn().mockRejectedValue(new Error("persistent error")),
      };

      const runner = new PipelineRunner([failingStep], { maxRetries: 3 });

      await expect(runner.run(baseCtx)).rejects.toThrow("persistent error");
      expect(vi.mocked(failingStep.exec)).toHaveBeenCalledTimes(3);
    });

    it("without retry configuration, it only tries once", async () => {
      const failingStep: IStep = {
        exec: vi.fn().mockRejectedValue(new Error("error")),
      };

      const runner = new PipelineRunner([failingStep]);

      await expect(runner.run(baseCtx)).rejects.toThrow();
      expect(vi.mocked(failingStep.exec)).toHaveBeenCalledTimes(1);
    });

    it("it only retry the failed step, not the previous ones", async () => {
      let attempts = 0;
      const step1 = makeStep({ analysedBriefing: { product: "X" } as never });
      const step2: IStep = {
        exec: vi.fn(async (ctx: PipelineContext) => {
          attempts++;
          if (attempts < 3) throw new Error("transient");
          return { ...ctx, generatedCopy: {} as any };
        }),
      };

      const runner = new PipelineRunner([step1, step2], { maxRetries: 3 });
      await runner.run(baseCtx);

      expect(vi.mocked(step1.exec)).toHaveBeenCalledTimes(1);
      expect(attempts).toBe(3);
    });
  });
});
