/**
 * Mesin "Cuaca Tubuh" · mengubah metrik harian menjadi skor 0-100,
 * kondisi cuaca, dan ramalan berbahasa Indonesia.
 */

export type WeatherCondition = "cerah" | "cerah-berawan" | "berawan" | "hujan" | "badai";

export type TwinState = "glowing" | "segar" | "lemas" | "mata-panda" | "badai";

export type MetricInput = {
  steps: number | null;
  stepGoal: number;
  sleepHours: number | null;
  sleepQuality: number | null;
  sleepGoalH: number;
  waterMl: number | null;
  waterGoalMl: number;
  heartRate: number | null;
  systolic: number | null;
  diastolic: number | null;
  mood: number | null;
};

export type ComponentScore = {
  key: string;
  label: string;
  /** 0-100, atau null bila belum ada data */
  score: number | null;
  weight: number;
  detail: string;
};

export type WeatherReport = {
  score: number;
  condition: WeatherCondition;
  conditionLabel: string;
  forecast: string;
  twinState: TwinState;
  components: ComponentScore[];
};

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

function scoreLangkah(steps: number | null, goal: number): number | null {
  if (steps == null || goal <= 0) return null;
  return clamp((steps / goal) * 100);
}

function scoreTidur(jam: number | null, kualitas: number | null, goal: number): number | null {
  if (jam == null && kualitas == null) return null;
  const rasioJam = jam != null ? clamp((jam / goal) * 100) : null;
  const skorKualitas = kualitas != null ? (kualitas / 5) * 100 : null;
  if (rasioJam != null && skorKualitas != null) return rasioJam * 0.7 + skorKualitas * 0.3;
  return rasioJam ?? skorKualitas;
}

function scoreAir(ml: number | null, goal: number): number | null {
  if (ml == null || goal <= 0) return null;
  return clamp((ml / goal) * 100);
}

