import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecentLogs, type DailyLogRow } from "@/lib/data";
import { generateInsights, sleepDebt, type LogLite } from "@/lib/insights";
import { formatTanggalPanjang, formatTanggalSingkat, fromDateStr } from "@/lib/dates";
import { TrendBarChart, TrendLineChart, type ChartPoint } from "@/components/Charts";
import { InsightCards } from "@/components/InsightCards";

export const metadata = { title: "Riwayat · LangitTubuh" };

type Params = {
  range?: string | string[];
  metric?: string | string[];
  q?: string | string[];
};

const METRICS = [
  { id: "semua", label: "Semua", hue: null },
  { id: "langkah", label: "Langkah", hue: "var(--color-ios-green)" },
  { id: "tidur", label: "Tidur", hue: "var(--color-ios-indigo)" },
  { id: "air", label: "Air", hue: "var(--color-ios-teal)" },
  { id: "mood", label: "Mood", hue: "var(--color-ios-orange)" },
  { id: "jantung", label: "Jantung", hue: "var(--color-ios-red)" },
  { id: "berat", label: "Berat", hue: "var(--color-ios-pink)" },
] as const;

const RANGES = [
  { id: "7", label: "7 hari" },
  { id: "14", label: "14 hari" },
  { id: "30", label: "30 hari" },
] as const;

function str(v: string | string[] | undefined): string | null {
  return typeof v === "string" ? v : null;
}

export default function RiwayatPage(props: PageProps<"/riwayat">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 lg:space-y-4">
          <div className="h-9 w-40 rounded-xl bg-fill" />
          <div className="h-10 rounded-2xl bg-fill" />
          <div className="grid lg:grid-cols-2 gap-3 lg:gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-[20px] bg-fill" />
            ))}
          </div>
        </div>
      }
    >
      <RiwayatContent searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}

function toChartPoints(logs: { date: string; field: number | null }[]): ChartPoint[] {
  return logs.map((l) => ({ date: formatTanggalSingkat(l.date), value: l.field }));
}

/** Susun URL filter yang mempertahankan parameter lain. */
function filterHref(params: Params, patch: Record<string, string | null>): string {
  const next: Record<string, string | null> = {
    range: str(params.range) ?? "30",
    metric: str(params.metric) ?? "semua",
    q: str(params.q),
    ...patch,
  };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if (v && v !== "semua" && !(k === "q" && !v)) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `/riwayat?${s}` : "/riwayat";
}

