import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/crisis/AppShell";
import { API_BASE, health, isDemoMode } from "@/lib/crisis/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CrisisLens" },
      { name: "description", content: "Backend connection status and configuration for CrisisLens." },
      { property: "og:title", content: "Settings — CrisisLens" },
      { property: "og:description", content: "Backend connection status and configuration for CrisisLens." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [status, setStatus] = useState("checking…");
  useEffect(() => {
    health().then((h) => setStatus(h.status)).catch(() => setStatus("unreachable"));
  }, []);
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="panel space-y-4 p-5">
          <Row label="Mode" value={isDemoMode() ? "Demo (sample data)" : "Live backend"} />
          <Row label="Backend URL" value={API_BASE ?? "Not configured"} />
          <Row label="Health" value={status} />
        </div>
        <div className="panel p-5 text-sm text-muted-foreground">
          To go live, deploy the Python FastAPI backend (SerpApi + agents) and set{" "}
          <code className="font-mono text-foreground">VITE_CRISISLENS_API_URL</code> to its address. The app calls{" "}
          <code className="font-mono text-foreground">/api/investigate</code>, <code className="font-mono text-foreground">/api/follow-up</code>,{" "}
          <code className="font-mono text-foreground">/api/investigation/:id</code> and <code className="font-mono text-foreground">/api/health</code>.
          API keys stay on the backend.
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="label-mono">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
