import type { CreateClientProfileBody, UpdateClientProfileBody } from "../../http/routes/clientProfile/clientProfile.schema";

export interface ClientProfile {
  id: string;
  companyName: string;
  voiceDescription: string;
  colors?: string[] | null;
  referenceImageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientProfileRepository {
  create(data: CreateClientProfileBody): Promise<ClientProfile>;
  findAll(): Promise<ClientProfile[]>;
  findById(id: string): Promise<ClientProfile | null>;
  update(id: string, data: UpdateClientProfileBody): Promise<ClientProfile | null>;
  delete(id: string): Promise<void>;
}