function scoreJantung(hr: number | null, sys: number | null, dia: number | null): number | null {
  const parts: number[] = [];
  if (hr != null) {
    if (hr >= 60 && hr <= 100) parts.push(100);
    else if (hr >= 50 && hr < 60) parts.push(80);
    else if (hr > 100 && hr <= 120) parts.push(70);
    else parts.push(40);
  }
  if (sys != null && dia != null) {
    if (sys >= 90 && sys <= 129 && dia >= 60 && dia <= 84) parts.push(100);
    else if (sys <= 139 && dia <= 89) parts.push(75);
    else parts.push(35);
  }
  if (parts.length === 0) return null;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

function scoreMood(mood: number | null): number | null {
  if (mood == null) return null;
  return clamp((mood / 5) * 100);
}

export function conditionFromScore(score: number): WeatherCondition {
  if (score >= 80) return "cerah";
  if (score >= 65) return "cerah-berawan";
  if (score >= 50) return "berawan";
  if (score >= 35) return "hujan";
  return "badai";
}

const CONDITION_LABEL: Record<WeatherCondition, string> = {
  cerah: "Cerah",
  "cerah-berawan": "Cerah Berawan",
  berawan: "Berawan",
  hujan: "Hujan",
  badai: "Badai",
};

const CONDITION_FORECAST: Record<WeatherCondition, string> = {
  cerah: "Langit tubuhmu cerah sepanjang hari. Pertahankan kebiasaan baikmu!",
  "cerah-berawan": "Cerah berawan. Sedikit usaha lagi membuat langitmu bening total.",
  berawan: "Kabut tipis meliputi tubuhmu. Cukupi tidur, air, dan makan bergizi hari ini.",
  hujan: "Hujan kelelahan mulai turun. Perbanyak istirahat, jangan paksakan diri.",
  badai: "Badai kelelahan sedang berkecamuk. Tubuhmu butuh istirahat serius sekarang juga.",
};

function detailKomponen(c: ComponentScore, m: MetricInput): string | null {
  if (c.score == null) return null;
  switch (c.key) {
    case "langkah":
      if (c.score >= 95) return "Target langkah hampir/tuntas!";
      if (c.score < 40) return `Masih jauh dari target ${m.stepGoal.toLocaleString("id-ID")} langkah.`;
      return `${((m.steps ?? 0) / (m.stepGoal || 1) * 100).toFixed(0)}% dari target harianmu.`;
    case "tidur": {
      const jam = m.sleepHours;
      if (jam != null && jam < 6) return "Kurang tidur, mata panda mengintai!";
      if (c.score >= 90) return "Tidurmu berkualitas. Bangun dengan segar.";
      return "Tidurmu cukup, tapi bisa lebih baik lagi.";
    }
    case "air":
      if (c.score < 50) return "Dehidrasi mengintai. Minum yuk!";
      if (c.score >= 95) return "Hidrasi terpenuhi, kulitmu berterima kasih.";
      return `${m.waterMl ?? 0} ml dari target ${m.waterGoalMl} ml.`;
    case "jantung": {
      if (c.score < 60) return "Detak jantung/tekanan darah di luar zona normal. Perhatikan.";
      return "Kardiovaskularmu tampak normal.";
    }
    case "mood":
      if (c.score < 50) return "Mood-mu rendah hari ini. Pelan-pelan saja, kamu hebat.";
      if (c.score >= 90) return "Suasana hatimu cerah hari ini!";
      return null;
    default:
      return null;
  }
}

export function twinStateFrom(score: number, sleepHours: number | null): TwinState {
  if (score < 35) return "badai";
  if (sleepHours != null && sleepHours < 6) return "mata-panda";
  if (score >= 85) return "glowing";
  if (score >= 65) return "segar";
  return "lemas";
}

export function computeWeather(m: MetricInput): WeatherReport {
  const components: ComponentScore[] = [
    {
      key: "tidur",
      label: "Tidur",
      score: scoreTidur(m.sleepHours, m.sleepQuality, m.sleepGoalH),
      weight: 0.25,
      detail: "",
    },
    {
      key: "langkah",
      label: "Langkah",
      score: scoreLangkah(m.steps, m.stepGoal),
      weight: 0.25,
      detail: "",
    },
    {
      key: "jantung",
      label: "Jantung & Darah",
      score: scoreJantung(m.heartRate, m.systolic, m.diastolic),
      weight: 0.2,
      detail: "",
    },
    { key: "air", label: "Air Minum", score: scoreAir(m.waterMl, m.waterGoalMl), weight: 0.15, detail: "" },
    { key: "mood", label: "Mood", score: scoreMood(m.mood), weight: 0.15, detail: "" },
  ].map((c) => ({ ...c, detail: detailKomponen(c, m) ?? "" }));

  const tersedia = components.filter((c): c is ComponentScore & { score: number } => c.score != null);
  let score: number;
  if (tersedia.length === 0) {
    score = 0;
  } else {
    const totalBobot = tersedia.reduce((a, c) => a + c.weight, 0);
    score = Math.round(tersedia.reduce((a, c) => a + c.score * c.weight, 0) / totalBobot);
  }
  score = clamp(score);

  const condition = conditionFromScore(score);
  const buruk = tersedia.filter((c) => c.score < 60).sort((a, b) => a.score - b.score)[0];

  let forecast = CONDITION_FORECAST[condition];
  if (tersedia.length === 0) {
    forecast = "Belum ada data hari ini. Isi catatan kesehatanmu untuk melihat ramalan cuaca tubuhmu!";
  } else if (buruk && buruk.detail && condition !== "cerah") {
    forecast = `${forecast} ${buruk.detail}`;
  }

  return {
    score,
    condition,
    conditionLabel: CONDITION_LABEL[condition],
    forecast,
    twinState: twinStateFrom(score, m.sleepHours),
    components,
  };
}
