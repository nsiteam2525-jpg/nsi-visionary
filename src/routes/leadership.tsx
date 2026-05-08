import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import founder from "@/assets/nageshwar-shukla.jpg";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/leadership")({
  head: () => ({ meta: [{ title: "Leadership — NSI" }, { name: "description", content: "Meet the NSI leadership hierarchy." }] }),
  component: Leadership,
});

const tree = [
  { name: "Nageshwar Shukla", role: "CEO & Founder", img: founder },
  { name: "Chirag Sir", role: "Senior Leader" },
  { name: "Ashish Sir · Harshit Sir", role: "Leaders" },
  { name: "Vivek Chauhan", role: "Builder · NSI Family" },
];

function Node({ name, role, img, delay }: { name: string; role: string; img?: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong p-6 text-center relative max-w-sm mx-auto"
    >
      <div className="absolute -inset-1 rounded-2xl opacity-40 blur-xl bg-[var(--gradient-gold)] -z-10" />
      <div className="mx-auto w-20 h-20 rounded-full ring-gold overflow-hidden bg-gradient-to-br from-[oklch(0.4_0.18_265)] to-[oklch(0.6_0.2_265)] flex items-center justify-center">
        {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : <Crown className="text-gold" size={28} />}
      </div>
      <div className="mt-4 font-display text-xl">{name}</div>
      <div className="text-xs uppercase tracking-widest text-gold mt-1">{role}</div>
    </motion.div>
  );
}

function Leadership() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-12 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">The NSI Family</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Leadership Tree</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">A line of mentorship — from vision, to leadership, to execution.</p>

        <div className="mt-12 space-y-10">
          {tree.map((p, i) => (
            <div key={p.name} className="relative">
              <Node {...p} delay={i * 0.12} />
              {i < tree.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 + 0.4 }}
                  style={{ transformOrigin: "top" }}
                  className="mx-auto mt-6 w-px h-10 bg-gradient-to-b from-gold to-transparent"
                />
              )}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
