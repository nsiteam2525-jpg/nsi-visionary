import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLocal, inr } from "@/lib/storage";
import type { Dream, DreamCategory } from "@/lib/types";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/dreams")({
  head: () => ({ meta: [{ title: "Dreams — NSI" }, { name: "description", content: "Map your short, medium and long dreams." }] }),
  component: DreamsPage,
});

const categoryMeta: Record<DreamCategory, { label: string; range: string; tone: string }> = {
  short: { label: "Short Dreams", range: "6 months – 1 year", tone: "from-blue-500/20" },
  medium: { label: "Medium Dreams", range: "2 – 4 years", tone: "from-amber-500/20" },
  long: { label: "Long Dreams", range: "5 – 10 years", tone: "from-purple-500/20" },
};

const emojis = ["✨", "🚗", "🏠", "💍", "🌍", "📱", "💼", "🎓", "🏖️", "👑", "💎", "🚀"];

function DreamForm({ onAdd }: { onAdd: (d: Dream) => void }) {
  const [d, setD] = useState<Partial<Dream>>({ category: "short", priority: 2, emoji: "✨", deadlineYears: 1, saved: 0 });
  return (
    <div className="glass-strong p-6">
      <h3 className="font-display text-2xl mb-4 text-gradient-gold">Add a Dream</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Dream name" value={d.name || ""} onChange={(e) => setD({ ...d, name: e.target.value })} />
        <select className="bg-background/40 border border-border rounded-lg px-3 py-2" value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as DreamCategory })}>
          <option value="short">Short (6m–1y)</option>
          <option value="medium">Medium (2–4y)</option>
          <option value="long">Long (5–10y)</option>
        </select>
        <input type="number" className="bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Amount (₹)" value={d.amount || ""} onChange={(e) => setD({ ...d, amount: Number(e.target.value) })} />
        <input type="number" step="0.5" className="bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Years to achieve" value={d.deadlineYears || ""} onChange={(e) => setD({ ...d, deadlineYears: Number(e.target.value) })} />
        <input className="sm:col-span-2 bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none" placeholder="Why this dream matters" value={d.why || ""} onChange={(e) => setD({ ...d, why: e.target.value })} />
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          {emojis.map((e) => (
            <button key={e} type="button" onClick={() => setD({ ...d, emoji: e })} className={`w-10 h-10 rounded-lg text-xl ${d.emoji === e ? "ring-gold" : "glass"}`}>{e}</button>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          if (!d.name || !d.amount) return;
          onAdd({
            id: crypto.randomUUID(),
            name: d.name!,
            category: d.category as DreamCategory,
            amount: d.amount!,
            deadlineYears: d.deadlineYears || 1,
            priority: (d.priority as 1 | 2 | 3) || 2,
            why: d.why || "",
            saved: 0,
            emoji: d.emoji || "✨",
          });
          setD({ category: "short", priority: 2, emoji: "✨", deadlineYears: 1, saved: 0 });
        }}
        className="btn-gold rounded-full px-6 py-2 mt-5 inline-flex items-center gap-2 font-semibold"
      >
        <Plus size={16} /> Add to Vision Board
      </button>
    </div>
  );
}

function DreamsPage() {
  const [dreams, setDreams] = useLocal<Dream[]>("nsi:dreams", []);
  const cats: DreamCategory[] = ["short", "medium", "long"];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Vision Board</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Your Dreams Universe</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Every dream you add becomes a star in your sky. Add it. See it. Earn it.</p>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1"><DreamForm onAdd={(nd) => setDreams([nd, ...dreams])} /></div>

          <div className="lg:col-span-2 space-y-8">
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
                      {list.map((d) => (
                        <motion.div key={d.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 group relative overflow-hidden">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl glass-strong flex items-center justify-center text-3xl">{d.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-display text-lg">{d.name}</h4>
                                <button onClick={() => setDreams(dreams.filter((x) => x.id !== d.id))} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                              </div>
                              <div className="text-gold font-semibold">{inr(d.amount)}</div>
                              <div className="text-xs text-muted-foreground mt-1">{d.deadlineYears}y · {d.why || "—"}</div>
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
