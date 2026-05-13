import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { inrShort } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { useDreams, useSaveDream, useDeleteDream, type Dream } from "@/lib/api";
import { useState } from "react";
import { Trash2, Pencil, X, Check, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import { IconPicker } from "@/components/IconPicker";

export const Route = createFileRoute("/dreams")({
  head: () => ({ meta: [{ title: "Dreams — NSI" }, { name: "description", content: "Map your short, medium and long dreams." }] }),
  component: DreamsPage,
});

const categoryMeta: Record<Dream["category"], { label: string; range: string }> = {
  short: { label: "Short Dreams", range: "6 months – 1 year" },
  medium: { label: "Medium Dreams", range: "2 – 4 years" },
  long: { label: "Long Dreams", range: "5 – 10 years" },
};

const empty = (): Partial<Dream> => ({ category: "short", priority: 2, emoji: "✨", deadline_years: 1, saved: 0, amount: 0, name: "", why: "" });

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-gold/80 mb-1">{label}</div>
      {children}
      {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

type DurationUnit = "day" | "week" | "month" | "year";
const UNIT_TO_YEARS: Record<DurationUnit, number> = { day: 1 / 365, week: 7 / 365, month: 1 / 12, year: 1 };

function yearsToBest(years: number): { value: number; unit: DurationUnit } {
  const days = (years || 0) * 365;
  if (days < 7) return { value: Math.max(1, Math.round(days)), unit: "day" };
  if (days < 30) return { value: Math.max(1, Math.round(days / 7)), unit: "week" };
  if (days < 365) return { value: Math.max(1, Math.round(days / 30)), unit: "month" };
  const y = years || 1;
  return { value: Number.isInteger(y) ? y : Number(y.toFixed(1)), unit: "year" };
}

function DreamForm({ initial, onSave, onCancel, title, resetOnSave }: { initial: Partial<Dream>; onSave: (d: Partial<Dream>, done: () => void) => void; onCancel?: () => void; title: string; resetOnSave?: boolean }) {
  const [d, setD] = useState<Partial<Dream>>(initial);
  const initBest = yearsToBest(initial.deadline_years ?? 1);
  const [durValue, setDurValue] = useState<number>(initBest.value);
  const [durUnit, setDurUnit] = useState<DurationUnit>(initBest.unit);
  const num = (v: string) => v === "" ? undefined : Number(v);
  const inputCls = "w-full bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none";
  return (
    <div className="glass-strong p-6">
      <h3 className="font-display text-2xl mb-4 text-gradient-gold">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Dream Name"><input className={inputCls} placeholder="e.g. Dream Home" value={d.name ?? ""} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
        <Field label="Category">
          <select className={inputCls + " bg-background/40"} value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as Dream["category"] })}>
            <option value="short">Short (6m–1y)</option>
            <option value="medium">Medium (2–4y)</option>
            <option value="long">Long (5–10y)</option>
          </select>
        </Field>
        <Field label="Total Price (₹)" hint="Full target amount you need"><input type="number" className={inputCls} placeholder="e.g. 2500000" value={d.amount ?? ""} onChange={(e) => setD({ ...d, amount: num(e.target.value) ?? 0 })} /></Field>
        <Field label="Time to Achieve" hint="Pick any unit — days, weeks, months or years">
          <div className="flex gap-2">
            <input type="number" min={1} step="1" className={inputCls} placeholder="e.g. 30" value={durValue} onChange={(e) => setDurValue(Number(e.target.value) || 1)} />
            <select className={inputCls + " bg-background/40 max-w-[44%]"} value={durUnit} onChange={(e) => setDurUnit(e.target.value as DurationUnit)}>
              <option value="day">Days</option>
              <option value="week">Weeks</option>
              <option value="month">Months</option>
              <option value="year">Years</option>
            </select>
          </div>
        </Field>
        <Field label="Already Saved (₹)" hint="How much you've already saved toward it"><input type="number" className={inputCls} placeholder="e.g. 100000" value={d.saved ?? ""} onChange={(e) => setD({ ...d, saved: num(e.target.value) ?? 0 })} /></Field>
        <Field label="Priority">
          <select className={inputCls + " bg-background/40"} value={d.priority} onChange={(e) => setD({ ...d, priority: Number(e.target.value) })}>
            <option value={1}>High Priority</option><option value={2}>Medium Priority</option><option value={3}>Low Priority</option>
          </select>
        </Field>
        <div className="sm:col-span-2"><Field label="Why this dream matters"><input className={inputCls} placeholder="e.g. To gift my parents peace of mind" value={d.why ?? ""} onChange={(e) => setD({ ...d, why: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Field label="Choose Icon"><IconPicker value={d.emoji ?? "✨"} onChange={(v) => setD({ ...d, emoji: v })} /></Field></div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={() => {
          if (!d.name || !d.amount) { toast.error("Name and amount are required"); return; }
          const deadline_years = (durValue || 1) * UNIT_TO_YEARS[durUnit];
          onSave({ ...d, deadline_years }, () => {
            if (resetOnSave) { setD(empty()); setDurValue(1); setDurUnit("year"); }
          });
        }} className="btn-gold rounded-full px-6 py-2 inline-flex items-center gap-2 font-semibold">
          <Check size={16} /> Save
        </button>
        {onCancel && <button onClick={onCancel} className="glass rounded-full px-5 py-2 inline-flex items-center gap-2"><X size={16} /> Cancel</button>}
      </div>
    </div>
  );
}

function DreamsPage() {
  const { user, loading } = useAuth();
  const { data: dreams = [], isLoading } = useDreams();
  const save = useSaveDream();
  const del = useDeleteDream();
  const [editingId, setEditingId] = useState<string | null>(null);
  const cats: Dream["category"][] = ["short", "medium", "long"];

  if (!loading && !user) {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in to save your dreams</h1>
          <p className="mt-2 text-muted-foreground">Your data is securely stored in the cloud.</p>
          <Link to="/login" className="btn-gold rounded-full px-6 py-3 mt-6 inline-block font-semibold">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[88rem] px-4 sm:px-8 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Vision Board</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Your Dreams Universe</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Every dream you add becomes a star in your sky. Add it. See it. Earn it.</p>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DreamForm
              initial={empty()}
              title="Add a Dream"
              resetOnSave
              onSave={(d, done) => save.mutate(d, { onSuccess: () => { toast.success("Dream added"); done(); } })}
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {isLoading && <div className="glass p-6 text-center text-sm text-muted-foreground">Loading…</div>}
            {(() => {
              const achievedCount = dreams.filter((d) => d.is_achieved).length;
              return achievedCount > 0 ? (
                <Link to="/achievements" className="glass-strong p-4 flex items-center justify-between hover:ring-gold transition group">
                  <div className="flex items-center gap-3"><Trophy className="text-gold" size={20}/>
                    <div><div className="font-display text-lg">{achievedCount} dream{achievedCount > 1 ? "s" : ""} already achieved 🏆</div>
                    <div className="text-xs text-muted-foreground">Moved to your Wins page — open to celebrate.</div></div>
                  </div>
                  <span className="text-gold text-sm">Open Wins →</span>
                </Link>
              ) : null;
            })()}
            {cats.map((c) => {
              const list = dreams.filter((d) => d.category === c && !d.is_achieved);
              const total = list.reduce((a, b) => a + b.amount, 0);
              const saved = list.reduce((a, b) => a + (b.saved || 0), 0);
              return (
                <div key={c}>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <h3 className="font-display text-2xl text-gradient-gold">{categoryMeta[c].label}</h3>
                      <div className="text-xs text-muted-foreground">{categoryMeta[c].range}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Target / Saved</div>
                      <div className="mt-1 flex items-baseline gap-2 justify-end flex-wrap">
                        <span className="font-display text-2xl text-gradient-gold">{inrShort(total)}</span>
                        <span className="text-base text-foreground/80">/ <span className="text-foreground font-semibold">{inrShort(saved)}</span></span>
                      </div>
                    </div>
                  </div>
                  {list.length === 0 ? (
                    <div className="glass p-6 text-sm text-muted-foreground text-center">No active {c} dreams — add one to begin.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {list.map((d) => editingId === d.id ? (
                        <div key={d.id} className="sm:col-span-2">
                          <DreamForm
                            initial={d}
                            title="Edit Dream"
                            onCancel={() => setEditingId(null)}
                            onSave={(patch) => save.mutate({ ...patch, id: d.id }, { onSuccess: () => { setEditingId(null); toast.success("Dream updated"); } })}
                          />
                        </div>
                      ) : (() => {
                        const remain = Math.max((d.amount || 0) - (d.saved || 0), 0);
                        const pct = d.amount > 0 ? Math.min(((d.saved || 0) / d.amount) * 100, 100) : 0;
                        const startDate = d.created_at ? new Date(d.created_at) : new Date();
                        const targetDate = new Date(startDate);
                        targetDate.setDate(targetDate.getDate() + Math.round((d.deadline_years || 1) * 365));
                        const daysLeft = Math.round((+targetDate - Date.now()) / 86400000);
                        const monthsLeft = Math.round(daysLeft / 30);
                        const overdue = daysLeft < 0;
                        return (
                          <motion.div key={d.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 group relative overflow-hidden">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 shrink-0 rounded-2xl glass-strong flex items-center justify-center text-3xl">{d.emoji}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-display text-lg break-words min-w-0 flex-1">{d.name}</h4>
                                  <div className="flex items-center gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition relative z-10">
                                    <button type="button" title="Mark achieved" onClick={() => { if (confirm(`Mark "${d.name}" as achieved?`)) save.mutate({ id: d.id, name: d.name, is_achieved: true, achieved_at: new Date().toISOString() } as any, { onSuccess: () => toast.success("🏆 Moved to Wins!") }); }} className="p-1.5 rounded-md text-muted-foreground hover:text-gold hover:bg-white/5"><Trophy size={16} /></button>
                                    <button type="button" onClick={() => setEditingId(d.id)} aria-label="Edit dream" className="p-1.5 rounded-md text-muted-foreground hover:text-gold hover:bg-white/5"><Pencil size={16} /></button>
                                    <button type="button" onClick={() => { if (confirm("Delete this dream?")) del.mutate({ id: d.id, name: d.name }); }} aria-label="Delete dream" className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-white/5"><Trash2 size={16} /></button>
                                  </div>
                                </div>
                                <div className="text-gold font-semibold">{inrShort(d.amount)} <span className="text-xs text-muted-foreground font-normal">· saved {inrShort(d.saved)} · {inrShort(remain)} to go</span></div>
                                <div className="mt-2 h-1.5 rounded-full bg-border/40 overflow-hidden"><div className="h-full bg-[var(--gradient-gold)]" style={{ width: `${pct}%` }} /></div>
                                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                  <span className="glass px-2 py-0.5 rounded-full">{pct.toFixed(0)}% funded</span>
                                  <span className={`glass px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${overdue ? "text-destructive" : "text-gold"}`}><Clock size={10}/> {overdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d (~${monthsLeft}mo) left`}</span>
                                </div>
                                {d.why && <div className="text-xs text-muted-foreground mt-2 break-words line-clamp-2">{d.why}</div>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })())}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
