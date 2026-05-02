
import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { clientProfile } from "../db/schema";
import type { IClientProfileRepository, ClientProfile } from "../contract/clientProfile.contratc";
import type { CreateClientProfileBody, UpdateClientProfileBody } from "../../http/routes/clientProfile/clientProfile.schema";

export class ClientProfileRepository implements IClientProfileRepository {
  constructor(private readonly db: Db) {}

  async create(data: CreateClientProfileBody): Promise<ClientProfile> {
    const [profile] = await this.db
      .insert(clientProfile)
      .values({
        companyName:       data.companyName,
        voiceDescription:  data.voiceDescription,
        colors:            data.colors,
        referenceImageUrl: data.referenceImageUrl,
      })
      .returning();

    if (!profile) {
      throw new Error("ClientProfileRepository: failed to create client profile");
    }

    return profile;
  }

  async findAll(): Promise<ClientProfile[]> {
    return this.db.select().from(clientProfile);
  }

  async findById(id: string): Promise<ClientProfile | null> {
    const [profile] = await this.db
      .select()
      .from(clientProfile)
      .where(eq(clientProfile.id, id));

    return profile ?? null;
  }

  async update(id: string, data: UpdateClientProfileBody): Promise<ClientProfile | null> {
    const [profile] = await this.db
      .update(clientProfile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clientProfile.id, id))
      .returning();

    return profile ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(clientProfile)
      .where(eq(clientProfile.id, id));
  }
  
}
