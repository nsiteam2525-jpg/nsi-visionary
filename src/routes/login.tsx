import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — NSI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally { setBusy(false); }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error((r.error as any).message ?? "Google sign-in failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-8 sm:p-10 w-full max-w-md">
        <Link to="/" className="flex justify-center mb-6"><Logo /></Link>
        <div className="text-xs uppercase tracking-[0.3em] text-gold text-center">Welcome to NSI</div>
        <h1 className="mt-2 font-display text-3xl text-center">{mode === "signin" ? "Sign in to continue" : "Create your account"}</h1>

        <button onClick={google} className="mt-6 w-full glass rounded-lg px-4 py-3 text-sm font-medium hover:ring-gold flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.2 35.6 44 30.2 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="flex-1 h-px bg-border" />OR<div className="flex-1 h-px bg-border" /></div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2.5 outline-none" />
          )}
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2.5 outline-none" />
          <input type="password" required placeholder="Password (min 6 chars)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border border-border focus:border-gold rounded-lg px-3 py-2.5 outline-none" />
          <button type="submit" disabled={busy} className="btn-gold w-full rounded-full px-5 py-3 font-semibold disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-gold font-medium">
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
