import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import founder from "@/assets/nageshwar-shukla.jpg";
import { Quote, Award, Users, Sparkles, Mic } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Nageshwar Shukla — Founder of NSI" }, { name: "description", content: "Life & Business Coach. Founder of NS International. Inspiring 70,000+ lives." }] }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[88rem] px-4 sm:px-8 py-12">
        {/* HERO */}
        <section className="grid lg:grid-cols-5 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-2 relative">
            <div className="absolute -inset-6 rounded-3xl blur-3xl bg-[var(--gradient-gold)] opacity-30" />
            <div className="relative glass-strong p-3 rounded-3xl">
              <img src={founder} alt="Nageshwar Shukla" className="w-full h-auto rounded-2xl object-cover" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="lg:col-span-3">
            <div className="text-xs uppercase tracking-[0.3em] text-gold">Founder · CEO</div>
            <h1 className="mt-3 font-display text-5xl sm:text-6xl leading-tight">Nageshwar <span className="text-gradient-gold">Shukla</span></h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Life & Business Coach. CEO & Founder of <strong className="text-foreground">NS International</strong>, based in Ahmedabad, Gujarat.
              A transformational leader empowering individuals and teams to break limits and lead with purpose.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
              <Stat n="70K+" l="Lives Inspired" />
              <Stat n="1.5M+" l="Live Audience" />
              <Stat n="5" l="Signature Programs" />
            </div>
          </motion.div>
        </section>

        {/* QUOTE */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 glass-strong p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[var(--gradient-royal)]" />
          <div className="relative">
            <Quote className="text-gold mx-auto mb-3" size={28} />
            <p className="font-display text-2xl sm:text-3xl max-w-3xl mx-auto leading-snug">
              "Leadership is not a title. It is the daily decision to become more than you were yesterday — for yourself, your family, and your nation."
            </p>
            <div className="mt-4 text-sm uppercase tracking-widest text-gold">— Nageshwar Shukla</div>
          </div>
        </motion.section>

        {/* PROGRAMS */}
        <section className="mt-16">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-gold">Signature Programs</div>
            <h2 className="mt-2 font-display text-4xl">Transformation by design</h2>
          </div>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { code: "LDP", name: "Leadership Development Program" },
              { code: "RTP", name: "Residential Training Program" },
              { code: "PAR", name: "Parivartan" },
              { code: "ESP", name: "Enagic Signature Program" },
              { code: "RB", name: "Re-Boost" },
            ].map((p, i) => (
              <motion.div key={p.code} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass p-6 text-center hover:ring-gold transition">
                <div className="font-display text-3xl text-gradient-gold">{p.code}</div>
                <div className="text-xs text-muted-foreground mt-2">{p.name}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PILLARS */}
        <section className="mt-16 grid md:grid-cols-3 gap-5">
          {[
            { i: Award, t: "Vision", d: "To raise leaders who build a stronger Bharat through purpose-driven action." },
            { i: Users, t: "Mission", d: "Empower 1 million+ people with the mindset, money and meaning to live freely." },
            { i: Sparkles, t: "Philosophy", d: "Discipline today is the architecture of the life you dream tomorrow." },
          ].map((p, i) => (
            <motion.div key={p.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="glass p-6">
              <p.i className="text-gold" size={22} />
              <h3 className="mt-4 font-display text-2xl">{p.t}</h3>
              <p className="text-muted-foreground text-sm mt-2">{p.d}</p>
            </motion.div>
          ))}
        </section>

        <section className="mt-16 glass p-8 text-center">
          <Mic className="text-gold mx-auto" size={26} />
          <p className="mt-3 font-display text-2xl">Follow Nageshwar Sir for daily inspiration on Instagram & YouTube.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="glass p-4 text-center">
      <div className="font-display text-2xl text-gradient-gold">{n}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
    </div>
  );
}
