import type { Insight } from "@/lib/insights";

const TONE_DOT: Record<Insight["tone"], string> = {
  positif: "var(--positive)",
  negatif: "var(--negative)",
  netral: "var(--blue)",
};

function InsightIcon({ icon }: { icon: Insight["icon"] }) {
  const common = {
    className: "w-4 h-4 shrink-0 text-tertiary",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "tidur":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
        </svg>
      );
    case "mood":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" />
          <line x1="9" y1="9.5" x2="9" y2="10.5" />
          <line x1="15" y1="9.5" x2="15" y2="10.5" />
        </svg>
      );
    case "langkah":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M7 20c-1.5-2-2-4-1.5-6.5C6 11 7.5 10 8 8c.4-1.6-.2-3-.2-3s2.3.4 3 2c.6 1.4.3 3-.5 4.5C13 13 14 15 14 17c0 1.5-.5 2.5-1 3" />
          <path d="M16 15c1.2-.8 1.6-2 1.3-3.6C17 10 16 9 15.7 7.6c-.3-1.3.1-2.3.1-2.3s1.8.3 2.4 1.6c.5 1.1.2 2.3-.4 3.4" />
        </svg>
      );
    case "air":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16" />
          <line x1="12" y1="8" x2="12" y2="8.5" />
        </svg>
      );
  }
}

/** Daftar insight sebagai baris · dibungkus panel oleh halaman pemanggil. */
export function InsightCards({ insights }: { insights: Insight[] }) {
  return (
    <div>
      {insights.map((insight, i) => (
        <div
          key={insight.key}
          className={`flex gap-3 py-3.5 ${i > 0 ? "border-t border-rule" : ""}`}
        >
          <InsightIcon icon={insight.icon} />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold leading-tight flex items-center gap-2">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: TONE_DOT[insight.tone] }}
                aria-hidden
              />
              {insight.title}
            </p>
            <p className="text-[13px] text-secondary leading-snug mt-1">{insight.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