async function RiwayatContent({ searchParamsPromise }: { searchParamsPromise: Promise<Params> }) {
  await connection();
  const searchParams = await searchParamsPromise;

  const rangeId = RANGES.some((r) => r.id === str(searchParams.range)) ? (str(searchParams.range) as string) : "30";
  const metricId = METRICS.some((m) => m.id === str(searchParams.metric))
    ? (str(searchParams.metric) as string)
    : "semua";
  const q = (str(searchParams.q) ?? "").trim();

  const user = await getCurrentUser();
  const logs = await getRecentLogs(Number(rangeId));

  const lite: LogLite[] = logs.map((l) => ({
    date: l.date,
    steps: l.steps,
    sleepHours: l.sleepHours,
    waterMl: l.waterMl,
    mood: l.mood,
    energy: l.energy,
  }));

  const insights = generateInsights(lite.slice(-14), user.sleepGoalH);
  const debt = sleepDebt(lite);

  const punyaData = logs.some(
    (l) => l.steps != null || l.sleepHours != null || l.waterMl > 0 || l.mood != null || l.heartRate != null,
  );

  const cards: {
    key: string;
    title: string;
    hint: string;
    kind: "bar" | "line";
    color: string;
    data: ChartPoint[];
    unit?: string;
    reference?: number | null;
  }[] = [
    {
      key: "langkah",
      title: "Langkah",
      hint: `target ${user.stepGoal.toLocaleString("id-ID")}`,
      kind: "bar" as const,
      color: "var(--color-ios-green)",
      data: toChartPoints(logs.map((l) => ({ date: l.date, field: l.steps }))),
      unit: "langkah",
      reference: user.stepGoal,
    },
    {
      key: "tidur",
      title: "Tidur",
      hint: `target ${user.sleepGoalH} jam`,
      kind: "line" as const,
      color: "var(--color-ios-indigo)",
      data: toChartPoints(logs.map((l) => ({ date: l.date, field: l.sleepHours }))),
      unit: "jam",
      reference: user.sleepGoalH,
    },
    {
      key: "air",
      title: "Air minum",
      hint: `target ${user.waterGoalMl.toLocaleString("id-ID")} ml`,
      kind: "line" as const,
      color: "var(--color-ios-teal)",
      data: toChartPoints(logs.map((l) => ({ date: l.date, field: l.waterMl }))),
      unit: "ml",
      reference: user.waterGoalMl,
    },
    {
      key: "mood",
      title: "Mood",
      hint: "skala 1-5",
      kind: "line" as const,
      color: "var(--color-ios-orange)",
      data: toChartPoints(logs.map((l) => ({ date: l.date, field: l.mood }))),
    },
    {
      key: "jantung",
      title: "Detak jantung",
      hint: "zona normal 60-100 bpm",
      kind: "line" as const,
      color: "var(--color-ios-red)",
      data: toChartPoints(logs.map((l) => ({ date: l.date, field: l.heartRate }))),
      unit: "bpm",
    },
    {
      key: "berat",
      title: "Berat badan",
      hint: "kg per hari tercatat",
      kind: "line" as const,
      color: "var(--color-ios-pink)",
      data: toChartPoints(logs.map((l) => ({ date: l.date, field: l.weightKg }))),
      unit: "kg",
    },
  ].filter((c) => metricId === "semua" || c.key === metricId);

  // Pencarian & filter baris riwayat
  const qc = q.toLowerCase();
  const rows = [...logs]
    .filter((l) => !qc || l.note?.toLowerCase().includes(qc) || l.symptoms.toLowerCase().includes(qc))
    .filter((l) => {
      switch (metricId) {
        case "langkah":
          return l.steps != null;
        case "tidur":
          return l.sleepHours != null;
        case "air":
          return l.waterMl > 0;
        case "mood":
          return l.mood != null;
        case "jantung":
          return l.heartRate != null;
        case "berat":
          return l.weightKg != null;
        default:
          return true;
      }
    })
    .reverse();

  return (
    <div className="space-y-3 lg:space-y-4">
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight">Riwayat</h1>
        <p className="text-[13px] text-secondary mt-1">
          {logs.length > 0 ? `${rows.length} catatan ditemukan dari ${logs.length} hari terakhir` : "Belum ada catatan"}
        </p>
      </div>

      {/* Baris filter: rentang, metrik, pencarian */}
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <Link
            key={r.id}
            href={filterHref(searchParams, { range: r.id })}
            className={`h-8 px-3.5 rounded-full text-[13px] flex items-center transition-colors ${
              rangeId === r.id
                ? "bg-surface border border-separator text-label font-medium"
                : "text-secondary hover:bg-fill"
            }`}
            aria-current={rangeId === r.id ? "true" : undefined}
          >
            {r.label}
          </Link>
        ))}
        <span className="w-px h-5 bg-separator mx-1" aria-hidden />
        {METRICS.map((m) => (
          <Link
            key={m.id}
            href={filterHref(searchParams, { metric: m.id })}
            className={`h-8 px-3.5 rounded-full text-[13px] flex items-center gap-1.5 transition-colors ${
              metricId === m.id
                ? "bg-surface border border-separator text-label font-medium"
                : "text-secondary hover:bg-fill"
            }`}
            aria-current={metricId === m.id ? "true" : undefined}
          >
            {m.hue ? (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.hue }} aria-hidden />
            ) : null}
            {m.label}
          </Link>
        ))}
        <form method="GET" className="flex items-center gap-2 ml-auto">
          <input type="hidden" name="range" value={rangeId} />
          <input type="hidden" name="metric" value={metricId} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari catatan & gejala…"
            className="input-ios h-8 min-h-0 w-44 sm:w-52 text-[13px] py-1"
            aria-label="Cari catatan"
          />
          <button type="submit" className="btn-secondary h-8 min-h-0 px-4 text-[13px]">
            Cari
          </button>
        </form>
      </div>

      {/* Grafik */}
      {punyaData ? (
        <div className="grid lg:grid-cols-2 gap-3 lg:gap-4">
          {cards.map((c) => (
            <section key={c.key} className="panel p-5">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[14px] font-semibold">{c.title}</h2>
                <span className="text-[12px] text-tertiary">{c.hint}</span>
              </div>
              {c.kind === "bar" ? (
                <TrendBarChart data={c.data} color={c.color} unit={c.unit} reference={c.reference ?? null} />
              ) : (
                <TrendLineChart data={c.data} color={c.color} unit={c.unit} reference={c.reference ?? null} />
              )}
            </section>
          ))}
          {/* Utang tidur · dihitung dari deret yang sama */}
          <section className="panel p-5">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-[14px] font-semibold">Utang tidur</h2>
              <span className="text-[12px] text-tertiary">vs 7,5 jam/malam</span>
            </div>
            <p
              className="text-[32px] leading-none num"
              style={{
                fontWeight: 400,
                color:
                  debt >= 5
                    ? "var(--negative)"
                    : debt > 0
                      ? "var(--color-ios-orange)"
                      : "var(--positive)",
              }}
            >
              {debt} jam
            </p>
            <p className="text-[13px] text-secondary mt-2 leading-snug">
              {debt === 0
                ? "Tidurmu lancar, tidak ada utang tidur dalam 7 hari terakhir."
                : "Selisih tidurmu dari target 7,5 jam/malam dalam 7 hari terakhir. Lunasi pelan-pelan."}
            </p>
          </section>
        </div>
      ) : (
        <div className="panel p-8 text-center">
          <p className="font-semibold">Belum ada data</p>
          <p className="text-[14px] text-secondary mt-1">
            Mulai catat kesehatanmu di halaman Catatan, grafikmu akan muncul di sini.
          </p>
          <Link href="/catatan" className="inline-block mt-4 text-[14px] text-accent font-medium">
            Buka Catatan →
          </Link>
        </div>
      )}

      {/* Daftar baris riwayat */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-[14px] font-semibold">Catatan harian</h2>
          {q ? (
            <Link href={filterHref(searchParams, { q: null })} className="text-[13px] text-accent">
              Hapus pencarian “{q}”
            </Link>
          ) : null}
        </div>
        <div className="panel divide-y divide-rule px-5">
          {rows.length > 0 ? (
            rows.map((l) => <LogRow key={l.date} log={l} />)
          ) : (
            <p className="py-6 text-center text-[14px] text-secondary">Tidak ada catatan yang cocok.</p>
          )}
        </div>
      </section>

      {/* Pola (korelasi) */}
      {insights.length > 0 ? (
        <section className="panel p-5">
          <h2 className="text-[14px] font-semibold mb-1">Pola 14 hari terakhir</h2>
          <InsightCards insights={insights} />
        </section>
      ) : null}
    </div>
  );
}

