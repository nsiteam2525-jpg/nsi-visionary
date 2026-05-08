import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLocal, inr } from "@/lib/storage";
import { defaultProfile, type UserProfile, type Dream, type Debt, type OtherGoal } from "@/lib/types";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Sparkles, Target, TrendingUp, Wallet, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NSI Life OS" }, { name: "description", content: "Your personal NSI life and financial micro-planning dashboard." }] }),
  component: Dashboard,
});

function Onboarding({ onDone }: { onDone: (p: UserProfile) => void }) {
  const [p, setP] = useState<UserProfile>(defaultProfile);
  const [step, setStep] = useState(0);
  const steps = [
    { label: "What's your full name?", field: "fullName", placeholder: "e.g. Vivek Chauhan", type: "text" },
    { label: "What should we call you?", field: "nickname", placeholder: "Your nickname", type: "text" },
    { label: "Your age?", field: "age", placeholder: "e.g. 26", type: "number" },
    { label: "Your monthly income (₹)?", field: "monthlyIncome", placeholder: "50000", type: "number" },
    { label: "Current savings (₹)?", field: "savings", placeholder: "100000", type: "number" },
    { label: "Target retirement age?", field: "retirementAge", placeholder: "55", type: "number" },
    { label: "Your city?", field: "city", placeholder: "Ahmedabad", type: "text" },
    { label: "Your biggest motivation?", field: "motivation", placeholder: "Family · Freedom · Legacy", type: "text" },
  ] as const;
  const cur = steps[step];
  const value = (p as any)[cur.field] ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-8 sm:p-12 w-full max-w-xl">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Step {step + 1} of {steps.length}</div>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">{cur.label}</h2>
        <input
          autoFocus
          type={cur.type}
          value={value}
          onChange={(e) => setP({ ...p, [cur.field]: cur.type === "number" ? Number(e.target.value) : e.target.value })}
          placeholder={cur.placeholder}
          className="mt-6 w-full bg-transparent border-b-2 border-border focus:border-gold outline-none py-3 text-2xl font-display"
        />
        <div className="mt-2 h-1 rounded-full bg-border/40 overflow-hidden">
          <div className="h-full bg-[var(--gradient-gold)] transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="mt-8 flex justify-between">
          <button disabled={step === 0} onClick={() => setStep(step - 1)} className="text-sm text-muted-foreground disabled:opacity-30">Back</button>
          <button
            onClick={() => {
              if (step === steps.length - 1) onDone({ ...p, onboarded: true });
              else setStep(step + 1);
            }}
            className="btn-gold rounded-full px-6 py-2 text-sm font-semibold inline-flex items-center gap-2"
          >
            {step === steps.length - 1 ? "Enter NSI" : "Continue"} <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Counter({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass p-5">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-2xl sm:text-3xl ${accent ? "text-gradient-gold" : "text-gradient-royal"}`}>{value}</div>
    </div>
  );
}

function Dashboard() {
  const [profile, setProfile] = useLocal<UserProfile>("nsi:profile", defaultProfile);
  const [dreams] = useLocal<Dream[]>("nsi:dreams", []);
  const [debts] = useLocal<Debt[]>("nsi:debts", []);
  const [others] = useLocal<OtherGoal[]>("nsi:others", []);

  const stats = useMemo(() => {
    const sum = (arr: { amount: number }[]) => arr.reduce((a, b) => a + (b.amount || 0), 0);
    const sumSaved = dreams.reduce((a, b) => a + (b.saved || 0), 0);
    const short = sum(dreams.filter((d) => d.category === "short"));
    const medium = sum(dreams.filter((d) => d.category === "medium"));
    const long = sum(dreams.filter((d) => d.category === "long"));
    const dreamTotal = short + medium + long;
    const debtTotal = sum(debts);
    const otherTotal = sum(others);
    const grand = dreamTotal + debtTotal + otherTotal;
    const remaining = Math.max(grand - sumSaved, 0);
    const yearsAvg = dreams.length ? dreams.reduce((a, b) => a + b.deadlineYears, 0) / dreams.length : 5;
    const yearly = remaining / Math.max(yearsAvg, 1);
    const monthly = yearly / 12;
    const weekly = yearly / 52;
    const daily = yearly / 365;
    const completion = grand > 0 ? Math.min((sumSaved / grand) * 100, 100) : 0;
    return { short, medium, long, dreamTotal, debtTotal, otherTotal, grand, remaining, yearly, monthly, weekly, daily, completion, sumSaved };
  }, [dreams, debts, others]);

  if (!profile.onboarded) return (
    <div>
      <SiteHeader />
      <Onboarding onDone={setProfile} />
    </div>
  );

  const pieData = [
    { name: "Short Dreams", value: stats.short, fill: "oklch(0.62 0.22 265)" },
    { name: "Medium Dreams", value: stats.medium, fill: "oklch(0.82 0.16 86)" },
    { name: "Long Dreams", value: stats.long, fill: "oklch(0.70 0.18 200)" },
    { name: "Debts", value: stats.debtTotal, fill: "oklch(0.62 0.23 25)" },
    { name: "Other Goals", value: stats.otherTotal, fill: "oklch(0.65 0.20 320)" },
  ].filter((s) => s.value > 0);

  const barData = [
    { name: "Daily", value: Math.round(stats.daily) },
    { name: "Weekly", value: Math.round(stats.weekly) },
    { name: "Monthly", value: Math.round(stats.monthly) },
    { name: "Yearly", value: Math.round(stats.yearly) },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold">Welcome back</div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">
              {profile.nickname || profile.fullName || "Dreamer"}, your dream life is being built.
            </h1>
            <p className="mt-2 text-muted-foreground italic">"{profile.motivation || "Every day is a step closer."}"</p>
          </div>
          <div className="flex gap-3">
            <Link to="/dreams" className="btn-gold rounded-full px-5 py-2 text-sm font-semibold">+ Add Dream</Link>
            <button onClick={() => setProfile({ ...profile, onboarded: false })} className="glass rounded-full px-4 py-2 text-sm">Edit profile</button>
          </div>
        </motion.div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Counter label="Total Dream Amount" value={inr(stats.dreamTotal)} accent />
          <Counter label="Total Debt" value={inr(stats.debtTotal)} />
          <Counter label="Net Required" value={inr(stats.remaining)} />
          <Counter label="Goal Completion" value={`${stats.completion.toFixed(1)}%`} accent />
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-5">
          <div className="glass p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl">Micro Planning Engine</h3>
              <Sparkles className="text-gold" size={18} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">To finish your remaining {inr(stats.remaining)} on schedule, you need to earn / save:</p>
            <div className="h-64 mt-4">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.08)" />
                  <XAxis dataKey="name" stroke="oklch(0.78 0.03 250)" />
                  <YAxis stroke="oklch(0.78 0.03 250)" tickFormatter={(v) => v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v} />
                  <Tooltip contentStyle={{ background: "oklch(0.18 0.06 265)", border: "1px solid oklch(1 0 0 / 0.15)", borderRadius: 12 }} formatter={(v: any) => inr(Number(v))} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="oklch(0.82 0.16 86)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="font-display text-2xl">Wealth Allocation</h3>
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-4">Add dreams and debts to see your map.</p>
            ) : (
              <div className="h-64 mt-2">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "oklch(0.18 0.06 265)", border: "1px solid oklch(1 0 0 / 0.15)", borderRadius: 12 }} formatter={(v: any) => inr(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-5">
          {[
            { i: Target, t: "Dreams", n: dreams.length, link: "/dreams", desc: "Map your future" },
            { i: Wallet, t: "Debts", n: debts.length, link: "/debts", desc: "Face & defeat" },
            { i: Heart, t: "Other Goals", n: others.length, link: "/debts", desc: "Family · Charity · Health" },
          ].map((c) => (
            <Link key={c.t} to={c.link} className="glass p-6 hover:ring-gold transition group">
              <div className="flex items-center justify-between">
                <c.i className="text-gold" size={22} />
                <span className="font-display text-3xl text-gradient-gold">{c.n}</span>
              </div>
              <h4 className="mt-4 font-display text-xl">{c.t}</h4>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-3 text-xs text-gold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">Open <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>

        <div className="mt-8 glass-strong p-8 text-center">
          <TrendingUp className="text-gold mx-auto" size={28} />
          <p className="mt-3 font-display text-2xl max-w-2xl mx-auto">
            "{profile.nickname || "Dreamer"}, save {inr(Math.max(stats.daily, 0))} every single day — and your entire dream universe completes in {(dreams.length ? (dreams.reduce((a, b) => a + b.deadlineYears, 0) / dreams.length).toFixed(1) : "—")} years."
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
