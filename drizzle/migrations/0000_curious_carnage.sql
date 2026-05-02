CREATE TABLE "campaings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_profile_id" uuid,
	"briefing" text NOT NULL,
	"channel" text NOT NULL,
	"analysed_briefing" jsonb,
	"generated_copy" jsonb,
	"generated_image_url" text,
	"creat_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientProfile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"voice_description" text NOT NULL,
	"colors" jsonb,
	"reference_image_url" text,
	"create_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaings" ADD CONSTRAINT "campaings_client_profile_id_clientProfile_id_fk" FOREIGN KEY ("client_profile_id") REFERENCES "public"."clientProfile"("id") ON DELETE no action ON UPDATE no action;