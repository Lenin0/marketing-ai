import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { buildApp } from "../../../server";
import { container } from "../../../container";
import type { IClientProfileRepository } from "../../../infra/contract/clientProfile.contratc";
import type { ClientProfile } from "../../../infra/contract/clientProfile.contratc";


const VALID_UUID    = "550e8400-e29b-41d4-a716-446655440000";
const NOTFOUND_UUID = "660e8400-e29b-41d4-a716-446655440000";

const validProfile: ClientProfile = {
  id:               VALID_UUID,
  companyName:      "BZU",
  voiceDescription: "técnico e confiável",
  colors:           ["#0057B7"],
  createdAt:        new Date(),
  updatedAt:        new Date(),
};

const validCreatePayload = {
  companyName:      "BZU",
  voiceDescription: "técnico e confiável",
  colors:           ["#0057B7"],
};

function makeRepository(): IClientProfileRepository {
  return {
    create:   vi.fn().mockResolvedValue(validProfile),
    findAll:  vi.fn().mockResolvedValue([validProfile]),
    findById: vi.fn().mockResolvedValue(validProfile),
    update:   vi.fn().mockResolvedValue(validProfile),
    delete:   vi.fn().mockResolvedValue(undefined),
  };
}

function mockAuthenticate(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  (req as any).user = { id: "dev-user-id", email: "dev@local" };
  return Promise.resolve();
}

describe("clientProfile routes", () => {
  let app: FastifyInstance;
  let repository: IClientProfileRepository;

  beforeEach(async () => {
    container.reset();
    repository = makeRepository();

    container.overrideDependency("authenticate",            mockAuthenticate);
    container.overrideDependency("clientProfileRepository", repository);

    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  describe("POST /client-profiles", () => {
    it("should return 201 with created profile", async () => {
      const res = await app.inject({
        method:  "POST",
        url:     "/client-profiles",
        payload: validCreatePayload,
      });

      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res.body)).toMatchObject({ companyName: "BZU" });
    });

    it("should call repository.create with correct data", async () => {
      await app.inject({
        method:  "POST",
        url:     "/client-profiles",
        payload: validCreatePayload,
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ companyName: "BZU" })
      );
    });

    it("should return 400 if companyName is missing", async () => {
      const { companyName: _, ...payload } = validCreatePayload;

      const res = await app.inject({
        method:  "POST",
        url:     "/client-profiles",
        payload,
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 if voiceDescription is missing", async () => {
      const { voiceDescription: _, ...payload } = validCreatePayload;

      const res = await app.inject({
        method:  "POST",
        url:     "/client-profiles",
        payload,
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /client-profiles", () => {
    it("should return 200 with list of profiles", async () => {
      const res = await app.inject({
        method: "GET",
        url:    "/client-profiles",
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toHaveLength(1);
    });

    it("should call repository.findAll", async () => {
      await app.inject({ method: "GET", url: "/client-profiles" });
      expect(repository.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no profiles exist", async () => {
      vi.mocked(repository.findAll).mockResolvedValue([]);

      const res = await app.inject({ method: "GET", url: "/client-profiles" });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toHaveLength(0);
    });
  });

  describe("GET /client-profiles/:id", () => {
    it("should return 200 with profile", async () => {
      const res = await app.inject({
        method: "GET",
        url:    `/client-profiles/${VALID_UUID}`,
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toMatchObject({ id: VALID_UUID });
    });

    it("should return 404 if profile not found", async () => {
      vi.mocked(repository.findById).mockResolvedValue(null);

      const res = await app.inject({
        method: "GET",
        url:    `/client-profiles/${NOTFOUND_UUID}`,
      });

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.body)).toMatchObject({ error: "not_found" });
    });
  });

  describe("PATCH /client-profiles/:id", () => {
    it("should return 200 with updated profile", async () => {
      const res = await app.inject({
        method:  "PATCH",
        url:     `/client-profiles/${VALID_UUID}`,
        payload: { voiceDescription: "novo tom" },
      });

      expect(res.statusCode).toBe(200);
    });

    it("should return 404 if profile not found", async () => {
      vi.mocked(repository.update).mockResolvedValue(null);

      const res = await app.inject({
        method:  "PATCH",
        url:     `/client-profiles/${NOTFOUND_UUID}`,
        payload: { voiceDescription: "novo tom" },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /client-profiles/:id", () => {
    it("should return 204 on successful delete", async () => {
      const res = await app.inject({
        method: "DELETE",
        url:    `/client-profiles/${VALID_UUID}`,
      });

      expect(res.statusCode).toBe(204);
    });

    it("should call repository.delete with correct id", async () => {
      await app.inject({
        method: "DELETE",
        url:    `/client-profiles/${VALID_UUID}`,
      });

      expect(repository.delete).toHaveBeenCalledWith(
        VALID_UUID,
        "dev-user-id"
      );
    });
  });
});