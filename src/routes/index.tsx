import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Sparkles, Target, TrendingUp, Wallet, Crown, Quote } from "lucide-react";
import founder from "@/assets/nageshwar-shukla.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NSI — Dream & Life Planning OS" },
      { name: "description", content: "Visualize your dreams, plan your finances, and design your future with NSI." },
    ],
  }),
  component: Home,
});

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div {...fade(0)} className="inline-flex items-center gap-2 glass px-4 py-1.5 text-xs tracking-wider uppercase">
              <Sparkles size={14} className="text-gold" /> Premium Life & Financial OS
            </motion.div>
            <motion.h1 {...fade(0.05)} className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-display leading-[1.05]">
              Dream <span className="text-gradient-gold">bigger.</span><br />
              Plan <span className="text-gradient-royal">smarter.</span><br />
              Live your <span className="text-gradient-gold">purpose.</span>
            </motion.h1>
            <motion.p {...fade(0.1)} className="mt-6 text-lg text-muted-foreground max-w-xl">
              The NSI Dream Planner turns your aspirations into a precise daily, weekly and yearly action plan —
              with debt clarity, micro-planning math and a vision board that moves you.
            </motion.p>
            <motion.div {...fade(0.15)} className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="btn-gold rounded-full px-7 py-3 font-semibold">Begin Your Journey</Link>
              <Link to="/about" className="glass rounded-full px-7 py-3 font-medium hover:text-gold transition">Meet the Founder</Link>
            </motion.div>
            <motion.div {...fade(0.2)} className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: "70K+", v: "Lives touched" },
                { k: "1.5M+", v: "Live attendees" },
                { k: "∞", v: "Possibilities" },
              ].map((s) => (
                <div key={s.v} className="glass p-4 text-center">
                  <div className="font-display text-2xl text-gradient-gold">{s.k}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.v}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div {...fade(0.1)} className="relative">
            <div className="absolute -inset-10 bg-[var(--gradient-gold)] opacity-20 blur-3xl rounded-full" />
            <div className="relative glass-strong p-8 animate-float">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl ring-gold overflow-hidden w-20 h-20">
                  <img src={founder} alt="Nageshwar Shukla" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-gold">Founder · CEO</div>
                  <div className="font-display text-2xl">Nageshwar Shukla</div>
                  <div className="text-xs text-muted-foreground">NS International · Ahmedabad</div>
                </div>
              </div>
              <div className="gold-divider my-6" />
              <Quote className="text-gold mb-2" size={22} />
              <p className="font-display text-xl leading-snug">
                “Your dreams deserve a system. Build the life you imagined — one disciplined day at a time.”
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {["LDP", "RTP", "PAR", "ESP"].map((p) => (
                  <div key={p} className="glass px-3 py-2 text-center text-muted-foreground">
                    <span className="text-gold font-semibold">{p}</span> Program
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div {...fade()} className="text-center max-w-2xl mx-auto">
          <div className="text-xs tracking-[0.3em] uppercase text-gold">The NSI System</div>
          <h2 className="mt-3 text-4xl sm:text-5xl font-display">Five pillars to your dream life</h2>
        </motion.div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { i: Target, t: "Dream Mapping", d: "Capture short, medium & long dreams with images, deadlines and emotional reasons." },
            { i: TrendingUp, t: "Micro Planning", d: "Auto-calculated daily, weekly, monthly and yearly income targets to reach every goal." },
            { i: Wallet, t: "Debt Reality", d: "Face debt with clarity. Visualise stress, EMI burden and debt-free timelines." },
            { i: Sparkles, t: "Vision Board", d: "A glowing premium board that keeps your future vivid every single day." },
            { i: Crown, t: "Leadership Tree", d: "Stand inside the NSI hierarchy — from Nageshwar Sir to your own seat at the table." },
            { i: Quote, t: "Daily Motivation", d: "Personalised messages and quotes that push you toward your highest self." },
          ].map((f, i) => (
            <motion.div key={f.t} {...fade(i * 0.05)} className="glass p-6 hover:ring-gold transition">
              <div className="w-12 h-12 rounded-xl glass-strong flex items-center justify-center text-gold mb-4">
                <f.i size={22} />
              </div>
              <h3 className="font-display text-xl">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <motion.div {...fade()} className="glass-strong relative overflow-hidden p-10 sm:p-14 text-center">
          <div className="absolute inset-0 opacity-30 bg-[var(--gradient-royal)]" />
          <div className="relative">
            <div className="text-xs tracking-[0.3em] uppercase text-gold">Begin Today</div>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Your future depends on today's action.</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Open your private NSI dashboard. Add your first dream. Watch your life plan crystallise.
            </p>
            <Link to="/dashboard" className="mt-8 inline-block btn-gold rounded-full px-8 py-3 font-semibold">
              Enter the Dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
