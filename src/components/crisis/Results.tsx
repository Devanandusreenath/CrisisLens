import { useState } from "react";
import {
  AlertTriangle, Bookmark, Building2, Clock, ExternalLink, Flame, HelpCircle, Hospital, MessageSquare, Pill, Route as RouteIcon, Send, Shield, ShieldCheck, Tent,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { followUp, saveInvestigation } from "@/lib/crisis/api";
import type { ActionStep, Investigation, NearbyService } from "@/lib/crisis/types";
import { ConfidenceBar, Disclaimer, PanelHeader, SeverityBadge, SourceBadge, sevStyles, timeAgo } from "./ui";

export function Results({ inv }: { inv: Investigation }) {
  return (
    <div className="space-y-5 rise">
      {inv.demo && (
        <div className="flex items-center gap-2 rounded-lg border border-moderate/40 bg-moderate/10 px-4 py-2 text-xs text-moderate">
          <AlertTriangle className="size-3.5" /> Demo scenario — sample data for “Heavy rainfall in Aluva”, not live information.
        </div>
      )}
      <Hero inv={inv} />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <ActionPlan inv={inv} />
          <Routes inv={inv} />
          <EvidencePanel inv={inv} />
        </div>
        <div className="space-y-5">
          <MapPanel inv={inv} />
          <Nearby inv={inv} />
          {inv.conflicts.length > 0 && <Conflicts inv={inv} />}
          <Feed inv={inv} />
        </div>
      </div>
      <FollowUp inv={inv} />
      <Disclaimer className="pb-8" />
    </div>
  );
}

function Hero({ inv }: { inv: Investigation }) {
  return (
    <section className="panel overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge level={inv.risk.level} />
            <span className="label-mono">{inv.situation.crisis_type}</span>
          </div>
          <div className="mt-4 label-mono">What should I do now?</div>
          <h2 className="mt-1 text-2xl font-semibold leading-tight md:text-3xl">{inv.primary_action.headline}</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{inv.primary_action.reason}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                saveInvestigation(inv);
                toast.success("Investigation saved");
              }}
            >
              <Bookmark className="size-4" /> Save
            </Button>
          </div>
        </div>
        <div className="space-y-4 border-t bg-surface p-6 lg:border-t-0 lg:border-l">
          <Stat label="Location" value={inv.location.name} sub={inv.location.region} />
          <Stat label="Status" value={inv.situation.status} />
          <div>
            <div className="label-mono">Risk score</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-3xl font-semibold">{inv.risk.score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <div>
            <div className="label-mono">Confidence</div>
            <div className="mt-1.5"><ConfidenceBar value={inv.confidence} /></div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> Verified {timeAgo(inv.last_verified)}
          </div>
        </div>
      </div>
      <div className="border-t px-6 py-4">
        <div className="label-mono">Current situation</div>
        <p className="mt-1 text-sm">{inv.situation.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {inv.risk.drivers.map((d) => (
            <span key={d} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{d}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="label-mono">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

const prioStyle: Record<ActionStep["priority"], string> = {
  now: "text-primary border-primary/40 bg-primary/10",
  next: "text-info border-info/40 bg-info/10",
  avoid: "text-critical border-critical/40 bg-critical/10",
};

function ActionPlan({ inv }: { inv: Investigation }) {
  return (
    <section className="panel">
      <PanelHeader label="Action plan" title="Recommended actions" />
      <ul className="divide-y">
        {inv.action_plan.map((s, i) => (
          <li key={i} className="flex gap-4 px-5 py-4">
            <span className={`h-fit rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${prioStyle[s.priority]}`}>{s.priority}</span>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{s.title}</div>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.detail}</p>
            </div>
            <WhyDialog step={s} inv={inv} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function WhyDialog({ step, inv }: { step: ActionStep; inv: Investigation }) {
  const ev = inv.evidence.filter((e) => step.evidence_ids.includes(e.id));
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground">
          <HelpCircle className="size-4" /> Why?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{step.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{step.why}</p>
        <div className="mt-2 space-y-2">
          {ev.map((e) => (
            <div key={e.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium">{e.source}</span>
                <SourceBadge type={e.source_type} />
              </div>
              <p className="mt-1 text-sm">{e.claim}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{timeAgo(e.timestamp)}</span>
                <ConfidenceBar value={e.confidence} />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Routes({ inv }: { inv: Investigation }) {
  return (
    <section className="panel">
      <PanelHeader label="Mobility" title="Route comparison" />
      <div className="grid gap-3 p-5 md:grid-cols-3">
        {inv.routes.map((r) => (
          <div key={r.name} className={`rounded-lg border p-4 ${r.recommended ? "border-primary/60 bg-primary/5" : "bg-surface"}`}>
            <div className="flex items-center justify-between">
              <span className="font-display font-semibold">{r.name}</span>
              <SeverityBadge level={r.risk} />
            </div>
            <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <RouteIcon className="mt-0.5 size-3.5 shrink-0" /> {r.via}
            </div>
            <p className="mt-3 text-sm">{r.reason}</p>
            <div className="mt-3 flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>{r.evidence_count} sources</span>
              <span>{timeAgo(r.last_checked)}</span>
            </div>
            {r.recommended && <div className="mt-3 label-mono text-primary">Recommended</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidencePanel({ inv }: { inv: Investigation }) {
  return (
    <section className="panel">
      <PanelHeader
        label="Search is the evidence"
        title="Evidence behind this recommendation"
        right={<span className="font-mono text-xs text-muted-foreground">{inv.evidence.length} items</span>}
      />
      <ul className="divide-y">
        {inv.evidence.map((e) => (
          <li key={e.id} className="grid gap-2 px-5 py-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge type={e.source_type} />
                <span className="text-xs font-medium">{e.source}</span>
                {e.verified ? (
                  <span className="flex items-center gap-1 text-[11px] text-low"><ShieldCheck className="size-3" /> Verified</span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-high"><AlertTriangle className="size-3" /> Unverified</span>
                )}
                <span className="text-[11px] text-muted-foreground">· {timeAgo(e.timestamp)}</span>
              </div>
              <p className="mt-1 text-sm">{e.claim}</p>
            </div>
            <div className="flex items-center gap-3">
              <ConfidenceBar value={e.confidence} />
              {e.link && (
                <a href={e.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open source">
                  <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const svcIcon: Record<NearbyService["type"], typeof Hospital> = {
  hospital: Hospital, shelter: Tent, police: Shield, fire: Flame, pharmacy: Pill, other: Building2,
};
const svcTone: Record<NearbyService["type"], string> = {
  hospital: "bg-critical", shelter: "bg-low", police: "bg-info", fire: "bg-high", pharmacy: "bg-moderate", other: "bg-muted-foreground",
};

function MapPanel({ inv }: { inv: Investigation }) {
  return (
    <section className="panel overflow-hidden">
      <PanelHeader label="Situation map" title="Schematic view" />
      <div className="relative aspect-[4/3] grid-bg bg-surface">
        <svg viewBox="0 0 100 75" className="absolute inset-0 size-full">
          <path d="M5 70 C 25 55, 30 30, 20 5" className="fill-none stroke-info/50" strokeWidth="4" />
          <ellipse cx="22" cy="40" rx="12" ry="9" className="fill-critical/15 stroke-critical/50" strokeDasharray="1.5 1" strokeWidth="0.4" />
          <path d="M42 40 L 60 30 L 90 18" className="fill-none stroke-primary" strokeWidth="1.2" />
          <path d="M42 40 L 55 55 L 90 18" className="fill-none stroke-moderate/70" strokeWidth="0.8" strokeDasharray="2 1" />
          <path d="M42 40 L 26 38 L 30 20 L 90 18" className="fill-none stroke-critical/60" strokeWidth="0.8" strokeDasharray="1 1" />
        </svg>
        <Pin x={42} y={53} label="You" className="bg-foreground" />
        <Pin x={90} y={24} label="Destination" className="bg-primary" />
        {inv.nearby_services.map((s) => (
          <span key={s.name} title={s.name} className={`absolute size-2.5 -translate-1/2 rounded-full ring-2 ring-background ${svcTone[s.type]}`} style={{ left: `${s.x}%`, top: `${s.y}%` }} />
        ))}
        <div className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground">
          Red zone: reported waterlogging · Not to scale
        </div>
      </div>
    </section>
  );
}

function Pin({ x, y, label, className }: { x: number; y: number; label: string; className: string }) {
  return (
    <div className="absolute flex -translate-1/2 flex-col items-center" style={{ left: `${x}%`, top: `${(y / 75) * 100}%` }}>
      <span className={`size-3 rounded-full ring-4 ring-background ${className}`} />
      <span className="mt-1 rounded bg-background/80 px-1 font-mono text-[10px]">{label}</span>
    </div>
  );
}

function Nearby({ inv }: { inv: Investigation }) {
  return (
    <section className="panel">
      <PanelHeader label="Safety" title="Nearby help" />
      <ul className="divide-y">
        {inv.nearby_services.map((s) => {
          const Icon = svcIcon[s.type];
          return (
            <li key={s.name} className="flex items-center gap-3 px-5 py-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted"><Icon className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {s.distance_km} km · {s.type} · {s.source}
                </div>
                {s.availability && <div className="text-[11px] text-moderate">{s.availability}</div>}
              </div>
              <a href={s.maps_url} target="_blank" rel="noreferrer" className="shrink-0 rounded-md border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                Open in Maps
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Conflicts({ inv }: { inv: Investigation }) {
  return (
    <section className="panel border-high/40">
      <PanelHeader label="Verification" title="Conflicting information" />
      <div className="space-y-4 p-5">
        {inv.conflicts.map((c) => (
          <div key={c.topic}>
            <div className="text-sm font-medium">{c.topic}</div>
            <div className="mt-2 grid gap-2">
              {[c.claim_a, c.claim_b].map((cl, i) => (
                <div key={i} className="rounded-md border bg-surface p-2.5">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{cl.source}</span><span>{timeAgo(cl.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-sm">{cl.text}</p>
                </div>
              ))}
            </div>
            <p className={`mt-2 rounded-md border px-2.5 py-2 text-xs ${sevStyles.high}`}>{c.resolution}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Feed({ inv }: { inv: Investigation }) {
  return (
    <section className="panel">
      <PanelHeader label="Live intelligence" title="Timeline" right={<span className="mt-1 size-2 rounded-full bg-low pulse-dot" />} />
      <ol className="space-y-3 p-5">
        {inv.feed.map((f, i) => (
          <li key={i} className="flex gap-3">
            <span className="w-16 shrink-0 font-mono text-[11px] text-muted-foreground">{timeAgo(f.timestamp)}</span>
            <div className="min-w-0 flex-1 border-l pl-3">
              <div className="text-sm">{f.event}</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{f.source}</span>
                <ConfidenceBar value={f.confidence} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FollowUp({ inv }: { inv: Investigation }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const suggestions = ["Where is the nearest hospital?", "Should I wait until morning?", "Is the dam being opened?"];

  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    try {
      const r = await followUp(inv.investigation_id, question);
      setMsgs((m) => [...m, { role: "ai", text: r.answer }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Search unavailable");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <PanelHeader label="Follow-up" title="Ask about this situation" right={<MessageSquare className="size-4 text-muted-foreground" />} />
      <div className="space-y-3 p-5">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-2xl rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-primary/15" : "bg-surface border"}`}>{m.text}</div>
        ))}
        {busy && <div className="text-xs text-muted-foreground">Checking evidence…</div>}
        {msgs.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => ask(s)} className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">{s}</button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a follow-up question…" maxLength={300} />
          <Button type="submit" disabled={busy || !q.trim()} aria-label="Send"><Send className="size-4" /></Button>
        </form>
      </div>
    </section>
  );
}
