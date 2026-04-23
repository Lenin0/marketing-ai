import { z } from "zod"

export const AnalysedBriefingSchema = z.object({
  product: z.string().min(1),
  keyBenefit: z.string().min(1),
  audience: z.string().min(1),
  tone: z.enum(["technical", "emotional", "direct", "inspirational"]),
  goal: z.enum(["awareness", "conversion", "retention", "education"]),
  keywords: z.array(z.string()).max(5),
});