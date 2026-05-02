import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const clientProfile = pgTable("clientProfile", { 
    id: uuid("id").primaryKey().defaultRandom(),
    companyName: text("company_name").notNull(),
    voiceDescription: text("voice_description").notNull(),
    colors: jsonb("colors").$type<string[]>(),
    referenceImageUrl: text("reference_image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const campaigns = pgTable("campaings", {
    id: uuid("id").primaryKey().defaultRandom(),
    clientProfileId: uuid("client_profile_id").references(() => clientProfile.id),
    briefing: text("briefing").notNull(),
    channel: text("channel").notNull(),
    analysedBriefing: jsonb("analysed_briefing"),
    generatedCopy: jsonb("generated_copy"),
    generatedImageUrl: text("generated_image_url"),
    createdAt: timestamp("creat_at").defaultNow().notNull(),
})