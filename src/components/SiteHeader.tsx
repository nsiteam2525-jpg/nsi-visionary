import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dreams", label: "Dreams" },
  { to: "/achievements", label: "Wins" },
  { to: "/debts", label: "Debts" },
  { to: "/history", label: "History" },
  { to: "/about", label: "Founder" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLogout = async () => { await signOut(); nav({ to: "/" }); };

  return (
    <header className={`sticky top-0 z-50 transition-colors ${scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-lg" : ""}`}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-8 pt-4 pb-2">
        <div className="glass-strong flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
                activeProps={{ className: "px-3 py-2 text-sm rounded-md text-gold" }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-muted-foreground max-w-[140px] truncate">{user.email}</span>
                <button onClick={onLogout} className="glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2"><LogOut size={14}/> Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-gold rounded-full px-5 py-2 text-sm font-semibold">Sign In</Link>
            )}
          </div>
          <button className="md:hidden p-2 text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <div className="glass mt-2 p-3 md:hidden flex flex-col">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-3 py-2 text-sm">{l.label}</Link>
            ))}
            {user ? (
              <button onClick={onLogout} className="px-3 py-2 text-sm text-left">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-gold">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
