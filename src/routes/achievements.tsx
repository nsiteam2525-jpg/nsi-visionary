import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Calendar, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { useDreams } from "@/lib/api";
import { inrShort } from "@/lib/storage";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — NSI" }, { name: "description", content: "Dreams you have already achieved." }] }),
  component: AchievementsPage,
});

function daysBetween(a?: string, b?: string) {
  if (!a || !b) return null;
  return Math.max(1, Math.round((+new Date(b) - +new Date(a)) / 86400000));
}

function AchievementsPage() {
  const { user, loading } = useAuth();
  const { data: dreams = [], isLoading } = useDreams();

  if (!loading && !user) {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in to see your achievements</h1>
          <Link to="/login" className="btn-gold rounded-full px-6 py-3 mt-6 inline-block font-semibold">Sign In</Link>
        </div>
      </div>
    );
  }

  const achieved = dreams.filter((d) => d.amount > 0 && (d.saved || 0) >= d.amount);
  const totalValue = achieved.reduce((a, b) => a + (b.amount || 0), 0);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold flex items-center gap-2"><Trophy size={14}/> Hall of Wins</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl text-gradient-gold">Dreams You Achieved</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Once a dream is fully funded it moves here forever. Look back and feel the proof of your discipline.</p>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="glass-strong p-5"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Total Achieved</div><div className="mt-2 font-display text-3xl text-gradient-gold">{achieved.length}</div></div>
          <div className="glass-strong p-5"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Total Value Won</div><div className="mt-2 font-display text-3xl text-gradient-gold">{inrShort(totalValue)}</div></div>
          <div className="glass-strong p-5"><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Still in Progress</div><div className="mt-2 font-display text-3xl">{dreams.length - achieved.length}</div></div>
        </div>

        {isLoading ? (
          <div className="glass p-8 mt-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : achieved.length === 0 ? (
          <div className="glass p-12 mt-8 text-center">
            <Sparkles className="mx-auto text-gold mb-3" />
            <p className="text-muted-foreground">No dreams achieved yet. Complete a dream by saving its full amount and it will land here.</p>
            <Link to="/dreams" className="btn-gold rounded-full px-6 py-3 mt-6 inline-block font-semibold">Go to Dreams</Link>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achieved.map((d) => {
              const days = daysBetween(d.created_at, d.updated_at);
              const months = days ? Math.round(days / 30) : null;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-5 relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-gold"><Trophy size={18}/></div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-2xl">{d.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg break-words">{d.name}</h3>
                      <div className="text-gold font-semibold">{inrShort(d.amount)}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="glass p-2"><div className="text-muted-foreground flex items-center gap-1"><Calendar size={11}/> Started</div><div className="mt-1">{d.created_at ? new Date(d.created_at).toLocaleDateString("en-IN") : "—"}</div></div>
                    <div className="glass p-2"><div className="text-muted-foreground flex items-center gap-1"><Trophy size={11}/> Achieved</div><div className="mt-1">{d.updated_at ? new Date(d.updated_at).toLocaleDateString("en-IN") : "—"}</div></div>
                  </div>
                  {days && (
                    <div className="mt-3 text-xs text-center glass p-2 text-gold">
                      Conquered in <b>{days} days</b>{months ? ` (~${months} months)` : ""}
                    </div>
                  )}
                  {d.why && <p className="mt-3 text-xs text-muted-foreground italic line-clamp-2">"{d.why}"</p>}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
