import { z } from "zod";
import { buildDemoInvestigation, demoFollowUp } from "./demo";
import type { FollowUpResponse, Investigation, InvestigationRequest } from "./types";

/**
 * API layer for the CrisisLens Python backend.
 * Set VITE_CRISISLENS_API_URL to your FastAPI base URL to go live.
 * When unset, every call is served from the built-in demo scenario.
 */
export const API_BASE: string | undefined = import.meta.env['VITE_CRISISLENS_API_URL'] || undefined;
export const isDemoMode = () => !API_BASE;

export const requestSchema = z.object({
  location: z.string().trim().min(2, "Tell us where you are").max(120),
  situation: z.string().trim().min(5, "Describe what's happening").max(600),
  destination: z.string().trim().max(120).optional(),
  needs: z.string().trim().max(300).optional(),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Search unavailable (${res.status})`);
  return res.json() as Promise<T>;
}

export async function investigate(req: InvestigationRequest): Promise<Investigation> {
  const parsed = requestSchema.parse(req);
  if (isDemoMode()) {
    await sleep(5200);
    return buildDemoInvestigation(parsed);
  }
  return http<Investigation>("/api/investigate", { method: "POST", body: JSON.stringify(parsed) });
}

export async function followUp(investigationId: string, question: string): Promise<FollowUpResponse> {
  if (isDemoMode()) {
    await sleep(900);
    return demoFollowUp(question);
  }
  return http<FollowUpResponse>("/api/follow-up", {
    method: "POST",
    body: JSON.stringify({ investigation_id: investigationId, question }),
  });
}

export async function getInvestigation(id: string): Promise<Investigation> {
  return http<Investigation>(`/api/investigation/${encodeURIComponent(id)}`);
}

export async function health(): Promise<{ status: string }> {
  if (isDemoMode()) return { status: "demo" };
  return http<{ status: string }>("/api/health");
}

/* Local saved investigations (browser only) */
const KEY = "crisislens.saved";
export function loadSaved(): Investigation[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
export function saveInvestigation(inv: Investigation) {
  const list = loadSaved().filter((i) => i.investigation_id !== inv.investigation_id);
  localStorage.setItem(KEY, JSON.stringify([inv, ...list].slice(0, 20)));
}
export function removeSaved(id: string) {
  localStorage.setItem(KEY, JSON.stringify(loadSaved().filter((i) => i.investigation_id !== id)));
}
