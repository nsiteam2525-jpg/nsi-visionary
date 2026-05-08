import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { inr } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { useDreams, useSaveDream, useDeleteDream, type Dream } from "@/lib/api";
import { useState } from "react";
import { Trash2, Plus, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dreams")({
  head: () => ({ meta: [{ title: "Dreams — NSI" }, { name: "description", content: "Map your short, medium and long dreams." }] }),
  component: DreamsPage,
});

const categoryMeta: Record<Dream["category"], { label: string; range: string }> = {
  short: { label: "Short Dreams", range: "6 months – 1 year" },
  medium: { label: "Medium Dreams", range: "2 – 4 years" },
  long: { label: "Long Dreams", range: "5 – 10 years" },
};
const emojis = ["✨", "🚗", "🏠", "💍", "🌍", "📱", "💼", "🎓", "🏖️", "👑", "💎", "🚀"];

const empty = (): Partial<Dream> => ({ category: "short", priority: 2, emoji: "✨", deadline_years: 1, saved: 0, amount: 0, name: "", why: "" });

function DreamForm({ initial, onSave, onCancel, title }: { initial: Partial<Dream>; onSave: (d: Partial<Dream>) => void; onCancel?: () => void; title: string }) {
  const [d, setD] = useState<Partial<Dream>>(initial);
  const num = (v: string) => v === "" ? undefined : Number(v);
  return (
    <div className="glass-strong p-6">
      <h3 className="font-display text-2xl mb-4 text-gradient-gold">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Dream name" value={d.name ?? ""} onChange={(e) => setD({ ...d, name: e.target.value })} />
        <select className="bg-background/40 border border-border rounded-lg px-3 py-2" value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as Dream["category"] })}>
          <option value="short">Short (6m–1y)</option>
          <option value="medium">Medium (2–4y)</option>
          <option value="long">Long (5–10y)</option>
        </select>
        <input type="number" className="bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Amount (₹)" value={d.amount ?? ""} onChange={(e) => setD({ ...d, amount: num(e.target.value) ?? 0 })} />
        <input type="number" step="0.5" className="bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Years to achieve" value={d.deadline_years ?? ""} onChange={(e) => setD({ ...d, deadline_years: num(e.target.value) ?? 1 })} />
        <input type="number" className="bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Saved so far (₹)" value={d.saved ?? ""} onChange={(e) => setD({ ...d, saved: num(e.target.value) ?? 0 })} />
        <select className="bg-background/40 border border-border rounded-lg px-3 py-2" value={d.priority} onChange={(e) => setD({ ...d, priority: Number(e.target.value) })}>
          <option value={1}>High Priority</option><option value={2}>Medium Priority</option><option value={3}>Low Priority</option>
        </select>
        <input className="sm:col-span-2 bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Why this dream matters" value={d.why ?? ""} onChange={(e) => setD({ ...d, why: e.target.value })} />
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          {emojis.map((e) => (
            <button key={e} type="button" onClick={() => setD({ ...d, emoji: e })} className={`w-10 h-10 rounded-lg text-xl ${d.emoji === e ? "ring-gold" : "glass"}`}>{e}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={() => { if (!d.name || !d.amount) { toast.error("Name and amount are required"); return; } onSave(d); }} className="btn-gold rounded-full px-6 py-2 inline-flex items-center gap-2 font-semibold">
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
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Vision Board</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Your Dreams Universe</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Every dream you add becomes a star in your sky. Add it. See it. Earn it.</p>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DreamForm
              initial={empty()}
              title="Add a Dream"
              onSave={(d) => save.mutate(d, { onSuccess: () => toast.success("Dream added") })}
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {isLoading && <div className="glass p-6 text-center text-sm text-muted-foreground">Loading…</div>}
            {cats.map((c) => {
              const list = dreams.filter((d) => d.category === c);
              const total = list.reduce((a, b) => a + b.amount, 0);
              return (
                <div key={c}>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <h3 className="font-display text-2xl text-gradient-gold">{categoryMeta[c].label}</h3>
                      <div className="text-xs text-muted-foreground">{categoryMeta[c].range}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Total</div>
                      <div className="font-display text-xl">{inr(total)}</div>
                    </div>
                  </div>
                  {list.length === 0 ? (
                    <div className="glass p-6 text-sm text-muted-foreground text-center">No {c} dreams yet — add one to begin.</div>
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
                      ) : (
                        <motion.div key={d.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 group relative overflow-hidden">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center text-3xl">{d.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-display text-lg">{d.name}</h4>
                                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition">
                                  <button onClick={() => setEditingId(d.id)} className="text-muted-foreground hover:text-gold"><Pencil size={16} /></button>
                                  <button onClick={() => { if (confirm("Delete this dream?")) del.mutate(d.id); }} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                                </div>
                              </div>
                              <div className="text-gold font-semibold">{inr(d.amount)} <span className="text-xs text-muted-foreground font-normal">· saved {inr(d.saved)}</span></div>
                              <div className="text-xs text-muted-foreground mt-1">{d.deadline_years}y · {d.why || "—"}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
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
