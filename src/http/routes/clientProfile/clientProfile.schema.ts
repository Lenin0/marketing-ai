import { z } from "zod";

export const CreateClientProfileSchema = z.object({
  companyName: z.string().min(1),
  voiceDescription: z.string().min(1),
  colors: z.array(z.string()).optional(),
  referenceImageUrl: z.string().url().optional(),
});

export const UpdateClientProfileBodySchema = CreateClientProfileSchema.partial();

export const ClientProfileParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateClientProfileBody = z.infer<typeof CreateClientProfileSchema>;
export type UpdateClientProfileBody = z.infer<typeof UpdateClientProfileBodySchema>;