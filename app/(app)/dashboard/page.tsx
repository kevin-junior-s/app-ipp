import { Suspense } from "react";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLogForDate, getRecentLogs, getLoggedDatesBetween } from "@/lib/data";
import { computeWeather } from "@/lib/weather";
import { generateInsights } from "@/lib/insights";
import { greeting, toDateStr } from "@/lib/dates";
import { logStreak, last7Flags } from "@/lib/streak";
import { WeatherPanel } from "@/components/WeatherHero";
import { TwinAvatar } from "@/components/TwinAvatar";
import { QuickWater } from "@/components/QuickWater";
import { StepSensor } from "@/components/StepSensor";
import { WaterReminder } from "@/components/WaterReminder";
import { InsightCards } from "@/components/InsightCards";

export const metadata = { title: "Beranda · LangitTubuh" };

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 lg:space-y-4">
          <div className="h-20 lg:h-24 rounded-2xl bg-fill" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-[20px] bg-fill" />
            ))}
          </div>
          <div className="h-64 rounded-[20px] bg-fill" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

type TileProps = {
  label: string;
  value: string;
  caption: string;
  ratio: number;
  hue: string;
};

function CountTile({ label, value, caption, ratio, hue }: TileProps) {
  return (
    <div className="panel lg:col-span-3 p-4 flex flex-col justify-between h-32">
      <p className="text-[12px] text-secondary">{label}</p>
      <div>
        <p className="text-[32px] leading-none num" style={{ fontWeight: 400 }}>
          {value}
        </p>
        <p className="text-[12px] text-tertiary mt-1.5 leading-tight">{caption}</p>
        <div className="mt-2 h-1 rounded-full bg-fill overflow-hidden" aria-hidden>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${Math.min(1, Math.max(0, ratio)) * 100}%`, background: hue }}
          />
        </div>
      </div>
    </div>
  );
}

async function DashboardContent() {
  await connection();
  const user = await getCurrentUser();
  const today = toDateStr();
  const sinceStreak = toDateStr(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000));
  const [log, logs7, logDates] = await Promise.all([
    getLogForDate(today),
    getRecentLogs(7),
    getLoggedDatesBetween(sinceStreak, today),
  ]);

  const report = computeWeather({
    steps: log?.steps ?? null,
    stepGoal: user.stepGoal,
    sleepHours: log?.sleepHours ?? null,
    sleepQuality: log?.sleepQuality ?? null,
    sleepGoalH: user.sleepGoalH,
    waterMl: log?.waterMl ?? null,
    waterGoalMl: user.waterGoalMl,
    heartRate: log?.heartRate ?? null,
    systolic: log?.systolic ?? null,
    diastolic: log?.diastolic ?? null,
    mood: log?.mood ?? null,
  });

  const insights = generateInsights(logs7, user.sleepGoalH);
  const streak = logStreak(logDates);
  const flags7 = last7Flags(logDates);

  const steps = log?.steps ?? 0;
  const water = log?.waterMl ?? 0;
  const sleep = log?.sleepHours ?? 0;
  const adaData = Boolean(log);

  const tiles: TileProps[] = [
    {
      label: "Langkah",
      value: adaData && log?.steps != null ? steps.toLocaleString("id-ID") : "—",
      caption: `target ${user.stepGoal.toLocaleString("id-ID")}`,
      ratio: user.stepGoal > 0 ? steps / user.stepGoal : 0,
      hue: "var(--color-ios-green)",
    },
    {
      label: "Air minum",
      value: adaData ? `${water.toLocaleString("id-ID")}` : "—",
      caption: `ml · target ${user.waterGoalMl.toLocaleString("id-ID")}`,
      ratio: user.waterGoalMl > 0 ? water / user.waterGoalMl : 0,
      hue: "var(--color-ios-teal)",
    },
    {
      label: "Tidur",
      value: adaData && log?.sleepHours != null ? sleep.toLocaleString("id-ID") : "—",
      caption: `jam · target ${user.sleepGoalH.toLocaleString("id-ID")}`,
      ratio: user.sleepGoalH > 0 ? sleep / user.sleepGoalH : 0,
      hue: "var(--color-ios-indigo)",
    },
    {
      label: "Mood",
      value: log?.mood != null ? `${log.mood}/5` : "—",
      caption: log?.mood != null ? ["Lelah", "Sedih", "Biasa", "Baik", "Hebat"][log.mood - 1] : "belum dicatat",
      ratio: (log?.mood ?? 0) / 5,
      hue: "var(--color-ios-orange)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
      {/* Sapaan + satu fakta hari ini, di atas ground */}
      <header className="col-span-2 lg:col-span-12 lg:pb-3">
        <h1 className="font-serif text-[26px] lg:text-[30px] leading-[1.15] tracking-tight">
          {greeting()}, {user.name.split(" ")[0]}.
        </h1>
        <p className="text-[14px] text-secondary mt-2">
          Skor tubuhmu {adaData ? report.score : "—"}
          {adaData ? "/100" : ""} hari ini, cuaca {report.conditionLabel.toLowerCase()}.
        </p>
      </header>

      {/* Empat angka harian */}
      {tiles.map((t) => (
        <CountTile key={t.label} {...t} />
      ))}

      {/* Cuaca tubuh (9) + twin & streak (3) */}
      <div className="col-span-2 lg:col-span-9">
        <WeatherPanel report={report} />
      </div>
      <section className="panel lg:col-span-3 p-5 flex flex-col items-center justify-between gap-3 h-full">
        <TwinAvatar state={report.twinState} size={92} />
        <div className="w-full border-t border-rule pt-3 text-center mt-auto">
          <p className="text-[32px] leading-none num" style={{ fontWeight: 400 }}>
            {streak}
          </p>
          <p className="text-[12px] text-secondary mt-1">hari beruntun mencatat</p>
          <div className="flex justify-center gap-1.5 mt-2.5" aria-hidden>
            {flags7.map((f, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: f ? "var(--blue)" : "var(--fill)" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Air cepat (6) + pengingat & sensor (6) */}
      <section className="panel lg:col-span-6 p-5">
        <h2 className="text-[14px] font-semibold mb-4">Air cepat</h2>
        <QuickWater currentMl={water} goalMl={user.waterGoalMl} />
      </section>
      <section className="panel lg:col-span-6 p-5 divide-y divide-rule">
        <div className="pb-5">
          <WaterReminder />
        </div>
        <div className="pt-5">
          <StepSensor />
        </div>
      </section>

      {/* Wawasan 7 hari */}
      <section className="panel col-span-2 lg:col-span-12 p-5 lg:px-6">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-[14px] font-semibold">Wawasan 7 hari terakhir</h2>
          <a href="/wawasan" className="text-[13px] text-accent font-medium">
            Lihat lengkap
          </a>
        </div>
        <InsightCards insights={insights} />
      </section>
    </div>
  );
}
