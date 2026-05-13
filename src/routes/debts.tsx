import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { inrShort } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { useDebts, useSaveDebt, useDeleteDebt, useGoals, useSaveGoal, useDeleteGoal, type Debt, type OtherGoal } from "@/lib/api";
import { useState } from "react";
import { Trash2, Flame, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/debts")({
  head: () => ({ meta: [{ title: "Debt Reality — NSI" }, { name: "description", content: "Face your debts and other responsibilities with clarity." }] }),
  component: DebtsPage,
});

const debtTypes = ["Bank", "Personal", "Friend", "Credit Card", "Other"];
const goalCats = ["Family", "Charity", "Emergency Fund", "Health", "Education", "Investment", "Spiritual", "Other"];

const emptyDebt = (): Partial<Debt> => ({ name: "", type: "Bank", stress: 3, amount: 0, emi: 0, interest: 0 });
const emptyGoal = (): Partial<OtherGoal> => ({ title: "", category: "Family", priority: 2, amount: 0 });

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-gold/80 mb-1">{label}</div>
      {children}
      {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

function DebtForm({ initial, onSave, onCancel, title, resetOnSave }: { initial: Partial<Debt>; onSave: (d: Partial<Debt>, done: () => void) => void; onCancel?: () => void; title: string; resetOnSave?: boolean }) {
  const [d, setD] = useState<Partial<Debt>>(initial);
  const num = (v: string) => v === "" ? 0 : Number(v);
  const inputCls = "w-full bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-gold";
  return (
    <div className="glass-strong p-6 space-y-3">
      <h3 className="font-display text-xl text-gradient-gold">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Debt Name"><input className={inputCls} placeholder="e.g. Home Loan" value={d.name ?? ""} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
        <Field label="Type">
          <select className={inputCls + " bg-background/40"} value={d.type ?? "Bank"} onChange={(e) => setD({ ...d, type: e.target.value })}>
            {debtTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Total Outstanding (₹)"><input type="number" className={inputCls} placeholder="e.g. 500000" value={d.amount ?? ""} onChange={(e) => setD({ ...d, amount: num(e.target.value) })} /></Field>
        <Field label="Monthly EMI (₹)"><input type="number" className={inputCls} placeholder="e.g. 12000" value={d.emi ?? ""} onChange={(e) => setD({ ...d, emi: num(e.target.value) })} /></Field>
        <Field label="Interest Rate (%)"><input type="number" step="0.1" className={inputCls} placeholder="e.g. 9.5" value={d.interest ?? ""} onChange={(e) => setD({ ...d, interest: num(e.target.value) })} /></Field>
        <Field label="Stress Level">
          <select className={inputCls + " bg-background/40"} value={d.stress ?? 3} onChange={(e) => setD({ ...d, stress: Number(e.target.value) })}>
            {[1,2,3,4,5].map((n) => <option key={n} value={n}>Stress: {n}/5</option>)}
          </select>
        </Field>
      </div>
      <div className="flex gap-2">
        <button onClick={() => {
          if (!d.name || !d.amount) { toast.error("Name and amount required"); return; }
          onSave(d, () => { if (resetOnSave) setD(emptyDebt()); });
        }} className="btn-gold rounded-full px-5 py-2 inline-flex items-center gap-2 text-sm font-semibold"><Check size={14} /> Save</button>
        {onCancel && <button onClick={onCancel} className="glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2"><X size={14} /> Cancel</button>}
      </div>
    </div>
  );
}

function GoalForm({ initial, onSave, onCancel, title, resetOnSave }: { initial: Partial<OtherGoal>; onSave: (d: Partial<OtherGoal>, done: () => void) => void; onCancel?: () => void; title: string; resetOnSave?: boolean }) {
  const [o, setO] = useState<Partial<OtherGoal>>(initial);
  const num = (v: string) => v === "" ? 0 : Number(v);
  const inputCls = "w-full bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-gold";
  return (
    <div className="glass-strong p-6 space-y-3">
      <h3 className="font-display text-xl text-gradient-gold">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Goal Title"><input className={inputCls} placeholder="e.g. Sister's wedding" value={o.title ?? ""} onChange={(e) => setO({ ...o, title: e.target.value })} /></Field>
        <Field label="Category">
          <select className={inputCls + " bg-background/40"} value={o.category ?? "Family"} onChange={(e) => setO({ ...o, category: e.target.value })}>
            {goalCats.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2"><Field label="Amount (₹)"><input type="number" className={inputCls} placeholder="e.g. 300000" value={o.amount ?? ""} onChange={(e) => setO({ ...o, amount: num(e.target.value) })} /></Field></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => {
          if (!o.title || !o.amount) { toast.error("Title and amount required"); return; }
          onSave(o, () => { if (resetOnSave) setO(emptyGoal()); });
        }} className="btn-gold rounded-full px-5 py-2 inline-flex items-center gap-2 text-sm font-semibold"><Check size={14} /> Save</button>
        {onCancel && <button onClick={onCancel} className="glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2"><X size={14} /> Cancel</button>}
      </div>
    </div>
  );
}

function DebtsPage() {
  const { user, loading } = useAuth();
  const { data: debts = [] } = useDebts();
  const { data: others = [] } = useGoals();
  const saveDebt = useSaveDebt(); const delDebt = useDeleteDebt();
  const saveGoal = useSaveGoal(); const delGoal = useDeleteGoal();
  const [editDebt, setEditDebt] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState<string | null>(null);

  if (!loading && !user) {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in to track your debts</h1>
          <Link to="/login" className="btn-gold rounded-full px-6 py-3 mt-6 inline-block font-semibold">Sign In</Link>
        </div>
      </div>
    );
  }

  const totalDebt = debts.reduce((a, b) => a + b.amount, 0);
  const totalEmi = debts.reduce((a, b) => a + (b.emi || 0), 0);
  const totalOther = others.reduce((a, b) => a + b.amount, 0);
  const stressAvg = debts.length ? debts.reduce((a, b) => a + b.stress, 0) / debts.length : 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[88rem] px-4 sm:px-8 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Reality Check</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Debt & Responsibilities</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Clarity is freedom. Face the numbers — then build your way out with discipline and dignity.</p>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="glass p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">Total Debt</div><div className="font-display text-3xl mt-2 text-destructive">{inrShort(totalDebt)}</div></div>
          <div className="glass p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">Monthly EMI</div><div className="font-display text-3xl mt-2">{inrShort(totalEmi)}</div></div>
          <div className="glass p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Stress Level</div>
            <div className="mt-2 flex items-center gap-2">
              {[1,2,3,4,5].map((n) => <Flame key={n} size={22} className={n <= stressAvg ? "text-destructive" : "text-muted-foreground/30"} />)}
            </div>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          <section>
            <DebtForm
              initial={emptyDebt()}
              title="Add a Debt"
              resetOnSave
              onSave={(d, done) => saveDebt.mutate(d, { onSuccess: () => { toast.success("Debt added"); done(); } })}
            />
            <div className="mt-4 space-y-3">
              {debts.length === 0 && <div className="glass p-5 text-sm text-muted-foreground text-center">No debts. Stay disciplined.</div>}
              {debts.map((x) => editDebt === x.id ? (
                <DebtForm key={x.id} initial={x} title="Edit Debt" onCancel={() => setEditDebt(null)}
                  onSave={(patch) => saveDebt.mutate({ ...patch, id: x.id }, { onSuccess: () => { setEditDebt(null); toast.success("Updated"); } })} />
              ) : (
                <motion.div key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{x.name} <span className="text-xs text-muted-foreground">· {x.type}</span></div>
                    <div className="text-sm text-destructive">{inrShort(x.amount)} <span className="text-muted-foreground">· EMI {inrShort(x.emi)} · {x.interest}%</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditDebt(x.id)} className="text-muted-foreground hover:text-gold"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm("Delete?")) delDebt.mutate({ id: x.id, name: x.name }); }} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <GoalForm
              initial={emptyGoal()}
              title="Add Goal / Responsibility"
              resetOnSave
              onSave={(o, done) => saveGoal.mutate(o, { onSuccess: () => { toast.success("Goal added"); done(); } })}
            />
            <div className="mt-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Total: <span className="text-gold">{inrShort(totalOther)}</span></div>
              <div className="space-y-3">
                {others.map((x) => editGoal === x.id ? (
                  <GoalForm key={x.id} initial={x} title="Edit Goal" onCancel={() => setEditGoal(null)}
                    onSave={(patch) => saveGoal.mutate({ ...patch, id: x.id }, { onSuccess: () => { setEditGoal(null); toast.success("Updated"); } })} />
                ) : (
                  <motion.div key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{x.title} <span className="text-xs text-muted-foreground">· {x.category}</span></div>
                      <div className="text-sm text-gold">{inrShort(x.amount)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditGoal(x.id)} className="text-muted-foreground hover:text-gold"><Pencil size={16} /></button>
                      <button onClick={() => { if (confirm("Delete?")) delGoal.mutate({ id: x.id, name: x.title }); }} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                    </div>
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
