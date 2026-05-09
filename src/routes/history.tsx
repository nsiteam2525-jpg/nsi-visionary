import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { useActivity, type Activity } from "@/lib/api";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — NSI" }, { name: "description", content: "Full audit trail of every change to your dreams, debts and goals." }] }),
  component: HistoryPage,
});

const RANGES: { key: string; label: string; days: number }[] = [
  { key: "1w", label: "1 Week", days: 7 },
  { key: "1m", label: "1 Month", days: 30 },
  { key: "6m", label: "6 Months", days: 182 },
  { key: "1y", label: "1 Year", days: 365 },
  { key: "3y", label: "3 Years", days: 365 * 3 },
  { key: "5y", label: "5 Years", days: 365 * 5 },
  { key: "7y", label: "7 Years", days: 365 * 7 },
  { key: "10y", label: "10 Years", days: 365 * 10 },
  { key: "all", label: "All Time", days: 365 * 100 },
];

const ACTIONS = [
  { key: "all", label: "All Actions" },
  { key: "create", label: "Added" },
  { key: "update", label: "Edited" },
  { key: "delete", label: "Deleted" },
] as const;

const ENTITIES = [
  { key: "all", label: "All" },
  { key: "dream", label: "Dreams" },
  { key: "debt", label: "Debts" },
  { key: "goal", label: "Other Goals" },
] as const;

function actionMeta(a: Activity["action"]) {
  if (a === "create") return { Icon: Plus, label: "Added", color: "text-emerald-400" };
  if (a === "update") return { Icon: Pencil, label: "Edited", color: "text-gold" };
  return { Icon: Trash2, label: "Deleted", color: "text-destructive" };
}

function HistoryPage() {
  const { user, loading } = useAuth();
  const { data: items = [], isLoading } = useActivity();
  const [range, setRange] = useState("1m");
  const [action, setAction] = useState<string>("all");
  const [entity, setEntity] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)?.days ?? 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return items.filter((it) => {
      if (new Date(it.created_at).getTime() < cutoff) return false;
      if (action !== "all" && it.action !== action) return false;
      if (entity !== "all" && it.entity_type !== entity) return false;
      if (q && !it.entity_name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, range, action, entity, q]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in to see your history</h1>
          <Link to="/login" className="btn-gold rounded-full px-6 py-3 mt-6 inline-block font-semibold">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Audit Trail</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Activity History</h1>
        <p className="mt-3 text-muted-foreground">Every change you make is timestamped — filter by action, type, or time range.</p>

        <div className="mt-6 glass p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold/80"><Filter size={14}/> Filters</div>
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((a) => (
              <button key={a.key} onClick={() => setAction(a.key)} className={`px-3 py-1.5 rounded-full text-xs ${action === a.key ? "btn-gold font-semibold" : "glass"}`}>{a.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ENTITIES.map((a) => (
              <button key={a.key} onClick={() => setEntity(a.key)} className={`px-3 py-1.5 rounded-full text-xs ${entity === a.key ? "btn-gold font-semibold" : "glass"}`}>{a.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGES.map((r) => (
              <button key={r.key} onClick={() => setRange(r.key)} className={`px-3 py-1.5 rounded-full text-xs ${range === r.key ? "btn-gold font-semibold" : "glass"}`}>{r.label}</button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name…" className="w-full bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none text-sm" />
        </div>

        <div className="mt-6 space-y-2">
          {isLoading && <div className="glass p-6 text-center text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && filtered.length === 0 && <div className="glass p-8 text-center text-sm text-muted-foreground">No activity in this filter range.</div>}
          {filtered.map((it) => {
            const m = actionMeta(it.action);
            const date = new Date(it.created_at);
            return (
              <div key={it.id} className="glass p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl glass-strong flex items-center justify-center ${m.color}`}><m.Icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className={`font-semibold ${m.color}`}>{m.label}</span>{" "}
                    <span className="text-muted-foreground">{it.entity_type}</span>{" · "}
                    <span className="font-medium truncate">{it.entity_name || "—"}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
