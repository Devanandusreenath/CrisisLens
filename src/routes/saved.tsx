import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/crisis/AppShell";
import { Results } from "@/components/crisis/Results";
import { SeverityBadge, timeAgo } from "@/components/crisis/ui";
import { Button } from "@/components/ui/button";
import { loadSaved, removeSaved } from "@/lib/crisis/api";
import type { Investigation } from "@/lib/crisis/types";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Investigations — CrisisLens" },
      { name: "description", content: "Revisit crisis investigations you saved on this device." },
      { property: "og:title", content: "Saved Investigations — CrisisLens" },
      { property: "og:description", content: "Revisit crisis investigations you saved on this device." },
    ],
  }),
  component: Saved,
});

function Saved() {
  const [list, setList] = useState<Investigation[]>([]);
  const [open, setOpen] = useState<Investigation | null>(null);
  useEffect(() => setList(loadSaved()), []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-8">
        <div>
          <div className="label-mono">Stored on this device</div>
          <h1 className="mt-1 text-2xl font-semibold">Saved investigations</h1>
        </div>
        {open ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(null)}>← Back to list</Button>
            <Results inv={open} />
          </>
        ) : list.length === 0 ? (
          <div className="panel p-8 text-center text-sm text-muted-foreground">
            Nothing saved yet. <Link to="/dashboard" className="text-primary">Run an investigation</Link>.
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {list.map((inv) => (
              <li key={inv.investigation_id} className="panel flex items-start justify-between gap-3 p-4">
                <button className="min-w-0 text-left" onClick={() => setOpen(inv)}>
                  <div className="flex items-center gap-2">
                    <SeverityBadge level={inv.risk.level} />
                    <span className="text-xs text-muted-foreground">{timeAgo(inv.last_verified)}</span>
                  </div>
                  <div className="mt-2 font-medium">{inv.request.location}</div>
                  <div className="truncate text-sm text-muted-foreground">{inv.request.situation}</div>
                </button>
                <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => { removeSaved(inv.investigation_id); setList(loadSaved()); }}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
