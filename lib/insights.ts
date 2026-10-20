/**
 * Mesin insight · korelasi otomatis + sleep debt kumulatif.
 * Data berupa log harian terurut tanggal (YYYY-MM-DD).
 */

export type LogLite = {
  date: string;
  steps: number | null;
  sleepHours: number | null;
  waterMl: number;
  mood: number | null;
  energy: number | null;
};

export type Insight = {
  key: string;
  icon: "tidur" | "mood" | "langkah" | "air" | "info";
  tone: "positif" | "negatif" | "netral";
  title: string;
  message: string;
};

/** Korelasi Pearson sederhana antara dua deret (null diabaikan). */
export function pearson(xs: (number | null)[], ys: (number | null)[]): number | null {
  const pairs: [number, number][] = [];
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];
    if (x != null && y != null) pairs.push([x, y]);
  }
  const n = pairs.length;
  if (n < 4) return null; // terlalu sedikit untuk simpulan berarti

  const mx = pairs.reduce((a, p) => a + p[0], 0) / n;
  const my = pairs.reduce((a, p) => a + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my);
    dx += (x - mx) ** 2;
    dy += (y - my) ** 2;
  }
  const denom = Math.sqrt(dx * dy);
  if (denom === 0) return null;
  return num / denom;
}

/** Utang tidur 7 hari terakhir (dibanding target 7,5 jam/malam). */
export function sleepDebt(logs: LogLite[], targetH = 7.5): number {
  const recent = logs.slice(-7);
  const deficit = recent.reduce((a, l) => {
    if (l.sleepHours == null) return a;
    return a + Math.max(0, targetH - l.sleepHours);
  }, 0);
  return Math.round(deficit * 10) / 10;
}

function fmtPct(r: number): string {
  return `${Math.round(Math.abs(r) * 100)}%`;
}

function strength(r: number): string {
  const a = Math.abs(r);
  if (a >= 0.7) return "sangat";
  if (a>= 0.5) return "cukup";
  return "sedikit";
}

export function generateInsights(logs: LogLite[], sleepGoalH = 7.5): Insight[] {
  const out: Insight[] = [];

  // 1. Korelasi tidur ↔ mood
  const rMood = pearson(
    logs.map((l) => l.sleepHours),
    logs.map((l) => l.mood),
  );
  if (rMood != null) {
    if (rMood >= 0.3) {
      out.push({
        key: "tidur-mood",
        icon: "tidur",
        tone: "positif",
        title: "Tidur & mood-mu terhubung",
        message: `Kamu tampaknya ${strength(rMood)} lebih bahagia setelah tidur cukup (korelasi ${fmtPct(rMood)}). Pertahankan jadwal tidurmu!`,
      });
    } else if (rMood <= -0.3) {
      out.push({
        key: "tidur-mood-neg",
        icon: "tidur",
        tone: "negatif",
        title: "Polamu tidurmu berlawanan dengan mood",
        message: `Malam yang lebih panjang justru diiringi mood lebih rendah minggu ini. Coba evaluasi kualitas tidurmu.`,
      });
    }
  }

  // 2. Korelasi langkah ↔ energi
  const rEnergi = pearson(
    logs.map((l) => l.steps),
    logs.map((l) => l.energy),
  );
  if (rEnergi != null && rEnergi >= 0.3) {
    out.push({
      key: "langkah-energi",
      icon: "langkah",
      tone: "positif",
      title: "Gerak bikin bertenaga",
      message: `Hari-hari dengan langkah lebih banyak diiringi energi lebih tinggi (korelasi ${fmtPct(rEnergi)}).`,
    });
  }

  // 3. Air ↔ energi/mood ringan
  const rAir = pearson(
    logs.map((l) => l.waterMl),
    logs.map((l) => l.mood),
  );
  if (rAir != null && rAir >= 0.3) {
    out.push({
      key: "air-mood",
      icon: "air",
      tone: "positif",
      title: "Hidrasi mengangkat harimu",
      message: `Minum lebih banyak air berhubungan dengan mood yang lebih baik (korelasi ${fmtPct(rAir)}).`,
    });
  }

  // 4. Sleep debt
  const debt = sleepDebt(logs, sleepGoalH);
  if (debt > 0) {
    out.push({
      key: "sleep-debt",
      icon: "tidur",
      tone: debt >= 5 ? "negatif" : "netral",
      title: `Utang tidurmu ${debt} jam`,
      message:
        debt >= 5
          ? `Dalam 7 hari terakhir kamu kekurangan total ${debt} jam tidur dari target. Badai kelelahan bisa datang kapan saja. Tidur lebih awal malam ini!`
          : `Utang tidur masih ringan (${debt} jam). Tidur sedikit lebih awal untuk melunasinya.`,
    });
  }

  // 5. Konsistensi langkah 7 hari terakhir
  const last7 = logs.slice(-7).filter((l) => l.steps != null);
  if (last7.length >= 4) {
    const capaiTarget = last7.filter((l) => (l.steps ?? 0) >= 8000).length;
    if (capaiTarget >= Math.ceil(last7.length * 0.7)) {
      out.push({
        key: "langkah-konsisten",
        icon: "langkah",
        tone: "positif",
        title: "Langkahmu konsisten!",
        message: `${capaiTarget} dari ${last7.length} hari terakhir kamu bergerak aktif. Kebiasaan yang bagus.`,
      });
    }
  }

  if (out.length === 0) {
    out.push({
      key: "mulai",
      icon: "info",
      tone: "netral",
      title: "Belum cukup data untuk insight",
      message: "Isi catatan harianmu selama beberapa hari, dan aplikasi akan mulai menemukan pola unik tubuhmu.",
    });
  }

  return out;
}
