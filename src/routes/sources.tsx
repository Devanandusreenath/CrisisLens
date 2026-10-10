import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/crisis/AppShell";
import { SourceBadge } from "@/components/crisis/ui";
import type { Investigation } from "@/lib/crisis/types";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "Sources — CrisisLens" },
      { name: "description", content: "Every source consulted in your latest crisis investigation, by type." },
      { property: "og:title", content: "Sources — CrisisLens" },
      { property: "og:description", content: "Every source consulted in your latest crisis investigation, by type." },
    ],
  }),
  component: Sources,
});

function Sources() {
  const [inv, setInv] = useState<Investigation | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("crisislens.last");
    if (raw) setInv(JSON.parse(raw));
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-8">
        <div>
          <div className="label-mono">Latest investigation</div>
          <h1 className="mt-1 text-2xl font-semibold">Sources consulted</h1>
          <p className="mt-1 text-sm text-muted-foreground">Official sources are preferred; unverified sources are shown but weighted lower.</p>
        </div>
        {!inv ? (
          <div className="panel p-8 text-center text-sm text-muted-foreground">
            No investigation yet. <Link to="/dashboard" className="text-primary">Start one</Link>.
          </div>
        ) : (
          <ul className="panel divide-y">
            {inv.sources.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  <SourceBadge type={s.type} />
                  <span className="text-sm">{s.name}</span>
                </div>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open">
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
