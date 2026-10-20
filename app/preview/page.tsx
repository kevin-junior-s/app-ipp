import { Suspense } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WeatherPanel } from "@/components/WeatherHero";
import { TwinAvatar } from "@/components/TwinAvatar";
import { QuickWater } from "@/components/QuickWater";
import { StepSensor } from "@/components/StepSensor";
import { WaterReminder } from "@/components/WaterReminder";
import { InsightCards } from "@/components/InsightCards";
import { DailyLogForm, type LogInitial } from "@/components/DailyLogForm";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ProfileForm, type ImtInfo } from "@/components/ProfileForm";
import { TrendBarChart, TrendLineChart, type ChartPoint } from "@/components/Charts";
import { computeWeather, type MetricInput } from "@/lib/weather";
import { generateInsights, type LogLite } from "@/lib/insights";
import { weeklyReport } from "@/lib/report";
import { logStreak, last7Flags } from "@/lib/streak";
import { hitungImt, imtCategory, rentangIdeal } from "@/lib/imt";
import { greeting, toDateStr, formatTanggalPanjang, formatTanggalSingkat, formatBulanPanjang, fromDateStr } from "@/lib/dates";
import type { CurrentUser } from "@/lib/auth";

export const metadata = { title: "Pratinjau · LangitTubuh" };

/**
 * Pratinjau data contoh · untuk inspeksi desain (inspect.mjs) tanpa sesi.
 * Bukan bagian aplikasi: tidak membaca database maupun sesi.
 * Tanggal dibekukan agar prerender deterministik (Cache Components).
 */

const HARI_INI = "2026-10-20";

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

type MockLog = {
  date: string;
  steps: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  waterMl: number;
  weightKg: number | null;
  heartRate: number | null;
  systolic: number | null;
  diastolic: number | null;
  mood: number | null;
  energy: number | null;
  symptoms: string;
  note: string | null;
};

function buildLogs(hari = 45): MockLog[] {
  const rnd = lcg(101286);
  const out: MockLog[] = [];
  const akhir = fromDateStr(HARI_INI);
  for (let i = hari - 1; i >= 0; i--) {
    const d = new Date(akhir);
    d.setDate(d.getDate() - i);
    const date = toDateStr(d);
    // ~18% hari bolong, tapi 8 hari terakhir penuh (streak)
    const bolong = i > 7 && rnd() < 0.18;
    if (bolong) {
      out.push({
        date,
        steps: null,
        sleepHours: null,
        sleepQuality: null,
        waterMl: 0,
        weightKg: null,
        heartRate: null,
        systolic: null,
        diastolic: null,
        mood: null,
        energy: null,
        symptoms: "[]",
        note: null,
      });
      continue;
    }
    const berat = Math.round((68.4 - (hari - i) * 0.02 + (rnd() - 0.5) * 0.6) * 10) / 10;
    out.push({
      date,
      steps: 3200 + Math.round(rnd() * 8200),
      sleepHours: Math.round((5 + rnd() * 3.6) * 2) / 2,
      sleepQuality: 2 + Math.round(rnd() * 3),
      waterMl: 800 + Math.round(rnd() * 1500),
      weightKg: i % 4 === 0 ? berat : null,
      heartRate: 58 + Math.round(rnd() * 28),
      systolic: 105 + Math.round(rnd() * 24),
      diastolic: 64 + Math.round(rnd() * 22),
      mood: 2 + Math.round(rnd() * 3),
      energy: 2 + Math.round(rnd() * 3),
      symptoms: rnd() < 0.15 ? '["pusing"]' : "[]",
      note: rnd() < 0.25 ? "Hari produktif, tapi mata mulai lelah sore hari." : null,
    });
  }
  return out;
}

const FAKE_USER: CurrentUser = {
  id: "preview",
  name: "Andi Pratama",
  email: "andi@contoh.id",
  heightCm: 172,
  weightKg: 68,
  age: 29,
  gender: "pria",
  stepGoal: 8000,
  waterGoalMl: 2000,
  sleepGoalH: 8,
};

