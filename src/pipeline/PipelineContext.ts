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
  colors?: string[];
  referenceImageUrl?: string;
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
  referenceImageUrl?: string;
  
  analysedBriefing?: AnalysedBriefing;
  generatedCopy?: unknown;
  generatedImageUrl?: string;
  finalOutput?: unknown;
}