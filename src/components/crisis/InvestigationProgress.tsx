import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  { agent: "Situation Agent", text: "Searching recent news and official announcements" },
  { agent: "Mobility Agent", text: "Checking road disruptions and alternative routes" },
  { agent: "Safety Agent", text: "Locating hospitals, shelters and emergency services" },
  { agent: "Verification Agent", text: "Cross-checking sources and timestamps" },
  { agent: "Planner", text: "Building your personalized action plan" },
];

export function InvestigationProgress() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => Math.min(v + 1, STEPS.length - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="panel grid-bg p-6">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-primary pulse-dot" />
        <span className="label-mono">Investigation in progress</span>
      </div>
      <ol className="mt-5 space-y-3">
        {STEPS.map((s, idx) => {
          const done = idx < i;
          const active = idx === i;
          return (
            <li key={s.agent} className={`flex items-start gap-3 transition-opacity ${idx > i ? "opacity-35" : ""}`}>
              <span className={`mt-0.5 grid size-5 place-items-center rounded-full border ${done ? "border-low bg-low/15 text-low" : active ? "border-primary text-primary" : ""}`}>
                {done ? <Check className="size-3" /> : active ? <Loader2 className="size-3 animate-spin" /> : null}
              </span>
              <div>
                <div className="font-mono text-xs text-muted-foreground">{s.agent}</div>
                <div className="text-sm">{s.text}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
