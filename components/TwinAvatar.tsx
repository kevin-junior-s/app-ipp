import type { TwinState } from "@/lib/weather";

const SKIN: Record<TwinState, [string, string]> = {
  glowing: ["#ffe27a", "#ffb340"],
  segar: ["#a8f0c6", "#4cd97b"],
  lemas: ["#cfd6de", "#9aa5b1"],
  "mata-panda": ["#d8d3f0", "#a79fd4"],
  badai: ["#8b93a0", "#5b636f"],
};

const LABEL: Record<TwinState, string> = {
  glowing: "Bugar & bersinar",
  segar: "Segar & bertenaga",
  lemas: "Agak lemas",
  "mata-panda": "Mata panda…",
  badai: "Kewalahan",
};

function Eyes({ state }: { state: TwinState }) {
  if (state === "mata-panda") {
    return (
      <>
        <ellipse cx="37" cy="52" rx="12" ry="9" fill="#5a5480" opacity="0.55" />
        <ellipse cx="63" cy="52" rx="12" ry="9" fill="#5a5480" opacity="0.55" />
        <circle cx="37" cy="52" r="4.5" fill="#2b2740" />
        <circle cx="63" cy="52" r="4.5" fill="#2b2740" />
      </>
    );
  }
  if (state === "lemas" || state === "badai") {
    return (
      <>
        <path d="M31 51 q6 -5 12 0" stroke="#2b2740" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M57 51 q6 -5 12 0" stroke="#2b2740" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      <circle cx="37" cy="51" r="4.5" fill="#2b2740" />
      <circle cx="63" cy="51" r="4.5" fill="#2b2740" />
      {state === "glowing" ? (
        <>
          <circle cx="38.5" cy="49.5" r="1.5" fill="#fff" />
          <circle cx="64.5" cy="49.5" r="1.5" fill="#fff" />
        </>
      ) : null}
    </>
  );
}

function Mouth({ state }: { state: TwinState }) {
  if (state === "glowing" || state === "segar") {
    return <path d="M38 64 q12 11 24 0" stroke="#2b2740" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  }
  if (state === "lemas") {
    return <path d="M40 66 q10 -5 20 0" stroke="#2b2740" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  }
  // mata-panda & badai: mulut turun
  return <path d="M39 69 q11 -9 22 0" stroke="#2b2740" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
}

export function TwinAvatar({ state, size = 96 }: { state: TwinState; size?: number }) {
  const [c1, c2] = SKIN[state];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox="0 0 100 100" className={state === "glowing" ? "anim-bounce" : undefined}>
        <defs>
          <radialGradient id={`skin-${state}`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </radialGradient>
        </defs>

        {/* Aksesori: petir untuk badai */}
        {state === "badai" ? (
          <path d="M78 6 l-8 14 h6 l-4 12 11-14 h-6 z" fill="#ffcc00" className="anim-flash" />
        ) : null}

        {/* Aksesori: zzz untuk mata panda */}
        {state === "mata-panda" ? (
          <g fill="#8e8e93" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            <text x="76" y="20">z</text>
            <text x="86" y="12">z</text>
          </g>
        ) : null}

        {/* Kepala */}
        <circle cx="50" cy="54" r="34" fill={`url(#skin-${state})`} />
        {/* Pipi */}
        {(state === "glowing" || state === "segar") && (
          <>
            <circle cx="32" cy="61" r="5" fill="#ff7b8a" opacity="0.4" />
            <circle cx="68" cy="61" r="5" fill="#ff7b8a" opacity="0.4" />
          </>
        )}
        {/* Keringat untuk lemas */}
        {state === "lemas" ? (
          <path d="M79 44 q4 6 0 9 q-4 -3 0 -9" fill="#5ac8fa" className="anim-bounce" />
        ) : null}
        <Eyes state={state} />
        <Mouth state={state} />

        {/* Kilau untuk glowing */}
        {state === "glowing" ? (
          <g fill="#fff8c4">
            <path d="M16 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
            <path d="M88 40 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 z" />
          </g>
        ) : null}
      </svg>
      <span className="text-xs font-semibold text-secondary">{LABEL[state]}</span>
    </div>
  );
}
