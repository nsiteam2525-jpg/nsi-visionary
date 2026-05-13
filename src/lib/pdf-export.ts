import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Dream, Debt, OtherGoal, Profile } from "./api";

const GOLD: [number, number, number] = [201, 162, 39];
const DARK: [number, number, number] = [20, 22, 38];
const MUTED: [number, number, number] = [120, 120, 130];

// Strip emoji / pictographs / unsupported glyphs that render as gibberish in helvetica.
function clean(s: any): string {
  if (s == null) return "";
  return String(s)
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function trim(x: number) { return x.toFixed(2).replace(/\.?0+$/, ""); }

// Full INR with Indian grouping + Lakh/Crore in brackets. PDF-safe: uses "Rs." not ₹ glyph.
export function inrFull(n: number | null | undefined): string {
  const v = Math.round(Number(n) || 0);
  const formatted = new Intl.NumberFormat("en-IN").format(Math.abs(v));
  const sign = v < 0 ? "-" : "";
  let bracket = "";
  const a = Math.abs(v);
  if (a >= 1e7) bracket = ` (${trim(a / 1e7)} Crore)`;
  else if (a >= 1e5) bracket = ` (${trim(a / 1e5)} Lakh)`;
  else if (a >= 1e3) bracket = ` (${trim(a / 1e3)} Thousand)`;
  return `${sign}Rs. ${formatted}${bracket}`;
}

function pageHeader(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("NSI Vision Board", 14, 13);
  doc.setFontSize(11);
  doc.setTextColor(220, 220, 220);
  doc.text(title, 14, 22);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(subtitle, 196, 22, { align: "right" });
  }
}

