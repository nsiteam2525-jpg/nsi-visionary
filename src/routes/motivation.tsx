import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, MessageCircle, Mail, PhoneCall, Sparkles, Sun, Sunrise, Moon, Check, Save, Flame } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/motivation")({
  head: () => ({ meta: [{ title: "Daily Motivation — NSI" }, { name: "description", content: "Choose how your dreams stay in front of you every day." }] }),
  component: MotivationPage,
});

type ChannelKey = "in_app" | "push" | "whatsapp" | "voice" | "email";
type Prefs = {
  channels: Record<ChannelKey, boolean>;
  best_time: "morning" | "afternoon" | "night";
  harder_when_idle: boolean;
  frequency: "daily" | "twice" | "weekly";
  phone?: string | null;
  email?: string | null;
};

const defaults: Prefs = { channels: { in_app: true, push: false, whatsapp: false, voice: false, email: false }, best_time: "morning", harder_when_idle: true, frequency: "daily" };

const channels: { key: ChannelKey; title: string; desc: string; icon: any; badge?: string; live: boolean }[] = [
  { key: "in_app", title: "In-App Daily Card", desc: "Daily affirmation, dream reminder, quote, focus task, and countdown directly inside your dashboard.", icon: Sparkles, live: true },
  { key: "push", title: "Browser Push Notifications", desc: "Receive motivational reminders even when the website is closed. Smart reminders based on your goals and active hours.", icon: Bell, badge: "Most Effective", live: false },
  { key: "whatsapp", title: "WhatsApp Motivation Messages", desc: "Get short powerful motivation messages, dream reminders, and daily action tasks directly on WhatsApp.", icon: MessageCircle, badge: "High Open Rate", live: false },
  { key: "voice", title: "AI Voice Motivation Calls", desc: "Receive AI-generated motivational voice messages with your name, goals, and daily focus.", icon: PhoneCall, badge: "Premium", live: false },
  { key: "email", title: "Email Digest + Weekly Report", desc: "Beautifully designed weekly reports with progress tracking, completed goals, motivation score, and habit consistency.", icon: Mail, live: false },
];

const times = [
  { key: "morning", label: "Morning", icon: Sunrise },
  { key: "afternoon", label: "Afternoon", icon: Sun },
  { key: "night", label: "Night", icon: Moon },
] as const;

function MotivationPage() {
  const { user, loading } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("motivation_preferences" as any).select("*").eq("user_id", user.id).maybeSingle();
      if (data) setPrefs({ ...defaults, ...(data as any), channels: { ...defaults.channels, ...((data as any).channels || {}) } });
      setLoaded(true);
    })();
  }, [user]);

  const toggle = (k: ChannelKey) => setPrefs((p) => ({ ...p, channels: { ...p.channels, [k]: !p.channels[k] } }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("motivation_preferences" as any).upsert({ user_id: user.id, ...prefs } as any);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Preferences saved · your future self is waiting ✨");
  };

  if (!loading && !user) {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in to set your motivation</h1>
          <Link to="/login" className="btn-gold rounded-full px-6 py-3 mt-6 inline-block font-semibold">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Daily Motivation Delivery</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">How should daily motivation reach you?</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl italic">Your future self is waiting. Choose the channels that keep your dreams in front of you — every single day.</p>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {channels.map((c, i) => {
            const on = prefs.channels[c.key];
            const Icon = c.icon;
            return (
              <motion.button
                key={c.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                type="button"
                onClick={() => toggle(c.key)}
                className={`relative text-left p-5 rounded-2xl glass-strong border transition-all duration-300 group overflow-hidden ${on ? "border-gold shadow-[0_0_30px_-8px_var(--tw-shadow-color)] shadow-gold/40" : "border-border hover:border-gold/50"}`}
              >
                {on && <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-gold/10 via-transparent to-transparent" />}
                <div className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition ${on ? "bg-gold text-background" : "bg-white/5 text-gold"}`}><Icon size={22}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-lg">{c.title}</h3>
                      {c.badge && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">{c.badge}</span>}
                      {!c.live && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-border">Soon</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{c.desc}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition ${on ? "bg-gold" : "bg-white/10"}`}>
                    <div className={`w-5 h-5 rounded-full bg-background transition-transform ${on ? "translate-x-5" : ""}`} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="glass-strong p-5">
            <div className="text-[11px] uppercase tracking-widest text-gold/80 mb-3">Best time to motivate you?</div>
            <div className="grid grid-cols-3 gap-2">
              {times.map((t) => {
                const active = prefs.best_time === t.key;
                const Icon = t.icon;
                return (
                  <button key={t.key} type="button" onClick={() => setPrefs({ ...prefs, best_time: t.key })}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition ${active ? "border-gold bg-gold/10 text-gold" : "border-border hover:border-gold/40"}`}>
                    <Icon size={18}/><span className="text-xs">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-widest text-gold/80 mb-2">Frequency</div>
            <select value={prefs.frequency} onChange={(e) => setPrefs({ ...prefs, frequency: e.target.value as any })}
              className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm">
              <option value="daily">Once daily</option>
              <option value="twice">Twice daily (morning + evening)</option>
              <option value="weekly">Weekly summary</option>
            </select>
          </div>

          <div className="glass-strong p-5 flex flex-col">
            <div className="text-[11px] uppercase tracking-widest text-gold/80 mb-3">Smart AI</div>
            <button type="button" onClick={() => setPrefs({ ...prefs, harder_when_idle: !prefs.harder_when_idle })}
              className={`text-left p-4 rounded-xl border transition flex items-start gap-3 ${prefs.harder_when_idle ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"}`}>
              <Flame className={prefs.harder_when_idle ? "text-gold" : "text-muted-foreground"} />
              <div className="flex-1">
                <div className="font-display">Motivate me harder when I stop working on my dreams</div>
                <div className="text-xs text-muted-foreground mt-1">AI watches your activity and turns up intensity when you go quiet for too long.</div>
              </div>
              <div className={`w-11 h-6 rounded-full p-0.5 shrink-0 transition ${prefs.harder_when_idle ? "bg-gold" : "bg-white/10"}`}>
                <div className={`w-5 h-5 rounded-full bg-background transition-transform ${prefs.harder_when_idle ? "translate-x-5" : ""}`} />
              </div>
            </button>

            {(prefs.channels.whatsapp || prefs.channels.voice) && (
              <input type="tel" placeholder="WhatsApp / call number (e.g. +91…)" value={prefs.phone ?? ""}
                onChange={(e) => setPrefs({ ...prefs, phone: e.target.value })}
                className="mt-3 w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm" />
            )}
            {prefs.channels.email && (
              <input type="email" placeholder="Email for weekly digest" value={prefs.email ?? user?.email ?? ""}
                onChange={(e) => setPrefs({ ...prefs, email: e.target.value })}
                className="mt-3 w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm" />
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button onClick={save} disabled={!loaded || saving}
            className="btn-gold rounded-full px-8 py-3 inline-flex items-center gap-2 font-semibold relative shadow-[0_0_30px_-5px_rgba(212,175,55,0.6)] hover:shadow-[0_0_40px_-3px_rgba(212,175,55,0.8)] transition-shadow">
            {saving ? <Check size={16}/> : <Save size={16}/>} Save Preferences
          </button>
          <span className="text-xs text-muted-foreground italic">Channels marked “Soon” save your choice — delivery activates as we light them up.</span>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
