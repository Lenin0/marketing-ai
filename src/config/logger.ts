import type { FastifyServerOptions } from "fastify";

type FastifyLogger = NonNullable<FastifyServerOptions["logger"]>;

const devLogger: FastifyLogger = {
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize:      true,
      translateTime: "SYS:HH:MM:ss",
      ignore:        "pid,hostname",
      singleLine:    false,
    },
  },
};

const prodLogger: FastifyLogger = {
  level: "info",
};

export function getLogger(): FastifyLogger {
  switch (process.env.NODE_ENV) {
    case "production": return prodLogger;
    case "test":       return false;     
    default:           return devLogger;
  }
}