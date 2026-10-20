import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";
import { LangitMark } from "@/components/Sidebar";

export const metadata = { title: "Masuk · LangitTubuh" };

/** Pita langit mini · milik produk, digambar statis untuk panel merek. */
function MiniSky() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl h-36"
      style={{ background: "#2f9df2", boxShadow: "0 10px 30px rgba(0,60,140,0.30)" }}
      aria-hidden
    >
      <svg width="80" height="80" viewBox="0 0 120 120" className="absolute -top-2 -right-2 anim-sun-spin">
        <circle cx="60" cy="60" r="28" fill="#ffcc00" />
        <g stroke="#ffcc00" strokeWidth="7" strokeLinecap="round">
          <line x1="60" y1="10" x2="60" y2="22" />
          <line x1="60" y1="98" x2="60" y2="110" />
          <line x1="10" y1="60" x2="22" y2="60" />
          <line x1="98" y1="60" x2="110" y2="60" />
          <line x1="25" y1="25" x2="33" y2="33" />
          <line x1="87" y1="87" x2="95" y2="95" />
          <line x1="95" y1="25" x2="87" y2="33" />
          <line x1="33" y1="87" x2="25" y2="95" />
        </g>
      </svg>
      <svg width="150" height="82" viewBox="0 0 130 72" className="absolute bottom-2 left-3 anim-float">
        <path
          d="M38 66 a22 22 0 0 1 22-22 a26 26 0 0 1 49 9 a17 17 0 0 1 -4 34 h-54 a15 15 0 0 1 -13 -21 z"
          fill="rgba(255,255,255,0.92)"
        />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex min-h-dvh">
      {/* Panel merek · hanya desktop */}
      <aside className="hidden lg:flex w-[420px] xl:w-[480px] shrink-0 flex-col justify-between p-10 border-r border-separator bg-surface">
        <Link href="/" className="flex items-center gap-2.5">
          <LangitMark />
          <span className="text-[15px] font-semibold tracking-tight">LangitTubuh</span>
        </Link>
        <div>
          <p className="font-serif text-[26px] lg:text-[30px] leading-[1.2] tracking-tight">
            Kesehatan harianmu, diramalkan seperti langit.
          </p>
          <p className="text-[14px] text-secondary mt-4 leading-relaxed max-w-[36ch]">
            Skor tubuh, langkah, tidur, air minum, dan mood, disatukan jadi satu ramalan cuaca untuk hari ini.
          </p>
        </div>
        <MiniSky />
      </aside>

      {/* Kolom formulir */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 lg:hidden">
              <LangitMark />
              <span className="text-[15px] font-semibold tracking-tight">LangitTubuh</span>
            </Link>
            <h1 className="text-[24px] font-semibold tracking-tight">Masuk</h1>
            <p className="text-[14px] text-secondary mt-1">Selamat datang kembali di langit tubuhmu.</p>
          </div>
          <div className="panel p-6">
            <LoginForm />
          </div>
          <p className="text-[13px] text-secondary text-center mt-5">
            Belum punya akun?{" "}
            <Link href="/register" className="text-accent font-medium">
              Daftar gratis
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
