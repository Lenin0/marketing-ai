import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

import type { IAIProvider } from "./infra/contract/ai.contract";
import type { IImageProvider } from "./infra/contract/imageAI.contract";

import type { IContractAuthProvider } from "./infra/auth/contractAuthProvider";

import { FirebaseAuthProvider } from "./infra/auth/firebaseAuthProvider";
import { GeminiAdapter } from "./infra/adapters/geminiAdapter";
import { OpenAIAdapter } from "./infra/adapters/openaiAdapter";
import { createDb } from "./infra/db/client";
import { ClientProfileRepository } from "./infra/repositories/clientProfile.repositories";
import { makeAuthenticate } from "./http/middlewares/authenticate";
import type { FastifyRequest, FastifyReply } from "fastify";
import { IClientProfileRepository } from "./infra/contract/clientProfile.contratc";

export interface IAppDependencies {
  authProvider:            IContractAuthProvider;
  authenticate:            (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  aiProvider:              IAIProvider;
  imageProvider:           IImageProvider;
  db:                      ReturnType<typeof createDb>;
  clientProfileRepository: IClientProfileRepository;
}

export class DependencyContainer {
  private static instance: DependencyContainer;
  private dependencies: Partial<IAppDependencies> = {};

  private constructor() {}

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  public createDependencies(): IAppDependencies {
    const authProvider = new FirebaseAuthProvider();
    const authenticate = makeAuthenticate(authProvider);

    const aiProvider = new GeminiAdapter(
      new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY!)
    );
    const imageProvider = new OpenAIAdapter(
      new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    );

    const db = createDb(process.env.DATABASE_URL!);
    const clientProfileRepository = new ClientProfileRepository(db);

    const deps: IAppDependencies = {
      authProvider,
      authenticate,
      aiProvider,
      imageProvider,
      db,
      clientProfileRepository,
    };

    this.dependencies = deps;
    return deps;
  }

  public getDependencies(): IAppDependencies {
    if (Object.keys(this.dependencies).length === 0) {
      return this.createDependencies();
    }
    return this.dependencies as IAppDependencies;
  }

  public overrideDependency<K extends keyof IAppDependencies>(
    key: K,
    value: IAppDependencies[K]
  ): this {
    this.dependencies[key] = value;

    if (key === "authProvider") {
      this.dependencies.authenticate = makeAuthenticate(
        value as IContractAuthProvider
      );
    }

    return this;
  }

  public reset(): void {
    this.dependencies = {};
  }
}

export const container = DependencyContainer.getInstance();4