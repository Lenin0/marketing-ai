import type { RateLimitOptions } from "@fastify/rate-limit";

export const generationRateLimit: RateLimitOptions = {
  max: 10,
  timeWindow: "1 minute",
  errorResponseBuilder: () => ({
    error: "rate_limit_exceeded",
    message: "Generation limit reached, please wait before generating again",
  }),
};

export const defaultRateLimit: RateLimitOptions = {
  max: 60,
  timeWindow: "1 minute",
  errorResponseBuilder: () => ({
    error: "rate_limit_exceeded",
    message: "Too many requests, please try again later",
  }),
};
