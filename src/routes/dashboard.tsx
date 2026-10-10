import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/crisis/AppShell";
import { InvestigationForm } from "@/components/crisis/InvestigationForm";
import { InvestigationProgress } from "@/components/crisis/InvestigationProgress";
import { Results } from "@/components/crisis/Results";
import { Disclaimer } from "@/components/crisis/ui";
import { investigate } from "@/lib/crisis/api";
import type { Investigation, InvestigationRequest } from "@/lib/crisis/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Analyze Situation — CrisisLens" },
      { name: "description", content: "Investigate a live crisis and get a verified, evidence-backed action plan." },
      { property: "og:title", content: "Analyze Situation — CrisisLens" },
      { property: "og:description", content: "Investigate a live crisis and get a verified, evidence-backed action plan." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Investigation | null>(null);

  const run = async (req: InvestigationRequest) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const inv = await investigate(req);
      setResult(inv);
      sessionStorage.setItem("crisislens.last", JSON.stringify(inv));
      toast.success("Investigation complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search unavailable");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
        <InvestigationForm onSubmit={run} busy={busy} />
        {busy && <InvestigationProgress />}
        {error && (
          <div className="panel border-destructive/50 p-5">
            <div className="font-medium text-destructive">Search unavailable</div>
            <p className="mt-1 text-sm text-muted-foreground">{error}. Try again in a moment, or check the backend in Settings.</p>
          </div>
        )}
        {result && <Results inv={result} />}
        {!busy && !result && <Disclaimer />}
      </div>
    </AppShell>
  );
}
