import { cn } from "@/lib/utils";
import type { Severity, SourceType } from "@/lib/crisis/types";

export const sevStyles: Record<Severity, string> = {
  low: "text-low border-low/40 bg-low/10",
  moderate: "text-moderate border-moderate/40 bg-moderate/10",
  high: "text-high border-high/40 bg-high/10",
  critical: "text-critical border-critical/40 bg-critical/10",
};

export function SeverityBadge({ level, className }: { level: Severity; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider", sevStyles[level], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

const srcStyles: Record<SourceType, string> = {
  official: "text-low border-low/40",
  news: "text-info border-info/40",
  local: "text-moderate border-moderate/40",
  search: "text-muted-foreground border-border",
  other: "text-high border-high/40",
};

export function SourceBadge({ type }: { type: SourceType }) {
  return (
    <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", srcStyles[type])}>
      {type}
    </span>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone = value >= 0.8 ? "bg-low" : value >= 0.6 ? "bg-moderate" : "bg-high";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">{pct}%</span>
    </div>
  );
}

export function timeAgo(iso: string) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

export function PanelHeader({ label, title, right }: { label: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
      <div>
        <div className="label-mono">{label}</div>
        <h3 className="mt-1 text-base font-semibold">{title}</h3>
      </div>
      {right}
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      CrisisLens provides AI-assisted information based on currently available sources. Conditions can change rapidly. For
      emergencies, follow instructions from official emergency authorities and contact local emergency services.
    </p>
  );
}
