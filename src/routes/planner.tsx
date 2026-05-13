import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Calendar, ListChecks, Wallet, BookOpen, Flame, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { generateDreamPlan } from "@/lib/planner.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "AI Dream Planner — NSI" }, { name: "description", content: "Turn any dream into an AI-built step-by-step action plan, habits and budget." }] }),
  component: PlannerPage,
});

interface PlanRow { id: string; dream_text: string; plan: any; created_at: string; }

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass p-5">
      <div className="flex items-center gap-2 mb-3 text-gold"><span>{icon}</span><h3 className="font-display text-lg">{title}</h3></div>
      <div className="text-sm text-foreground/90 space-y-2">{children}</div>
    </div>
  );
}

function PlanView({ plan }: { plan: any }) {
  if (!plan) return null;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2 glass-strong p-5">
        <div className="text-xs uppercase tracking-widest text-gold mb-1">Your Plan</div>
        <p className="text-base">{plan.summary}</p>
        <p className="text-sm text-muted-foreground mt-2 italic">{plan.why_it_matters}</p>
      </div>
      <Section icon={<Calendar size={18}/>} title="Timeline">
        {plan.timeline?.map((t: any, i: number) => (
          <div key={i} className="border-l-2 border-gold/40 pl-3"><b>{t.phase}</b> · <span className="text-muted-foreground">{t.duration}</span><div className="text-xs">{t.focus}</div></div>
        ))}
      </Section>
      <Section icon={<ListChecks size={18}/>} title="Step-by-step Roadmap">
        <ol className="list-decimal pl-5 space-y-2">{plan.steps?.map((s: any, i: number) => (
          <li key={i}><b>{s.title}</b><div className="text-xs text-muted-foreground">{s.detail}</div></li>
        ))}</ol>
      </Section>
      <Section icon={<Flame size={18}/>} title="Daily Habits">
        <ul className="list-disc pl-5">{plan.daily_habits?.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul>
      </Section>
      <Section icon={<ListChecks size={18}/>} title="Weekly Tasks">
        <ul className="list-disc pl-5">{plan.weekly_tasks?.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul>
      </Section>
      <Section icon={<Wallet size={18}/>} title="Budget Plan">
        <div className="font-semibold text-gold">Save monthly: {plan.budget?.monthly_save}</div>
        <ul className="text-xs space-y-1 mt-2">{plan.budget?.breakdown?.map((b: any, i: number) => (
          <li key={i} className="flex justify-between border-b border-border/50 pb-1"><span>{b.item}</span><span>{b.amount}</span></li>
        ))}</ul>
      </Section>
      <Section icon={<BookOpen size={18}/>} title="Learning Resources">
        <ul className="space-y-2">{plan.resources?.map((r: any, i: number) => (
          <li key={i}><b>{r.title}</b> <span className="text-xs text-muted-foreground">· {r.kind}</span><div className="text-xs">{r.note}</div></li>
        ))}</ul>
      </Section>
      <div className="md:col-span-2 glass p-5">
        <div className="text-xs uppercase tracking-widest text-gold mb-2">First 7 Days</div>
        <ol className="list-decimal pl-5 grid sm:grid-cols-2 gap-1 text-sm">
          {plan.first_7_days?.map((d: string, i: number) => <li key={i}>{d}</li>)}
        </ol>
        <div className="mt-4 p-3 rounded-lg bg-gold/10 border border-gold/30 text-sm italic">"{plan.motivation}"</div>
      </div>
    </div>
  );
}

function PlannerPage() {
  const { user, loading } = useAuth();
  const [dream, setDream] = useState("");
  const [activePlan, setActivePlan] = useState<any>(null);
  const generate = useServerFn(generateDreamPlan);
  const qc = useQueryClient();

  const history = useQuery({
    queryKey: ["dream_plans", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("dream_plans" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PlanRow[];
    },
  });

  const gen = useMutation({
    mutationFn: async () => {
      const row = await generate({ data: { dream } });
      return row as any;
    },
    onSuccess: (row: any) => {
      setActivePlan(row.plan);
      setDream("");
      qc.invalidateQueries({ queryKey: ["dream_plans", user?.id] });
      toast.success("Your plan is ready ✨");
    },
    onError: (e: any) => toast.error(e?.message || "Could not build the plan"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("dream_plans" as any).delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dream_plans", user?.id] }),
  });

  if (!loading && !user) {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in to use the AI Planner</h1>
          <Link to="/login" className="btn-gold rounded-full px-6 py-3 mt-6 inline-block font-semibold">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[88rem] px-4 sm:px-8 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">AI Dream Planner</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Type a dream. Get the plan.</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Step-by-step roadmap, daily habits, monthly budget, learning resources, and your first 7 days — generated by AI for your dream.</p>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-strong p-5">
              <label className="text-[11px] uppercase tracking-widest text-gold/80">Your Dream</label>
              <textarea
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                placeholder="e.g. Start my own clothing brand in 2 years with ₹5L profit/month"
                rows={4}
                className="mt-2 w-full bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2 outline-none text-sm"
              />
              <button
                disabled={!dream.trim() || gen.isPending}
                onClick={() => gen.mutate()}
                className="btn-gold mt-3 w-full rounded-full px-6 py-3 inline-flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              >
                {gen.isPending ? <><Loader2 className="animate-spin" size={16}/> Building plan…</> : <><Sparkles size={16}/> Generate AI Plan</>}
              </button>
              <p className="text-[10px] text-muted-foreground mt-2">Powered by Lovable AI · plan saved to your cloud.</p>
            </div>

            <div className="glass p-5">
              <div className="text-[11px] uppercase tracking-widest text-gold/80 mb-3">Past Plans</div>
              {history.isLoading ? <div className="text-xs text-muted-foreground">Loading…</div> : (history.data ?? []).length === 0 ? (
                <div className="text-xs text-muted-foreground">No plans yet.</div>
              ) : (
                <ul className="space-y-2">
                  {history.data!.map((p) => (
                    <li key={p.id} className="flex items-start gap-2">
                      <button onClick={() => setActivePlan(p.plan)} className="text-left text-sm hover:text-gold flex-1 min-w-0 break-words">{p.dream_text}</button>
                      <button onClick={() => { if (confirm("Delete this plan?")) del.mutate(p.id); }} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 size={14}/></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <motion.div layout className="lg:col-span-2">
            {activePlan ? <PlanView plan={activePlan} /> : (
              <div className="glass p-10 text-center text-muted-foreground">
                <Sparkles className="mx-auto text-gold mb-3" />
                Your AI-generated plan will appear here.
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
