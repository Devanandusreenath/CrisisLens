export type Severity = "low" | "moderate" | "high" | "critical";
export type SourceType = "official" | "news" | "local" | "search" | "other";

export interface InvestigationRequest {
  location: string;
  situation: string;
  destination?: string | undefined;
  needs?: string | undefined;
}

export interface Evidence {
  id: string;
  source: string;
  source_type: SourceType;
  timestamp: string;
  claim: string;
  confidence: number;
  link?: string;
  verified: boolean;
}

export interface Conflict {
  topic: string;
  claim_a: { source: string; text: string; timestamp: string };
  claim_b: { source: string; text: string; timestamp: string };
  resolution: string;
}

export interface ActionStep {
  priority: "now" | "next" | "avoid";
  title: string;
  detail: string;
  why: string;
  evidence_ids: string[];
}

export interface RouteOption {
  name: string;
  via: string;
  risk: Severity;
  reason: string;
  evidence_count: number;
  last_checked: string;
  recommended: boolean;
}

export interface NearbyService {
  name: string;
  type: "hospital" | "shelter" | "police" | "fire" | "pharmacy" | "other";
  distance_km: number;
  availability?: string;
  source: string;
  maps_url: string;
  x: number;
  y: number;
}

export interface FeedItem {
  timestamp: string;
  source: string;
  event: string;
  confidence: number;
}

export interface Investigation {
  investigation_id: string;
  demo: boolean;
  request: InvestigationRequest;
  location: { name: string; region: string };
  situation: { crisis_type: string; summary: string; status: string };
  risk: { level: Severity; score: number; drivers: string[] };
  primary_action: { headline: string; reason: string };
  action_plan: ActionStep[];
  routes: RouteOption[];
  nearby_services: NearbyService[];
  evidence: Evidence[];
  conflicts: Conflict[];
  feed: FeedItem[];
  confidence: number;
  last_verified: string;
  sources: { name: string; type: SourceType; url?: string }[];
}

export interface FollowUpResponse {
  answer: string;
  evidence_ids: string[];
}
