import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, ListChecks, Radio, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/crisis/AppShell";
import { Disclaimer } from "@/components/crisis/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CrisisLens — Live Crisis Intelligence & Action Planner" },
      { name: "description", content: "Live search, multi-source verification and a personalized action plan for fast-changing local emergencies." },
      { property: "og:title", content: "CrisisLens — Live Crisis Intelligence & Action Planner" },
      { property: "og:description", content: "Search is not the answer. Search is the evidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const pipeline = ["Live search", "Multi-source evidence", "Verification", "Risk analysis", "Action plan"];
const features = [
  { icon: Radio, title: "Live intelligence", text: "News, official advisories and local services pulled at the moment you ask." },
  { icon: ShieldCheck, title: "Evidence verification", text: "Sources cross-checked, timestamps compared, conflicts flagged — never hidden." },
  { icon: ListChecks, title: "Action planning", text: "One clear recommendation, with routes, nearby help and the reason behind every step." },
];

function Landing() {
  return (
    <div className="min-h-screen grid-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <Button asChild size="sm" variant="secondary"><Link to="/dashboard">Open dashboard</Link></Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24">
        <div className="flex items-center gap-2 rise">
          <span className="size-2 rounded-full bg-primary pulse-dot" />
          <span className="label-mono">Live crisis intelligence</span>
        </div>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] md:text-7xl rise">
          Search is not the answer.<br />
          <span className="text-primary">Search is the evidence.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground rise">
          Tell CrisisLens where you are and what's happening. It investigates current sources, verifies what it finds and tells you what
          to do next — with the evidence to back it up.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 rise">
          <Button asChild size="lg"><Link to="/dashboard">Analyze a situation <ArrowRight className="size-4" /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/dashboard">Try the Aluva demo</Link></Button>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-2 font-mono text-xs">
          {pipeline.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              <span className="rounded-md border bg-card px-3 py-1.5">{p}</span>
              {i < pipeline.length - 1 && <ArrowRight className="size-3 text-muted-foreground" />}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="panel p-6">
            <Icon className="size-5 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="panel flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <FileSearch className="size-6 shrink-0 text-moderate" />
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
