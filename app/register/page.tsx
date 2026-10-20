import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";
import { LangitMark } from "@/components/Sidebar";

export const metadata = { title: "Daftar · LangitTubuh" };

export default function RegisterPage() {
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
            Mulai pantau cuaca tubuhmu, satu catatan sehari.
          </p>
          <p className="text-[14px] text-secondary mt-4 leading-relaxed max-w-[36ch]">
            Gratis, data tersimpan di akunmu sendiri, dan laporan pekanan terbentuk otomatis mulai hari pertama.
          </p>
        </div>
        <p className="text-[12px] text-tertiary">
          Bukan pengganti nasihat medis profesional.
        </p>
      </aside>

      {/* Kolom formulir */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 lg:hidden">
              <LangitMark />
              <span className="text-[15px] font-semibold tracking-tight">LangitTubuh</span>
            </Link>
            <h1 className="text-[24px] font-semibold tracking-tight">Buat akun</h1>
            <p className="text-[14px] text-secondary mt-1">Butuh kurang dari satu menit.</p>
          </div>
          <div className="panel p-6">
            <RegisterForm />
          </div>
          <p className="text-[13px] text-secondary text-center mt-5">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-accent font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
