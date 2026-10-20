import { Suspense } from "react";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecentLogs } from "@/lib/data";
import { generateInsights, type LogLite } from "@/lib/insights";
import { weeklyReport } from "@/lib/report";
import { hitungImt, imtCategory, rentangIdeal } from "@/lib/imt";
import { logStreak, last7Flags } from "@/lib/streak";
import { toDateStr } from "@/lib/dates";
import { InsightCards } from "@/components/InsightCards";
import type { MetricSummary } from "@/lib/report";

export const metadata = { title: "Wawasan · LangitTubuh" };

export default function WawasanPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 lg:space-y-4">
          <div className="h-9 w-44 rounded-xl bg-fill" />
          <div className="h-28 rounded-[20px] bg-fill" />
          <div className="grid lg:grid-cols-12 gap-3 lg:gap-4">
            <div className="lg:col-span-7 h-72 rounded-[20px] bg-fill" />
            <div className="lg:col-span-5 h-72 rounded-[20px] bg-fill" />
          </div>
        </div>
      }
    >
      <WawasanContent />
    </Suspense>
  );
}

function fmt(n: number | null): string {
  return n == null ? "—" : n.toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

function DeltaChip({ s }: { s: MetricSummary }) {
  if (s.delta == null || s.prevAvg == null) {
    return <span className="text-[12px] text-tertiary">belum ada pembanding</span>;
  }
  if (s.delta === 0) return <span className="text-[12px] text-secondary">tetap</span>;
  const arah = s.delta > 0 ? "naik" : "turun";
  const color = s.isGood === true ? "var(--positive)" : s.isGood === false ? "var(--negative)" : "var(--label-secondary)";
  return (
    <span className="text-[12px] num" style={{ color }}>
      {arah} {fmt(Math.abs(s.delta))}
    </span>
  );
}

async function WawasanContent() {
  await connection();
  const user = await getCurrentUser();
  const logs = await getRecentLogs(60);
  const today = toDateStr();

  const report = weeklyReport(
    logs.map((l) => ({
      date: l.date,
      steps: l.steps,
      sleepHours: l.sleepHours,
      waterMl: l.waterMl,
      mood: l.mood,
      energy: l.energy,
    })),
    { stepGoal: user.stepGoal, sleepGoalH: user.sleepGoalH, waterGoalMl: user.waterGoalMl },
  );

  const lite: LogLite[] = logs.map((l) => ({
    date: l.date,
    steps: l.steps,
    sleepHours: l.sleepHours,
    waterMl: l.waterMl,
    mood: l.mood,
    energy: l.energy,
  }));
  const insights = generateInsights(lite, user.sleepGoalH);

  const streak = logStreak(
    logs.filter((l) => l.steps != null || l.sleepHours != null || l.waterMl > 0 || l.mood != null).map((l) => l.date),
  );
  const flags7 = last7Flags(logs.map((l) => l.date));

  // Berat terbaru: dari catatan harian dulu, lalu profil
  const beratTerbaru =
    [...logs].reverse().find((l) => l.weightKg != null)?.weightKg ?? user.weightKg ?? null;
  const imt = beratTerbaru && user.heightCm ? hitungImt(beratTerbaru, user.heightCm) : null;
  const imtCat = imt ? imtCategory(imt) : null;
  const ideal = user.heightCm ? rentangIdeal(user.heightCm) : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
      <div className="col-span-2 lg:col-span-12 lg:pb-3">
        <h1 className="text-[24px] font-semibold tracking-tight">Wawasan</h1>
        <p className="text-[13px] text-secondary mt-1">Ringkasan laporan pekanan · {report.periodLabel}</p>
      </div>

      {/* Satu temuan utama */}
      <section className="panel col-span-2 lg:col-span-12 p-5 lg:p-6">
        <p className="text-[12px] text-tertiary mb-2">Temuan pekan ini</p>
        <p className="text-[18px] lg:text-[20px] leading-snug font-medium max-w-[52ch]">{report.temuan}</p>
        <p className="text-[12px] text-tertiary mt-3 num">
          Dihitung dari {report.daysLoggedThis} hari tercatat · pembanding {report.prevLabel}
        </p>
      </section>

      {/* Ringkasan metrik (7) + hit rate & konsistensi (5) */}
      <section className="panel col-span-2 lg:col-span-7 p-5 h-full">
        <h2 className="text-[14px] font-semibold mb-1">Rata-rata vs pekan lalu</h2>
        <div className="divide-y divide-rule">
          {report.summary.map((s) => (
            <div key={s.key} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-medium leading-tight">{s.label}</p>
                <p className="text-[12px] text-tertiary mt-0.5 num">
                  pekan lalu {fmt(s.prevAvg)} {s.unit !== "skala 1-5" ? s.unit : ""} · {s.daysThis} hari data
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[22px] leading-none num" style={{ fontWeight: 400 }}>{fmt(s.thisAvg)}</p>
                <div className="mt-1">
                  <DeltaChip s={s} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel col-span-2 lg:col-span-5 p-5 flex flex-col gap-4 h-full">
        <div>
          <h2 className="text-[14px] font-semibold mb-2">Hit rate target pekan ini</h2>
          <div className="space-y-3">
            {report.hitRate.map((h) => {
              const ratio = h.total > 0 ? h.achieved / h.total : 0;
              return (
                <div key={h.label}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span>{h.label}</span>
                    <span className="text-secondary num">
                      {h.achieved}/{h.total} ({Math.round(ratio * 100)}%)
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-1.5 rounded-full bg-fill overflow-hidden"
                    role="img"
                    aria-label={`${h.achieved} dari ${h.total} hari`}
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${ratio * 100}%`, background: "var(--blue)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-rule pt-4 flex items-center justify-between gap-3 mt-auto">
          <div>
            <p className="text-[32px] leading-none num" style={{ fontWeight: 400 }}>{streak}</p>
            <p className="text-[12px] text-secondary mt-1">hari beruntun mencatat</p>
          </div>
          <div className="flex gap-1.5" aria-hidden>
            {flags7.map((f, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: f ? "var(--blue)" : "var(--fill)" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* IMT */}
      <section className="panel col-span-2 lg:col-span-12 p-5 lg:px-6 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-8">
        <h2 className="text-[14px] font-semibold lg:w-56 shrink-0">Indeks massa tubuh</h2>
        {imt && imtCat ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] leading-none num" style={{ fontWeight: 400 }}>
                {imt.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span
                className="text-[13px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: imtCat.tone === "positif" ? "var(--positive)" : imtCat.tone === "negatif" ? "var(--negative)" : "var(--color-ios-orange)",
                }}
              >
                {imtCat.label}
              </span>
            </div>
            <p className="text-[12px] text-secondary leading-snug num">
              Dari berat terakhir {fmt(beratTerbaru)} kg · tinggi {user.heightCm} cm · kategori {imtCat.range}
            </p>
          </>
        ) : (
          <p className="text-[13px] text-secondary leading-snug">
            Isi tinggi badan di Profil dan berat badan di Catatan untuk melihat IMT-mu.
          </p>
        )}
        {ideal ? (
          <p className="text-[12px] text-tertiary num lg:ml-auto">
            Rentang ideal untuk tinggimu: {ideal[0]}-{ideal[1]} kg
          </p>
        ) : null}
      </section>

      {/* Streak ringkas di mobile digabung di kiri; pola korelasi penuh */}
      <section className="panel col-span-2 lg:col-span-12 p-5 lg:px-6">
        <h2 className="text-[14px] font-semibold mb-1">Pola & korelasi (30 hari)</h2>
        {insights.length > 0 ? (
          <InsightCards insights={insights} />
        ) : (
          <p className="py-3 text-[14px] text-secondary">
            Minimal 4 hari dengan data lengkap diperlukan untuk menemukan pola. Terus mencatat ya.
          </p>
        )}
      </section>
    </div>
  );
}