const MOOD_WORDS = ["Lelah", "Sedih", "Biasa", "Baik", "Hebat"];

function LogRow({ log }: { log: DailyLogRow }) {
  const d = fromDateStr(log.date);
  const metrics: string[] = [];
  if (log.steps != null) metrics.push(`${log.steps.toLocaleString("id-ID")} langkah`);
  if (log.sleepHours != null) metrics.push(`${log.sleepHours.toLocaleString("id-ID")} jam tidur`);
  if (log.waterMl > 0) metrics.push(`${log.waterMl.toLocaleString("id-ID")} ml air`);
  if (log.mood != null) metrics.push(`mood ${log.mood}/5 (${MOOD_WORDS[log.mood - 1]})`);
  if (log.energy != null) metrics.push(`energi ${log.energy}/5`);
  if (log.heartRate != null) metrics.push(`${log.heartRate} bpm`);
  if (log.systolic != null && log.diastolic != null)
    metrics.push(`${log.systolic}/${log.diastolic} mmHg`);

  const symptoms = parseSymptoms(log.symptoms);

  return (
    <div className="py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[14px] font-medium leading-tight">{formatTanggalPanjang(d)}</p>
        {log.weightKg != null ? (
          <span className="text-[13px] text-secondary num shrink-0">{log.weightKg.toLocaleString("id-ID")} kg</span>
        ) : null}
      </div>
      {metrics.length > 0 ? (
        <p className="text-[12px] text-secondary mt-1 num leading-snug">{metrics.join(" · ")}</p>
      ) : (
        <p className="text-[12px] text-tertiary mt-1">Belum ada metrik terisi</p>
      )}
      {symptoms.length > 0 || log.note ? (
        <p className="text-[12px] text-tertiary mt-1 truncate">
          {[symptoms.join(", "), log.note].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function parseSymptoms(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
