import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Quote, Target, Timer } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDreams } from "@/lib/api";
import { inrShort, dreamCountdown } from "@/lib/storage";

const AFFIRMATIONS = [
  "I am the architect of my dream life.",
  "Every action today plants a tree my future self will sit under.",
  "Discipline is the bridge between dreams and reality.",
  "I do hard things because I deserve the life on the other side.",
  "My focus is my fortune.",
  "I am one step closer than yesterday.",
  "Consistency over intensity. Always.",
];
const QUOTES = [
  ["Success is the sum of small efforts, repeated day in and day out.", "— Robert Collier"],
  ["The future depends on what you do today.", "— Mahatma Gandhi"],
  ["Don't watch the clock; do what it does. Keep going.", "— Sam Levenson"],
  ["A goal without a plan is just a wish.", "— Antoine de Saint-Exupéry"],
  ["Discipline equals freedom.", "— Jocko Willink"],
];

function dayIndex() { const d = new Date(); return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000); }
function pick<T>(a: T[], offset = 0) { return a[(dayIndex() + offset) % a.length]; }

export function DailyMotivation() {
  const { user } = useAuth();
  const { data: dreams = [] } = useDreams();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(i); }, []);

  // Pick the active (not achieved) dream with the LEAST time left
  const focus = useMemo(() => {
    const active = dreams.filter((d) => !d.is_achieved);
    if (!active.length) return null;
    const withTarget = active.map((d) => {
      const start = d.created_at ? new Date(d.created_at).getTime() : Date.now();
      const target = start + (d.deadline_years || 1) * 365.25 * 86400000;
      return { d, daysLeft: Math.ceil((target - now) / 86400000) };
    });
    withTarget.sort((a, b) => a.daysLeft - b.daysLeft);
    return withTarget[0];
  }, [dreams, now]);

  if (!user) return null;
  const aff = pick(AFFIRMATIONS);
  const [q, qa] = pick(QUOTES, 1);

  return (
    <div className="glass-strong p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gold"><Sparkles size={18}/><h3 className="font-display text-xl">Daily Motivation</h3></div>
        <Link to="/motivation" className="text-xs text-muted-foreground hover:text-gold">Settings →</Link>
      </div>
      <p className="mt-3 font-display text-2xl text-gradient-gold">{aff}</p>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {focus && (
          <div className="p-4 rounded-xl bg-white/5 border border-border">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold/80"><Target size={14}/> Today's Focus Dream</div>
            <div className="mt-1 flex items-center gap-2"><span className="text-2xl">{focus.d.emoji}</span><span className="font-display text-lg break-words">{focus.d.name}</span></div>
            <div className="text-xs text-muted-foreground">{inrShort(focus.d.amount)} · {focus.d.why || "—"}</div>
          </div>
        )}
        <div className="p-4 rounded-xl bg-white/5 border border-border">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold/80"><Timer size={14}/> Countdown</div>
          {focus ? (
            <>
              <div className="mt-1 font-display text-3xl text-gradient-gold">{Math.max(0, focus.daysLeft)}</div>
              <div className="text-xs text-muted-foreground">days until <b>{focus.d.name}</b></div>
            </>
          ) : <div className="text-sm text-muted-foreground mt-1">Add a dream to start your countdown.</div>}
        </div>
        <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 sm:col-span-2 flex items-start gap-3">
          <Quote className="text-gold shrink-0" size={18}/>
          <div className="text-sm italic">"{q}" <span className="not-italic text-xs text-muted-foreground">{qa}</span></div>
        </div>
      </div>
    </div>
  );
}