function decoratePages(doc: jsPDF, generatedAt: string) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    // Top-right credit on every page
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text("Crafted by Vivek Chauhan", 196, 8, { align: "right" });

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Page ${i} of ${pages}`, 196, 290, { align: "right" });
    doc.text(`Generated ${generatedAt}  |  by Vivek Chauhan  |  NSI Vision Board`, 14, 290);
  }
}

export function exportFullReport(opts: {
  profile: Profile | null | undefined;
  dreams: Dream[];
  debts: Debt[];
  goals: OtherGoal[];
}) {
  const { profile, dreams, debts, goals } = opts;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const now = new Date();
  const generatedAt = now.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  // ===== Cover =====
  pageHeader(doc, "Personal Wealth & Dreams Report", generatedAt);
  let y = 46;
  doc.setTextColor(40, 40, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(clean(profile?.full_name || profile?.nickname || "Dreamer"), 14, y);
  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  if (profile?.city) { doc.text(clean(profile.city), 14, y); y += 6; }
  if (profile?.motivation) {
    doc.setFont("helvetica", "italic");
    doc.text(`"${clean(profile.motivation)}"`, 14, y, { maxWidth: 180 });
    y += 10;
  }

  const profileRows: [string, string][] = [
    ["Age", profile?.age ? String(profile.age) : "-"],
    ["Monthly Income", inrFull(Number(profile?.monthly_income ?? 0))],
    ["Current Savings", inrFull(Number(profile?.savings ?? 0))],
    ["Retirement Age", profile?.retirement_age ? String(profile.retirement_age) : "-"],
  ];
  autoTable(doc, {
    startY: y + 4,
    head: [["Profile", "Value"]],
    body: profileRows,
    theme: "grid",
    headStyles: { fillColor: GOLD, textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 11, cellPadding: 3.5, font: "helvetica" },
    columnStyles: { 0: { cellWidth: 60, fontStyle: "bold" } },
  });

  // ===== Summary =====
  const dreamTotal = dreams.reduce((a, b) => a + (b.amount || 0), 0);
  const dreamSaved = dreams.reduce((a, b) => a + (b.saved || 0), 0);
  const achievedDreams = dreams.filter((d) => d.is_achieved);
  const activeDreams = dreams.filter((d) => !d.is_achieved);
  const debtTotal = debts.reduce((a, b) => a + (b.amount || 0), 0);
  const emiTotal = debts.reduce((a, b) => a + (b.emi || 0), 0);
  const goalTotal = goals.reduce((a, b) => a + (b.amount || 0), 0);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [["Summary", "Amount"]],
    body: [
      ["Total Dream Goal", inrFull(dreamTotal)],
      ["Total Saved Toward Dreams", inrFull(dreamSaved)],
      ["Dreams Achieved", `${achievedDreams.length} of ${dreams.length}`],
      ["Total Debt", inrFull(debtTotal)],
      ["Monthly EMI Outflow", inrFull(emiTotal)],
      ["Other Goals", inrFull(goalTotal)],
      ["Net Required to Reach All Dreams", inrFull(Math.max(dreamTotal - dreamSaved, 0))],
    ],
    theme: "grid",
    headStyles: { fillColor: GOLD, textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 11, cellPadding: 3.5, font: "helvetica" },
    columnStyles: { 0: { cellWidth: 90, fontStyle: "bold" } },
  });

  // ===== Active Dreams =====
  doc.addPage();
  pageHeader(doc, "Active Dreams", generatedAt);
  autoTable(doc, {
    startY: 38,
    head: [["#", "Dream", "Category", "Target", "Saved", "Remaining", "Progress", "Years"]],
    body: activeDreams.map((d, i) => {
      const remain = Math.max((d.amount || 0) - (d.saved || 0), 0);
      const pct = d.amount > 0 ? ((d.saved || 0) / d.amount) * 100 : 0;
      return [
        String(i + 1),
        clean(d.name),
        clean(d.category),
        inrFull(d.amount),
        inrFull(d.saved),
        inrFull(remain),
        `${pct.toFixed(0)}%`,
        d.deadline_years != null ? String(Number(d.deadline_years).toFixed(1)) : "-",
      ];
    }),
    theme: "striped",
    headStyles: { fillColor: GOLD, textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 9.5, cellPadding: 2.8, font: "helvetica", overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 9 },
      1: { cellWidth: 38, fontStyle: "bold" },
      2: { cellWidth: 18 },
      3: { cellWidth: 32 },
      4: { cellWidth: 28 },
      5: { cellWidth: 32 },
      6: { cellWidth: 16, halign: "center" },
      7: { cellWidth: 13, halign: "center" },
    },
  });

  // ===== Achieved Dreams =====
  if (achievedDreams.length) {
    doc.addPage();
    pageHeader(doc, "Achieved Dreams", generatedAt);
    autoTable(doc, {
      startY: 38,
      head: [["#", "Dream", "Amount", "Started", "Achieved", "Days Taken"]],
      body: achievedDreams.map((d, i) => {
        const start = d.created_at ? new Date(d.created_at) : null;
        const endDate = (d.achieved_at ?? d.updated_at) ? new Date((d.achieved_at ?? d.updated_at)!) : null;
        const days = start && endDate ? Math.max(1, Math.round((+endDate - +start) / 86400000)) : null;
        return [
          String(i + 1),
          clean(d.name),
          inrFull(d.amount),
          start?.toLocaleDateString("en-IN") ?? "-",
          endDate?.toLocaleDateString("en-IN") ?? "-",
          days != null ? `${days} days` : "-",
        ];
      }),
      theme: "striped",
      headStyles: { fillColor: GOLD, textColor: 20, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3, font: "helvetica" },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50, fontStyle: "bold" }, 2: { cellWidth: 50 } },
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 6,
      body: [["Total Achieved Value", inrFull(achievedDreams.reduce((a, b) => a + (b.amount || 0), 0))]],
      theme: "grid",
      styles: { fontSize: 12, fontStyle: "bold", font: "helvetica" },
      columnStyles: { 0: { cellWidth: 90 } },
    });
  }

  // ===== Debts =====
  doc.addPage();
  pageHeader(doc, "Debts", generatedAt);
  if (debts.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text("No debts recorded — keep it that way.", 14, 50);
  } else {
    autoTable(doc, {
      startY: 38,
      head: [["#", "Name", "Type", "Amount", "EMI", "Interest %", "Stress"]],
      body: debts.map((d, i) => [
        String(i + 1),
        clean(d.name),
        clean(d.type),
        inrFull(d.amount),
        inrFull(d.emi),
        `${d.interest}%`,
        `${d.stress}/5`,
      ]),
      theme: "striped",
      headStyles: { fillColor: GOLD, textColor: 20, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3, font: "helvetica" },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 40, fontStyle: "bold" }, 3: { cellWidth: 40 }, 4: { cellWidth: 35 } },
    });
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 6,
      body: [
        ["Total Debt", inrFull(debtTotal)],
        ["Monthly EMI", inrFull(emiTotal)],
      ],
      theme: "grid",
      styles: { fontSize: 12, fontStyle: "bold", font: "helvetica" },
      columnStyles: { 0: { cellWidth: 90 } },
    });
  }

  // ===== Other Goals =====
  if (goals.length) {
    doc.addPage();
    pageHeader(doc, "Other Goals", generatedAt);
    autoTable(doc, {
      startY: 38,
      head: [["#", "Title", "Category", "Amount", "Priority"]],
      body: goals.map((g, i) => [
        String(i + 1),
        clean(g.title),
        clean(g.category),
        inrFull(g.amount),
        String(g.priority),
      ]),
      theme: "striped",
      headStyles: { fillColor: GOLD, textColor: 20, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3, font: "helvetica" },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 60, fontStyle: "bold" }, 3: { cellWidth: 50 } },
    });
  }

  decoratePages(doc, generatedAt);
  doc.save(`NSI-Report-${now.toISOString().slice(0, 10)}.pdf`);
}
