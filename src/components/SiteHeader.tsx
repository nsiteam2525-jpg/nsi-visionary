import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dreams", label: "Dreams" },
  { to: "/debts", label: "Debts" },
  { to: "/leadership", label: "Leadership" },
  { to: "/about", label: "Founder" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <div className="glass-strong flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
                activeProps={{ className: "px-3 py-2 text-sm rounded-md text-gold" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link to="/dashboard" className="hidden md:inline-flex btn-gold rounded-full px-5 py-2 text-sm font-semibold">
            Open App
          </Link>
          <button className="md:hidden p-2 text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <div className="glass mt-2 p-3 md:hidden flex flex-col">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-3 py-2 text-sm">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
