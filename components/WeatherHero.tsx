import type { WeatherReport } from "@/lib/weather";

/** Warna langit datar per kondisi (scene adalah gambar produk, bukan dekorasi gradien). */
const SKY: Record<WeatherReport["condition"], [string, string]> = {
  cerah: ["#5aa9e6", "rgba(0,40,90,0.22)"],
  "cerah-berawan": ["#6b9fd0", "rgba(0,40,90,0.22)"],
  berawan: ["#8b9cae", "rgba(30,40,60,0.24)"],
  hujan: ["#71818f", "rgba(20,30,45,0.3)"],
  badai: ["#525a64", "rgba(10,15,25,0.36)"],
};

const METRIC_HUE: Record<string, string> = {
  tidur: "var(--color-ios-indigo)",
  langkah: "var(--color-ios-green)",
  jantung: "var(--color-ios-red)",
  air: "var(--color-ios-teal)",
  mood: "var(--color-ios-orange)",
};

function Sun({ big = false }: { big?: boolean }) {
  const s = big ? 96 : 72;
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" className="anim-sun-spin">
      <circle cx="60" cy="60" r="30" fill="#ffcc00" />
      <circle cx="60" cy="60" r="36" fill="#ffcc00" opacity="0.25" className="anim-pulse" />
      <g stroke="#ffcc00" strokeWidth="7" strokeLinecap="round">
        <line x1="60" y1="8" x2="60" y2="20" />
        <line x1="60" y1="100" x2="60" y2="112" />
        <line x1="8" y1="60" x2="20" y2="60" />
        <line x1="100" y1="60" x2="112" y2="60" />
        <line x1="23" y1="23" x2="32" y2="32" />
        <line x1="88" y1="88" x2="97" y2="97" />
        <line x1="97" y1="23" x2="88" y2="32" />
        <line x1="32" y1="88" x2="23" y2="97" />
      </g>
    </svg>
  );
}

function Cloud({ className = "", w = 130 }: { className?: string; w?: number }) {
  return (
    <svg width={w} height={w * 0.55} viewBox="0 0 130 72" className={className}>
      <path
        d="M38 66 a22 22 0 0 1 22-22 a26 26 0 0 1 49 9 a17 17 0 0 1 -4 34 h-54 a15 15 0 0 1 -13 -21 z"
        fill="rgba(255,255,255,0.92)"
      />
    </svg>
  );
}

function RainDrops() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-20 overflow-hidden pointer-events-none">
      {[12, 26, 40, 54, 68, 82].map((left, i) => (
        <span
          key={left}
          className="anim-rain absolute top-0 w-[3px] h-4 rounded-full bg-white/70"
          style={{ left: `${left}%`, animationDelay: `${i * 0.14}s` }}
        />
      ))}
    </div>
  );
}

function Lightning() {
  return (
    <svg width="36" height="54" viewBox="0 0 46 70" className="anim-flash absolute right-[18%] bottom-6">
      <path d="M26 2 L8 38 h12 L16 68 L38 28 H24 z" fill="#ffcc00" />
    </svg>
  );
}

/** Pita langit · gambar scene milik produk (dari namanya sendiri). */
function SkyScene({ condition }: { condition: WeatherReport["condition"] }) {
  const [sky, shadow] = SKY[condition];
  const showSun = condition === "cerah" || condition === "cerah-berawan";
  const showCloud = condition !== "cerah";
  const heavy = condition === "hujan" || condition === "badai";

  return (
    <div
      className="relative overflow-hidden rounded-2xl h-28 sm:h-40"
      style={{ background: sky, boxShadow: `0 8px 24px ${shadow}` }}
      aria-hidden
    >
      <div className="absolute -top-3 -right-3 opacity-90">
        {showSun ? <Sun big /> : null}
      </div>
      {showCloud ? (
        <>
          <div className="absolute top-2 right-14 anim-float opacity-95">
            <Cloud w={condition === "berawan" || condition === "badai" ? 150 : 120} />
          </div>
          <div className="absolute bottom-10 -left-5 anim-float-slow opacity-70">
            <Cloud w={96} />
          </div>
        </>
      ) : null}
      {heavy ? <RainDrops /> : null}
      {condition === "badai" ? <Lightning /> : null}
    </div>
  );
}

/**
 * Panel "Cuaca tubuh": satu pertanyaan · bagaimana kondisi tubuhku hari ini.
 * Skor besar di scene, lalu kontribusi tiap metrik (skor + penjelasan).
 */
export function WeatherPanel({ report }: { report: WeatherReport }) {
  const tanpaData = report.components.every((c) => c.score == null);

  return (
    <section className="panel p-5 lg:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-[14px] font-semibold">Cuaca tubuh hari ini</h2>
        <span className="text-[12px] text-tertiary">skor komponen 0-100</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        {/* Kiri: kondisi + kontribusi tiap metrik */}
        <div className="order-2 lg:order-1 min-w-0">
          <p className="text-[20px] font-semibold leading-tight">{report.conditionLabel}</p>
          <p className="text-[14px] text-secondary leading-relaxed mt-1.5">{report.forecast}</p>

          <div className="mt-4 space-y-3">
            {report.components.map((c) => (
              <div key={c.key}>
                <div className="flex items-center gap-3">
                  <span className="w-[104px] shrink-0 text-[13px]">{c.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-fill overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${c.score ?? 0}%`,
                        background: c.score == null ? "transparent" : METRIC_HUE[c.key] ?? "var(--blue)",
                      }}
                    />
                  </div>
                  <span className="w-9 text-right text-[13px] num text-secondary">
                    {c.score == null ? "—" : c.score}
                  </span>
                </div>
                {c.detail ? (
                  <p className="text-[12px] text-tertiary mt-0.5 pl-[116px] leading-snug">{c.detail}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Kanan: scene langit + skor */}
        <div className="order-1 lg:order-2 max-w-[300px] sm:max-w-[420px] lg:max-w-none">
          <SkyScene condition={report.condition} />
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-[32px] leading-none num" style={{ fontWeight: 500 }}>
              {tanpaData ? "—" : report.score}
            </span>
            <span className="text-[13px] text-secondary">/ 100 skor tubuh</span>
          </div>
        </div>
      </div>
    </section>
  );
}
