import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Quote, Target, ListChecks, Timer } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDreams } from "@/lib/api";
import { inrShort } from "@/lib/storage";

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
const TASKS = [
  "Spend 30 focused minutes on your #1 dream — no phone.",
  "Write down 3 things you'll do this week to move forward.",
  "Cut one expense today and move that amount to savings.",
  "Reach out to one person who can help your dream.",
  "Read 10 pages of a book related to your goal.",
];

function dayIndex() { const d = new Date(); return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000); }
function pick<T>(a: T[], offset = 0) { return a[(dayIndex() + offset) % a.length]; }

export function DailyMotivation() {
  const { user } = useAuth();
  const { data: dreams = [] } = useDreams();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(i); }, []);

  const focus = useMemo(() => {
    if (!dreams.length) return null;
    const sorted = [...dreams].sort((a, b) => (a.priority - b.priority) || (a.deadline_years - b.deadline_years));
    return sorted[0];
  }, [dreams]);

  const targetDate = focus ? new Date(Date.now() + focus.deadline_years * 365.25 * 86400000) : null;
  const days = targetDate ? Math.max(0, Math.ceil((targetDate.getTime() - now) / 86400000)) : 0;

  if (!user) return null;
  const aff = pick(AFFIRMATIONS);
  const [q, qa] = pick(QUOTES, 1);
  const task = pick(TASKS, 2);

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
            <div className="mt-1 flex items-center gap-2"><span className="text-2xl">{focus.emoji}</span><span className="font-display text-lg break-words">{focus.name}</span></div>
            <div className="text-xs text-muted-foreground">{inrShort(focus.amount)} · {focus.why || "—"}</div>
          </div>
        )}
        <div className="p-4 rounded-xl bg-white/5 border border-border">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold/80"><Timer size={14}/> Countdown</div>
          {focus ? (
            <>
              <div className="mt-1 font-display text-3xl text-gradient-gold">{days}</div>
              <div className="text-xs text-muted-foreground">days until <b>{focus.name}</b></div>
            </>
          ) : <div className="text-sm text-muted-foreground mt-1">Add a dream to start your countdown.</div>}
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-border sm:col-span-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold/80"><ListChecks size={14}/> Today's Action</div>
          <div className="mt-1 text-sm">{task}</div>
        </div>
        <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 sm:col-span-2 flex items-start gap-3">
          <Quote className="text-gold shrink-0" size={18}/>
          <div className="text-sm italic">"{q}" <span className="not-italic text-xs text-muted-foreground">{qa}</span></div>
        </div>
      </div>
    </div>
  );
}
