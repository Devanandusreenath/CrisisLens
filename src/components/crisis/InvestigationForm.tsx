import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_PRESETS } from "@/lib/crisis/demo";
import { requestSchema } from "@/lib/crisis/api";
import type { InvestigationRequest } from "@/lib/crisis/types";

export function InvestigationForm({ onSubmit, busy }: { onSubmit: (r: InvestigationRequest) => void; busy: boolean }) {
  const [form, setForm] = useState<InvestigationRequest>({ location: "", situation: "", destination: "", needs: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof InvestigationRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = requestSchema.safeParse({
      ...form,
      destination: form.destination || undefined,
      needs: form.needs || undefined,
    });
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    onSubmit(r.data);
  };

  return (
    <form onSubmit={submit} className="panel p-5 md:p-6">
      <div className="label-mono">New investigation</div>
      <h2 className="mt-1 text-2xl font-semibold">What is happening?</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Your location" error={errors["location"]}>
          <Input value={form.location} onChange={set("location")} placeholder="e.g. Aluva, Kerala" />
        </Field>
        <Field label="Destination (optional)">
          <Input value={form.destination} onChange={set("destination")} placeholder="e.g. Kakkanad, Kochi" />
        </Field>
        <Field label="Situation" error={errors["situation"]} className="md:col-span-2">
          <Textarea rows={3} value={form.situation} onChange={set("situation")} placeholder="Heavy rain tonight, roads may be flooding…" />
        </Field>
        <Field label="Special needs (optional)" className="md:col-span-2">
          <Input value={form.needs} onChange={set("needs")} placeholder="Elderly parents, wheelchair, medication, children…" />
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          <Search className="size-4" /> Investigate situation
        </Button>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" /> Try demo:
        </span>
        {DEMO_PRESETS.map((p) => (
          <button
            type="button"
            key={p.label}
            onClick={() => setForm({ destination: "", needs: "", ...p.req })}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {p.label}
          </button>
        ))}
      </div>
    </form>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string | undefined; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
