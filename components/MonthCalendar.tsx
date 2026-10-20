import Link from "next/link";

const HARI_PENDEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type Props = {
  tahun: number;
  bulan: number; // 0-11
  tercatat: Set<string>; // YYYY-MM-DD
  dipilih: string; // YYYY-MM-DD
  hariIni: string; // YYYY-MM-DD
};

function ymd(tahun: number, bulan: number, day: number): string {
  return `${tahun}-${String(bulan + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Kalender bulanan (server component, tanpa JS):
 * hari tercatat diberi titik, hari dipilih terisi, hari depan dinonaktifkan.
 * Navigasi bulan & pemilihan hari lewat URL (?month=&date=).
 */
export function MonthCalendar({ tahun, bulan, tercatat, dipilih, hariIni }: Props) {
  const first = new Date(tahun, bulan, 1);
  const daysInMonth = new Date(tahun, bulan + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // Senin = kolom pertama

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {HARI_PENDEK.map((h) => (
          <div key={h} className="text-center text-[11px] text-tertiary py-1">
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day == null) return <div key={`e${i}`} />;

          const dateStr = ymd(tahun, bulan, day);
          const isFuture = dateStr > hariIni;
          const isSelected = dateStr === dipilih;
          const isToday = dateStr === hariIni;
          const hasLog = tercatat.has(dateStr);

          const cls = [
            "relative h-10 rounded-[10px] flex flex-col items-center justify-center text-[13px] num transition-colors",
            isSelected
              ? "bg-ios-blue text-white font-semibold"
              : isFuture
                ? "text-tertiary"
                : "hover:bg-fill",
            isToday && !isSelected ? "font-semibold" : "",
          ].join(" ");

          const inner = (
            <>
              <span className="leading-none">{day}</span>
              <span
                className="w-1 h-1 rounded-full mt-1"
                style={{
                  background: hasLog
                    ? isSelected
                      ? "#ffffff"
                      : "var(--blue)"
                    : "transparent",
                }}
                aria-hidden
              />
            </>
          );

          return isFuture ? (
            <div key={dateStr} className={cls} aria-disabled>
              {inner}
            </div>
          ) : (
            <Link
              key={dateStr}
              href={`/catatan?date=${dateStr}&month=${tahun}-${String(bulan + 1).padStart(2, "0")}`}
              className={cls}
              aria-current={isSelected ? "date" : undefined}
              aria-label={`${day}, ${hasLog ? "tercatat" : "belum tercatat"}`}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
