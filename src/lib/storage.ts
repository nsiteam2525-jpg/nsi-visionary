import { useEffect, useState } from "react";

export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

// Single source of truth for dream countdown math
// deadline_years is stored as decimal years; 1 year === 365 days exactly
// to match what the user enters in the form (Days/Weeks/Months/Years).
export function dreamTargetMs(createdAt?: string | null, deadlineYears?: number | null): number {
  const start = createdAt ? new Date(createdAt).getTime() : Date.now();
  return start + (deadlineYears || 0) * 365 * 86400000;
}
export function dreamCountdown(createdAt?: string | null, deadlineYears?: number | null, now: number = Date.now()) {
  const target = dreamTargetMs(createdAt, deadlineYears);
  const diff = target - now;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  return { target, diff, overdue: diff < 0, days, hours, minutes, seconds };
}

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

// Compact Indian short form: ₹2 Cr, ₹1.3 Cr, ₹50 L, ₹12 K
export function inrShort(n: number): string {
  const v = Number(n) || 0;
  const sign = v < 0 ? "-" : "";
  const a = Math.abs(v);
  const trim = (x: number) => {
    const s = x.toFixed(2);
    return s.replace(/\.?0+$/, "");
  };
  if (a >= 1e7) return `${sign}₹${trim(a / 1e7)} Cr`;
  if (a >= 1e5) return `${sign}₹${trim(a / 1e5)} L`;
  if (a >= 1e3) return `${sign}₹${trim(a / 1e3)} K`;
  return `${sign}₹${a}`;
}
