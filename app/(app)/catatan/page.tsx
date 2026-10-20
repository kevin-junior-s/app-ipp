import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getLogForDate, getLoggedDatesBetween } from "@/lib/data";
import { DailyLogForm, type LogInitial } from "@/components/DailyLogForm";
import { MonthCalendar } from "@/components/MonthCalendar";
import { formatBulanPanjang, fromDateStr, formatTanggalPanjang, toDateStr } from "@/lib/dates";
import { logStreak } from "@/lib/streak";

export const metadata = { title: "Catatan · LangitTubuh" };

export default function CatatanPage(props: PageProps<"/catatan">) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 lg:space-y-4">
          <div className="h-9 w-52 rounded-xl bg-fill" />
          <div className="grid lg:grid-cols-12 gap-3 lg:gap-4">
            <div className="lg:col-span-4 h-96 rounded-[20px] bg-fill" />
            <div className="lg:col-span-8 h-96 rounded-[20px] bg-fill" />
          </div>
        </div>
      }
    >
      <CatatanContent searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}

function parseMonth(v: string | string[] | undefined, fallback: Date): { tahun: number; bulan: number } {
  if (typeof v === "string" && /^\d{4}-\d{2}$/.test(v)) {
    const [y, m] = v.split("-").map(Number);
    if (m >= 1 && m <= 12) return { tahun: y, bulan: m - 1 };
  }
  return { tahun: fallback.getFullYear(), bulan: fallback.getMonth() };
}

async function CatatanContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ date?: string | string[] | undefined; month?: string | string[] | undefined }>;
}) {
  await connection();
  const searchParams = await searchParamsPromise;

  const requested = typeof searchParams?.date === "string" ? searchParams.date : null;
  const today = toDateStr();
  const date =
    requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && requested <= today ? requested : today;

  const { tahun, bulan } = parseMonth(searchParams?.month, fromDateStr(date));

  const bulanStart = `${tahun}-${String(bulan + 1).padStart(2, "0")}-01`;
  const bulanEnd = `${tahun}-${String(bulan + 1).padStart(2, "0")}-${String(
    new Date(tahun, bulan + 1, 0).getDate(),
  ).padStart(2, "0")}`;

  const [log, tercatatArr] = await Promise.all([
    getLogForDate(date),
    getLoggedDatesBetween(bulanStart, bulanEnd > today ? today : bulanEnd),
  ]);
  const tercatat = new Set(tercatatArr);

  const initial: LogInitial | null = log
    ? {
        steps: log.steps,
        sleepHours: log.sleepHours,
        sleepQuality: log.sleepQuality,
        waterMl: log.waterMl,
        weightKg: log.weightKg,
        heartRate: log.heartRate,
        systolic: log.systolic,
        diastolic: log.diastolic,
        mood: log.mood,
        energy: log.energy,
        symptoms: parseSymptoms(log.symptoms),
        note: log.note,
      }
    : null;

  const canNext = date < today;
  const prevDate = shiftDate(date, -1);
  const nextDate = shiftDate(date, 1);
  const streak = logStreak(tercatatArr);

  const bulanIni = tahun === new Date().getFullYear() && bulan === new Date().getMonth();
  const prevMonth = shiftMonth(tahun, bulan, -1);
  const nextMonth = shiftMonth(tahun, bulan, 1);

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Catatan Harian</h1>
          <p className="text-[13px] text-secondary mt-1">
            {tercatat.size > 0
              ? `${tercatat.size} hari tercatat di ${formatBulanPanjang(tahun, bulan)} · streak ${streak} hari`
              : "Belum ada catatan di bulan ini"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-3 lg:gap-4 items-start">
        {/* Kalender bulanan */}
        <section className="panel lg:col-span-4 p-4 lg:p-5">
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/catatan?date=${date}&month=${prevMonth}`}
              className="btn-secondary px-3 shrink-0"
              aria-label="Bulan sebelumnya"
            >
              ←
            </Link>
            <p className="text-[14px] font-semibold">{formatBulanPanjang(tahun, bulan)}</p>
            <Link
              href={`/catatan?date=${date}&month=${nextMonth}`}
              className={`btn-secondary px-3 shrink-0 ${bulanIni ? "opacity-30 pointer-events-none" : ""}`}
              aria-label="Bulan berikutnya"
            >
              →
            </Link>
          </div>
          <MonthCalendar
            tahun={tahun}
            bulan={bulan}
            tercatat={tercatat}
            dipilih={date}
            hariIni={today}
          />
          <p className="flex items-center gap-2 text-[12px] text-tertiary mt-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-ios-blue" aria-hidden />
            hari yang sudah tercatat
          </p>
        </section>

        {/* Formulir tanggal terpilih */}
        <section className="panel lg:col-span-8 p-5">
          <div className="flex items-center justify-between gap-2 mb-5">
            <Link href={`/catatan?date=${prevDate}&month=${tahun}-${String(bulan + 1).padStart(2, "0")}`} className="btn-secondary shrink-0">
              ← Sebelumnya
            </Link>
            <p className="text-[14px] font-semibold text-center leading-tight">
              {formatTanggalPanjang(fromDateStr(date))}
            </p>
            {canNext ? (
              <Link href={`/catatan?date=${nextDate}&month=${tahun}-${String(bulan + 1).padStart(2, "0")}`} className="btn-secondary shrink-0">
                Besok →
              </Link>
            ) : (
              <span className="btn-secondary opacity-30 select-none shrink-0" aria-hidden>
                Besok →
              </span>
            )}
          </div>

          <DailyLogForm date={date} initial={initial} />
        </section>
      </div>
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

function shiftDate(dateStr: string, deltaDays: number): string {
  const d = fromDateStr(dateStr);
  d.setDate(d.getDate() + deltaDays);
  return toDateStr(d);
}

function shiftMonth(tahun: number, bulan: number, delta: number): string {
  const d = new Date(tahun, bulan + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
