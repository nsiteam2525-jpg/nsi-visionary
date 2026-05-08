import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLocal, inr } from "@/lib/storage";
import type { Debt, OtherGoal } from "@/lib/types";
import { useState } from "react";
import { Trash2, Plus, Flame } from "lucide-react";

export const Route = createFileRoute("/debts")({
  head: () => ({ meta: [{ title: "Debt Reality — NSI" }, { name: "description", content: "Face your debts and other responsibilities with clarity." }] }),
  component: DebtsPage,
});

function DebtsPage() {
  const [debts, setDebts] = useLocal<Debt[]>("nsi:debts", []);
  const [others, setOthers] = useLocal<OtherGoal[]>("nsi:others", []);
  const [d, setD] = useState<Partial<Debt>>({ type: "Bank", stress: 3 });
  const [o, setO] = useState<Partial<OtherGoal>>({ category: "Family", priority: 2 });

  const totalDebt = debts.reduce((a, b) => a + b.amount, 0);
  const totalEmi = debts.reduce((a, b) => a + (b.emi || 0), 0);
  const totalOther = others.reduce((a, b) => a + b.amount, 0);
  const stressAvg = debts.length ? debts.reduce((a, b) => a + b.stress, 0) / debts.length : 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Reality Check</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Debt & Responsibilities</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Clarity is freedom. Face the numbers — then build your way out with discipline and dignity.</p>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="glass p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">Total Debt</div><div className="font-display text-3xl mt-2 text-destructive">{inr(totalDebt)}</div></div>
          <div className="glass p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">Monthly EMI</div><div className="font-display text-3xl mt-2">{inr(totalEmi)}</div></div>
          <div className="glass p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Stress Level</div>
            <div className="mt-2 flex items-center gap-2">
              {[1,2,3,4,5].map((n) => <Flame key={n} size={22} className={n <= stressAvg ? "text-destructive" : "text-muted-foreground/30"} />)}
            </div>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          {/* DEBTS */}
          <section>
            <h3 className="font-display text-2xl text-gradient-gold mb-3">Add a Debt</h3>
            <div className="glass-strong p-6 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input className="bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-gold" placeholder="Debt name" value={d.name || ""} onChange={(e) => setD({ ...d, name: e.target.value })} />
                <select className="bg-background/40 border border-border rounded-lg px-3 py-2" value={d.type} onChange={(e) => setD({ ...d, type: e.target.value as Debt["type"] })}>
                  {(["Bank", "Personal", "Friend", "Credit Card", "Other"] as const).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="number" className="bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-gold" placeholder="Amount (₹)" value={d.amount || ""} onChange={(e) => setD({ ...d, amount: Number(e.target.value) })} />
                <input type="number" className="bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-gold" placeholder="Monthly EMI (₹)" value={d.emi || ""} onChange={(e) => setD({ ...d, emi: Number(e.target.value) })} />
                <input type="number" step="0.1" className="bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-gold" placeholder="Interest %" value={d.interest || ""} onChange={(e) => setD({ ...d, interest: Number(e.target.value) })} />
                <select className="bg-background/40 border border-border rounded-lg px-3 py-2" value={d.stress} onChange={(e) => setD({ ...d, stress: Number(e.target.value) as Debt["stress"] })}>
                  {[1,2,3,4,5].map((n) => <option key={n} value={n}>Stress: {n}/5</option>)}
                </select>
              </div>
              <button
                onClick={() => {
                  if (!d.name || !d.amount) return;
                  setDebts([{ id: crypto.randomUUID(), name: d.name!, type: d.type as Debt["type"], amount: d.amount!, emi: d.emi || 0, interest: d.interest || 0, stress: (d.stress as Debt["stress"]) || 3 }, ...debts]);
                  setD({ type: "Bank", stress: 3 });
                }}
                className="btn-gold rounded-full px-5 py-2 inline-flex items-center gap-2 text-sm font-semibold"
              ><Plus size={14} /> Add Debt</button>
            </div>

            <div className="mt-4 space-y-3">
              {debts.length === 0 && <div className="glass p-5 text-sm text-muted-foreground text-center">No debts. Stay disciplined.</div>}
              {debts.map((x) => (
                <motion.div key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{x.name} <span className="text-xs text-muted-foreground">· {x.type}</span></div>
                    <div className="text-sm text-destructive">{inr(x.amount)} <span className="text-muted-foreground">· EMI {inr(x.emi)} · {x.interest}%</span></div>
                  </div>
                  <button onClick={() => setDebts(debts.filter((y) => y.id !== x.id))} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* OTHERS */}
          <section>
            <h3 className="font-display text-2xl text-gradient-gold mb-3">Other Goals & Responsibilities</h3>
            <div className="glass-strong p-6 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input className="bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-gold" placeholder="Title" value={o.title || ""} onChange={(e) => setO({ ...o, title: e.target.value })} />
                <select className="bg-background/40 border border-border rounded-lg px-3 py-2" value={o.category} onChange={(e) => setO({ ...o, category: e.target.value })}>
                  {["Family", "Charity", "Emergency Fund", "Health", "Education", "Investment", "Spiritual", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="number" className="bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-gold sm:col-span-2" placeholder="Amount (₹)" value={o.amount || ""} onChange={(e) => setO({ ...o, amount: Number(e.target.value) })} />
              </div>
              <button
                onClick={() => {
                  if (!o.title || !o.amount) return;
                  setOthers([{ id: crypto.randomUUID(), title: o.title!, category: o.category!, amount: o.amount!, priority: (o.priority as 1|2|3) || 2 }, ...others]);
                  setO({ category: "Family", priority: 2 });
                }}
                className="btn-gold rounded-full px-5 py-2 inline-flex items-center gap-2 text-sm font-semibold"
              ><Plus size={14} /> Add Goal</button>
            </div>
            <div className="mt-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Total: <span className="text-gold">{inr(totalOther)}</span></div>
              <div className="space-y-3">
                {others.map((x) => (
                  <motion.div key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{x.title} <span className="text-xs text-muted-foreground">· {x.category}</span></div>
                      <div className="text-sm text-gold">{inr(x.amount)}</div>
                    </div>
                    <button onClick={() => setOthers(others.filter((y) => y.id !== x.id))} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
