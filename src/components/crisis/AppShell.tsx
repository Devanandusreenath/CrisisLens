import { Link } from "@tanstack/react-router";
import { Bookmark, Database, Radar, Settings, ShieldAlert } from "lucide-react";
import { isDemoMode } from "@/lib/crisis/api";

const nav = [
  { to: "/dashboard", label: "Analyze Situation", icon: Radar },
  { to: "/saved", label: "Saved Investigations", icon: Bookmark },
  { to: "/sources", label: "Sources", icon: Database },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <ShieldAlert className="size-4" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-tight">CrisisLens</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const demo = isDemoMode();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <Logo />
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-sidebar-border p-3">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full pulse-dot ${demo ? "bg-moderate" : "bg-low"}`} />
            <span className="label-mono">{demo ? "Demo mode" : "Live backend"}</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {demo ? "Showing a sample scenario. Connect the backend in Settings." : "Connected to live search."}
          </p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <Logo />
          <nav className="flex gap-1">
            {nav.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} aria-label={label} className="rounded-md p-2 text-muted-foreground" activeProps={{ className: "bg-accent text-foreground" }}>
                <Icon className="size-4" />
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
