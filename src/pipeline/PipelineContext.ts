import { GeneratedCopy } from "./steps/copy/copy.schema";

export type Channel =
  | "instagram_post"
  | "instagram_story"
  | "meta_ad"
  | "linkedin_post"
  | "google_ad"
  | "pitch_deck";

export interface ClientProfile {
  companyName: string;
  voiceDescription: string;
  colors?: string[] | undefined; 
  referenceImageUrl?: string | undefined; 
}

export interface AnalysedBriefing {
  product: string;
  keyBenefit: string;
  audience: string;
  tone: "technical" | "emotional" | "direct" | "inspirational";
  goal: "awareness" | "conversion" | "retention" | "education";
  keywords: string[];
}

export interface PipelineContext {
  briefing: string;
  channel: Channel;
  clientProfile: ClientProfile;
  referenceImageUrl?: string | undefined; 
  analysedBriefing?: AnalysedBriefing;
  generatedCopy?: GeneratedCopy;
  generatedImageUrl?: string | undefined; 
  finalOutput?: unknown;
}