function FakeUserRow() {
  return (
    <div className="border-t border-separator p-3">
      <div className="flex items-center gap-2.5 px-2 py-2">
        <span
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-semibold"
          style={{ background: "rgba(0,122,255,0.14)", color: "var(--blue)" }}
          aria-hidden
        >
          A
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-medium leading-tight truncate">Andi Pratama</span>
          <span className="block text-[12px] text-tertiary leading-tight truncate">andi@contoh.id</span>
        </span>
      </div>
    </div>
  );
}

function BandTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 col-span-2 lg:col-span-12 mt-2 lg:mt-4 first:mt-0">
      <p className="text-[12px] text-tertiary uppercase tracking-wide">{children}</p>
      <span className="flex-1 h-px bg-separator" aria-hidden />
    </div>
  );
}

/**
 * Prerender + cache: beberapa lib (logStreak, last7Flags) membaca `new Date()`,
 * dan Cache Components melarang nilai itu saat prerender. Di-cache sekali, aman.
 */
async function PreviewBody() {
  "use cache";
  const logs = buildLogs();
  const today = logs[logs.length - 1];
  const lite: LogLite[] = logs.map((l) => ({
    date: l.date,
    steps: l.steps,
    sleepHours: l.sleepHours,
    waterMl: l.waterMl,
    mood: l.mood,
    energy: l.energy,
  }));

  const metricInput: MetricInput = {
    steps: today.steps,
    stepGoal: FAKE_USER.stepGoal,
    sleepHours: today.sleepHours,
    sleepQuality: today.sleepQuality,
    sleepGoalH: FAKE_USER.sleepGoalH,
    waterMl: today.waterMl,
    waterGoalMl: FAKE_USER.waterGoalMl,
    heartRate: today.heartRate,
    systolic: today.systolic,
    diastolic: today.diastolic,
    mood: today.mood,
  };
  const report = computeWeather(metricInput);
  const insights = generateInsights(lite.slice(-14), FAKE_USER.sleepGoalH);
  const tercatatDates = logs.filter((l) => l.steps != null || l.waterMl > 0 || l.mood != null).map((l) => l.date);
  const streak = logStreak(tercatatDates);
  const flags7 = last7Flags(tercatatDates);
  const wReport = weeklyReport(lite, {
    stepGoal: FAKE_USER.stepGoal,
    sleepGoalH: FAKE_USER.sleepGoalH,
    waterGoalMl: FAKE_USER.waterGoalMl,
  });

  const beratTerbaru = [...logs].reverse().find((l) => l.weightKg != null)?.weightKg ?? FAKE_USER.weightKg;
  const imt = beratTerbaru && FAKE_USER.heightCm ? hitungImt(beratTerbaru, FAKE_USER.heightCm) : null;
  const imtCat = imt ? imtCategory(imt) : null;
  const ideal = FAKE_USER.heightCm ? rentangIdeal(FAKE_USER.heightCm) : null;
  const imtInfo: ImtInfo = {
    imt,
    label: imtCat?.label ?? null,
    tone: imtCat?.tone ?? null,
    ideal,
  };

  const now = fromDateStr(HARI_INI);
  const tahun = now.getFullYear();
  const bulan = now.getMonth();
  const tercatat = new Set(tercatatDates.filter((d) => d.startsWith(`${tahun}-${String(bulan + 1).padStart(2, "0")}`)));

  const formInitial: LogInitial = {
    steps: today.steps,
    sleepHours: today.sleepHours,
    sleepQuality: today.sleepQuality,
    waterMl: today.waterMl,
    weightKg: today.weightKg,
    heartRate: today.heartRate,
    systolic: today.systolic,
    diastolic: today.diastolic,
    mood: today.mood,
    energy: today.energy,
    symptoms: ["pusing"],
    note: today.note,
  };

  const chart = (field: keyof MockLog): ChartPoint[] =>
    logs.map((l) => ({
      date: formatTanggalSingkat(l.date),
      value: (l[field] ?? null) as number | null,
    }));

  return (
    <AppShell userSlot={<FakeUserRow />}>
      <div className="mb-4 lg:mb-6">
        <div className="panel px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-[13px] text-secondary">
            Mode pratinjau: data contoh untuk inspeksi desain.
          </p>
          <span className="text-[12px] text-tertiary hidden sm:block">seed 101286</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
        {/* ── Beranda ── */}
        <BandTitle>Beranda</BandTitle>

        <header className="col-span-2 lg:col-span-12 lg:pb-3">
          <h1 className="font-serif text-[26px] lg:text-[30px] leading-[1.15] tracking-tight">
            Selamat pagi, Andi.
          </h1>
          <p className="text-[14px] text-secondary mt-2">
            Skor tubuhmu {report.score}/100 hari ini, cuaca {report.conditionLabel.toLowerCase()}.
          </p>
        </header>

        {[
          { label: "Langkah", value: today.steps?.toLocaleString("id-ID") ?? "—", caption: "target 8.000", ratio: (today.steps ?? 0) / 8000, hue: "var(--color-ios-green)" },
          { label: "Air minum", value: today.waterMl.toLocaleString("id-ID"), caption: "ml · target 2.000", ratio: today.waterMl / 2000, hue: "var(--color-ios-teal)" },
          { label: "Tidur", value: today.sleepHours?.toLocaleString("id-ID") ?? "—", caption: "jam · target 8", ratio: (today.sleepHours ?? 0) / 8, hue: "var(--color-ios-indigo)" },
          { label: "Mood", value: today.mood != null ? `${today.mood}/5` : "—", caption: "Baik", ratio: (today.mood ?? 0) / 5, hue: "var(--color-ios-orange)" },
        ].map((t) => (
          <div key={t.label} className="panel lg:col-span-3 p-4 flex flex-col justify-between h-32">
            <p className="text-[12px] text-secondary">{t.label}</p>
            <div>
              <p className="text-[32px] leading-none num" style={{ fontWeight: 400 }}>{t.value}</p>
              <p className="text-[12px] text-tertiary mt-1.5 leading-tight">{t.caption}</p>
              <div className="mt-2 h-1 rounded-full bg-fill overflow-hidden" aria-hidden>
                <div className="h-full rounded-full" style={{ width: `${Math.min(1, t.ratio) * 100}%`, background: t.hue }} />
              </div>
            </div>
          </div>
        ))}

        <div className="col-span-2 lg:col-span-9">
          <WeatherPanel report={report} />
        </div>
        <section className="panel lg:col-span-3 p-5 flex flex-col items-center justify-between gap-3 h-full">
          <TwinAvatar state={report.twinState} size={92} />
          <div className="w-full border-t border-rule pt-3 text-center mt-auto">
            <p className="text-[32px] leading-none num" style={{ fontWeight: 400 }}>{streak}</p>
            <p className="text-[12px] text-secondary mt-1">hari beruntun mencatat</p>
            <div className="flex justify-center gap-1.5 mt-2.5" aria-hidden>
              {flags7.map((f, i) => (
                <span key={i} className="w-2 h-2 rounded-full" style={{ background: f ? "var(--blue)" : "var(--fill)" }} />
              ))}
            </div>
          </div>
        </section>

        <section className="panel lg:col-span-6 p-5">
          <h2 className="text-[14px] font-semibold mb-4">Air cepat</h2>
          <QuickWater currentMl={today.waterMl} goalMl={FAKE_USER.waterGoalMl} />
        </section>
        <section className="panel lg:col-span-6 p-5 divide-y divide-rule">
          <div className="pb-5">
            <WaterReminder />
          </div>
          <div className="pt-5">
            <StepSensor />
          </div>
        </section>

        <section className="panel col-span-2 lg:col-span-12 p-5 lg:px-6">
          <h2 className="text-[14px] font-semibold mb-1">Wawasan 7 hari terakhir</h2>
          <InsightCards insights={insights} />
        </section>

        {/* ── Riwayat ── */}
        <BandTitle>Riwayat</BandTitle>

        <div className="col-span-2 lg:col-span-12 flex flex-wrap items-center gap-2">
          {["7 hari", "14 hari", "30 hari"].map((r, i) => (
            <span
              key={r}
              className={`h-8 px-3.5 rounded-full text-[13px] flex items-center ${
                i === 2 ? "bg-surface border border-separator text-label font-medium" : "text-secondary"
              }`}
            >
              {r}
            </span>
          ))}
          <span className="w-px h-5 bg-separator mx-1" aria-hidden />
          {[
            { label: "Semua", hue: null },
            { label: "Langkah", hue: "var(--color-ios-green)" },
            { label: "Tidur", hue: "var(--color-ios-indigo)" },
            { label: "Air", hue: "var(--color-ios-teal)" },
            { label: "Mood", hue: "var(--color-ios-orange)" },
            { label: "Berat", hue: "var(--color-ios-pink)" },
          ].map((m, i) => (
            <span
              key={m.label}
              className={`h-8 px-3.5 rounded-full text-[13px] flex items-center gap-1.5 ${
                i === 0 ? "bg-surface border border-separator text-label font-medium" : "text-secondary"
              }`}
            >
              {m.hue ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.hue }} aria-hidden /> : null}
              {m.label}
            </span>
          ))}
          <form className="flex items-center gap-2 ml-auto">
            <input type="search" placeholder="Cari catatan & gejala…" className="input-ios h-8 min-h-0 w-44 sm:w-52 text-[13px] py-1" aria-label="Cari catatan" />
            <button type="button" className="btn-secondary h-8 min-h-0 px-4 text-[13px]">Cari</button>
          </form>
        </div>

        <div className="col-span-2 lg:col-span-12 grid lg:grid-cols-2 gap-3 lg:gap-4">
          <section className="panel p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[14px] font-semibold">Langkah</h2>
              <span className="text-[12px] text-tertiary">target 8.000</span>
            </div>
            <TrendBarChart data={chart("steps")} color="var(--color-ios-green)" unit="langkah" reference={8000} />
          </section>
          <section className="panel p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-[14px] font-semibold">Tidur</h2>
              <span className="text-[12px] text-tertiary">target 8 jam</span>
            </div>
            <TrendLineChart data={chart("sleepHours")} color="var(--color-ios-indigo)" unit="jam" reference={8} />
          </section>
        </div>

        <div className="panel col-span-2 lg:col-span-12 divide-y divide-rule px-5">
          {logs
            .slice(-4)
            .reverse()
            .map((l) => (
              <div key={l.date} className="py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[14px] font-medium leading-tight">{formatTanggalPanjang(fromDateStr(l.date))}</p>
                  {l.weightKg != null ? (
                    <span className="text-[13px] text-secondary num shrink-0">{l.weightKg.toLocaleString("id-ID")} kg</span>
                  ) : null}
                </div>
                <p className="text-[12px] text-secondary mt-1 num leading-snug">
                  {l.steps?.toLocaleString("id-ID")} langkah · {l.sleepHours} jam tidur · {l.waterMl.toLocaleString("id-ID")} ml air · mood {l.mood}/5
                </p>
              </div>
            ))}
        </div>

        {/* ── Catatan ── */}
        <BandTitle>Catatan</BandTitle>

        <section className="panel col-span-2 lg:col-span-4 p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="btn-secondary px-3 w-auto min-w-9 shrink-0 text-center" aria-hidden>←</span>
            <p className="text-[14px] font-semibold">{formatBulanPanjang(tahun, bulan)}</p>
            <span className="btn-secondary px-3 w-auto min-w-9 shrink-0 text-center opacity-30" aria-hidden>→</span>
          </div>
          <MonthCalendar tahun={tahun} bulan={bulan} tercatat={tercatat} dipilih={HARI_INI} hariIni={HARI_INI} />
          <p className="flex items-center gap-2 text-[12px] text-tertiary mt-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-ios-blue" aria-hidden />
            hari yang sudah tercatat
          </p>
        </section>

        <section className="panel col-span-2 lg:col-span-8 p-5">
          <div className="flex items-center justify-between gap-2 mb-5">
            <span className="btn-secondary shrink-0 w-auto" aria-hidden>← Sebelumnya</span>
            <p className="text-[14px] font-semibold text-center leading-tight">{formatTanggalPanjang(fromDateStr(HARI_INI))}</p>
            <span className="btn-secondary shrink-0 w-auto opacity-30 select-none" aria-hidden>Besok →</span>
          </div>
          <DailyLogForm date={HARI_INI} initial={formInitial} />
        </section>

        {/* ── Wawasan ── */}
        <BandTitle>Wawasan</BandTitle>

        <section className="panel col-span-2 lg:col-span-12 p-5 lg:p-6">
          <p className="text-[12px] text-tertiary mb-2">Temuan pekan ini</p>
          <p className="text-[18px] lg:text-[20px] leading-snug font-medium max-w-[52ch]">{wReport.temuan}</p>
          <p className="text-[12px] text-tertiary mt-3 num">
            Dihitung dari {wReport.daysLoggedThis} hari tercatat · pembanding {wReport.prevLabel}
          </p>
        </section>

        <section className="panel col-span-2 lg:col-span-12 p-5 lg:px-6">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 lg:gap-10">
            <div>
              <h2 className="text-[14px] font-semibold mb-1">Rata-rata vs pekan lalu</h2>
              <div className="divide-y divide-rule">
                {wReport.summary.map((s) => (
                  <div key={s.key} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium leading-tight">{s.label}</p>
                      <p className="text-[12px] text-tertiary mt-0.5 num">
                        pekan lalu {s.prevAvg ?? "—"} · {s.daysThis} hari data
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[22px] leading-none num" style={{ fontWeight: 400 }}>
                        {s.thisAvg ?? "—"}
                      </p>
                      <div className="mt-1 text-[12px] text-secondary num">
                        {s.delta == null
                          ? "belum ada pembanding"
                          : s.delta === 0
                            ? "tetap"
                            : `${s.delta > 0 ? "naik" : "turun"} ${Math.abs(s.delta)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[14px] font-semibold mb-3">Hit rate target pekan ini</h2>
              <div className="space-y-3">
                {wReport.hitRate.map((h) => {
                  const ratio = h.total > 0 ? h.achieved / h.total : 0;
                  return (
                    <div key={h.label}>
                      <div className="flex items-baseline justify-between text-[13px]">
                        <span>{h.label}</span>
                        <span className="text-secondary num">
                          {h.achieved}/{h.total} ({Math.round(ratio * 100)}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-fill overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: "var(--blue)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="panel col-span-2 lg:col-span-12 p-5 lg:px-6 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-8">
          <h2 className="text-[14px] font-semibold lg:w-56 shrink-0">Indeks massa tubuh</h2>
          {imt != null ? (
            <>
              <p className="text-[24px] leading-none num" style={{ fontWeight: 400 }}>
                {imt.toLocaleString("id-ID", { minimumFractionDigits: 1 })}
                <span className="text-[13px] font-medium ml-2">{imtCat?.label}</span>
              </p>
              <p className="text-[12px] text-secondary num">
                Dari berat terakhir {beratTerbaru?.toLocaleString("id-ID")} kg · tinggi 172 cm
              </p>
            </>
          ) : (
            <p className="text-[13px] text-secondary">Lengkapi tinggi & berat badan untuk melihat IMT.</p>
          )}
          <div className="lg:ml-auto flex items-center gap-4">
            {ideal ? (
              <p className="text-[12px] text-tertiary num">
                Rentang ideal: {ideal[0]}-{ideal[1]} kg
              </p>
            ) : null}
            <div>
              <p className="text-[22px] leading-none num" style={{ fontWeight: 400 }}>
                {streak} <span className="text-[13px] text-secondary">hari beruntun</span>
              </p>
              <div className="flex gap-1.5 mt-2" aria-hidden>
                {flags7.map((f, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: f ? "var(--blue)" : "var(--fill)" }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Profil ── */}
        <BandTitle>Profil</BandTitle>

        <div className="col-span-2 lg:col-span-12">
          <ProfileForm user={FAKE_USER} imt={imtInfo} />
        </div>

        <section className="grid col-span-2 lg:col-span-12 lg:grid-cols-[minmax(0,450px)_minmax(0,700px)] gap-3 lg:gap-6 items-start">
          <div className="lg:pt-3">
            <h2 className="text-[16px] font-medium leading-tight">Tampilan</h2>
            <p className="text-[14px] text-secondary mt-1 leading-snug">Tema tersimpan di peramban ini.</p>
          </div>
          <div className="panel-tonal p-4 lg:p-5">
            <ThemeToggle />
          </div>
        </section>
      </div>

      <p className="text-[12px] text-tertiary mt-8">
        <Link href="/" className="underline">LangitTubuh</Link> · pratinjau data contoh, bukan data sungguhan.
      </p>
    </AppShell>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <div className="h-40 rounded-[20px] bg-fill" />
        </div>
      }
    >
      <PreviewBody />
    </Suspense>
  );
}
