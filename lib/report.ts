import { fromDateStr, toDateStr, formatRentangTanggal } from "@/lib/dates";

/** Laporan pekanan (Senin–Minggu) vs pekan sebelumnya, dari log terurut. */

export type LogInput = {
  date: string;
  steps: number | null;
  sleepHours: number | null;
  waterMl: number;
  mood: number | null;
  energy: number | null;
};

export type MetricSummary = {
  key: string;
  label: string;
  unit: string;
  /** Rata-rata per hari tercatat, pekan ini */
  thisAvg: number | null;
  prevAvg: number | null;
  /** thisAvg − prevAvg (dibulatkan 1 desimal) */
  delta: number | null;
  /** Naik = baik atau turun = baik untuk metrik ini */
  goodDirection: "up" | "down";
  /** null bila tidak bisa dinilai (data kurang / netral) */
  isGood: boolean | null;
  daysThis: number;
};

export type HitRate = {
  label: string;
  achieved: number;
  total: number;
};

export type WeeklyReport = {
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  prevLabel: string;
  summary: MetricSummary[];
  hitRate: HitRate[];
  temuan: string;
  daysLoggedThis: number;
};

type Goals = { stepGoal: number; sleepGoalH: number; waterGoalMl: number };

function avg(xs: (number | null)[]): number | null {
  const vals = xs.filter((x): x is number => x != null);
  if (vals.length === 0) return null;
  const m = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(m * 10) / 10;
}

function inRange(logs: LogInput[], start: Date, end: Date): LogInput[] {
  const s = toDateStr(start);
  const e = toDateStr(end);
  return logs.filter((l) => l.date >= s && l.date <= e);
}

/** Senin pekan ini (jam lokal 00:00). */
export function startOfWeek(d: Date = new Date()): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = out.getDay(); // 0 = Minggu
  out.setDate(out.getDate() - (day === 0 ? 6 : day - 1));
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

const METRICS: {
  key: keyof Pick<LogInput, "steps" | "sleepHours" | "waterMl" | "mood" | "energy">;
  label: string;
  unit: string;
  goodDirection: "up" | "down";
  neutral?: boolean;
}[] = [
  { key: "steps", label: "Langkah", unit: "langkah", goodDirection: "up" },
  { key: "sleepHours", label: "Tidur", unit: "jam", goodDirection: "up" },
  { key: "waterMl", label: "Air minum", unit: "ml", goodDirection: "up" },
  { key: "mood", label: "Mood", unit: "skala 1-5", goodDirection: "up" },
  { key: "energy", label: "Energi", unit: "skala 1-5", goodDirection: "up", neutral: true },
];

export function weeklyReport(logs: LogInput[], goals: Goals, today = new Date()): WeeklyReport {
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const prevStart = addDays(weekStart, -7);
  const prevEnd = addDays(weekStart, -1);

  const thisWeek = inRange(logs, weekStart, weekEnd);
  const prevWeek = inRange(logs, prevStart, prevEnd);

  const summary: MetricSummary[] = METRICS.map((m) => {
    const thisAvg = avg(thisWeek.map((l) => l[m.key]));
    const prevAvg = avg(prevWeek.map((l) => l[m.key]));
    const delta = thisAvg != null && prevAvg != null ? Math.round((thisAvg - prevAvg) * 10) / 10 : null;
    const isGood = delta == null || delta === 0 || m.neutral ? null : m.goodDirection === "up" ? delta > 0 : delta < 0;
    return {
      key: m.key,
      label: m.label,
      unit: m.unit,
      thisAvg,
      prevAvg,
      delta,
      goodDirection: m.goodDirection,
      isGood,
      daysThis: thisWeek.filter((l) => l[m.key] != null && l[m.key] !== 0).length,
    };
  });

  const hitRate: HitRate[] = [
    {
      label: "Target langkah",
      achieved: thisWeek.filter((l) => (l.steps ?? 0) >= goals.stepGoal).length,
      total: thisWeek.filter((l) => l.steps != null).length,
    },
    {
      label: "Target tidur",
      achieved: thisWeek.filter((l) => (l.sleepHours ?? 0) >= goals.sleepGoalH).length,
      total: thisWeek.filter((l) => l.sleepHours != null).length,
    },
    {
      label: "Target air",
      achieved: thisWeek.filter((l) => l.waterMl >= goals.waterGoalMl && l.waterMl > 0).length,
      total: thisWeek.filter((l) => l.waterMl > 0).length,
    },
    {
      label: "Mood baik (≥4)",
      achieved: thisWeek.filter((l) => (l.mood ?? 0) >= 4).length,
      total: thisWeek.filter((l) => l.mood != null).length,
    },
  ];

  return {
    periodStart: toDateStr(weekStart),
    periodEnd: toDateStr(weekEnd),
    periodLabel: formatRentangTanggal(weekStart, weekEnd),
    prevLabel: formatRentangTanggal(prevStart, prevEnd),
    summary,
    hitRate,
    temuan: temuanUtama(summary, thisWeek.length),
    daysLoggedThis: thisWeek.length,
  };
}

/** Satu temuan utama pekan ini: sinyal terkuat yang layak disebut. */
function temuanUtama(summary: MetricSummary[], daysLogged: number): string {
  if (daysLogged === 0) {
    return "Belum ada catatan pekan ini. Isi catatan harian agar laporan pekananmu terbentuk.";
  }

  // Utang tidur pekan ini (defisit terhadap 7,5 jam per hari tercatat)
  const tidur = summary.find((s) => s.key === "sleepHours");
  if (tidur?.thisAvg != null && tidur.thisAvg < 6.5) {
    return `Rata-rata tidurmu pekan ini ${fmtNum(tidur.thisAvg)} jam, di bawah 6,5 jam. Prioritaskan tidur lebih awal sebelum langit berubah mendung.`;
  }

  // Lonjakan/penurunan relatif terbesar
  const kandidat = summary
    .filter((s) => s.delta != null && s.prevAvg != null && s.prevAvg > 0 && s.daysThis >= 3)
    .sort((a, b) => Math.abs((b.delta ?? 0) / (b.prevAvg || 1)) - Math.abs((a.delta ?? 0) / (a.prevAvg || 1)))[0];

  if (kandidat && kandidat.delta != null && kandidat.prevAvg != null) {
    const pct = Math.round(Math.abs(kandidat.delta / kandidat.prevAvg) * 100);
    if (pct >= 5) {
      const arah = kandidat.delta > 0 ? "naik" : "turun";
      const nada = kandidat.isGood === true ? "kabar baik" : kandidat.isGood === false ? "perlu perhatian" : "perubahan yang perlu kamu tahu";
      return `${kandidat.label}mu ${arah} ${pct}% dibanding pekan lalu, ${nada}.`;
    }
  }

  return "Pekan ini cenderung stabil. Pertahankan ritme langkah, tidur, dan hidrasi agar langit tubuhmu tetap cerah.";
}

function fmtNum(n: number): string {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 1 });
}
