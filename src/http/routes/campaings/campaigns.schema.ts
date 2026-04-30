import { z } from "zod";

const BrandProfileSchema = z.object({
  companyName: z.string().min(1),
  voiceDescription: z.string().min(1),
  colors: z.array(z.string()).optional(),
  referenceImageUrl: z.string().url().optional(),
});

export const CreateCampaignBodySchema = z.object({
  briefing: z.string().min(10, "Briefing must be at least 10 characters"),
  channel: z.enum([
    "instagram_post",
    "instagram_story",
    "meta_ad",
    "linkedin_post",
    "google_ad",
    "pitch_deck",
  ]),
  brandProfile: BrandProfileSchema,
  referenceImageUrl: z.string().url().optional(),
});

export const CreateCampaignResponseSchema = z.object({
  output: z.object({
    title: z.string(),
    hook: z.string(),
    body: z.string(),
    cta: z.string(),
    hashtags: z.array(z.string()),
    imageUrl: z.string().optional(),
  }),
});

export type CreateCampaignBody = z.infer<typeof CreateCampaignBodySchema>;