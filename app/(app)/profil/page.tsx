import { Suspense } from "react";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecentLogs } from "@/lib/data";
import { hitungImt, imtCategory, rentangIdeal } from "@/lib/imt";
import { ProfileForm, type ImtInfo } from "@/components/ProfileForm";
import { logout } from "@/lib/actions/auth";
import { formatTanggalPanjang } from "@/lib/dates";

export const metadata = { title: "Profil · LangitTubuh" };

export default function ProfilPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 lg:space-y-4">
          <div className="h-16 w-64 rounded-2xl bg-fill" />
          <div className="h-24 rounded-2xl bg-fill" />
          <div className="h-40 rounded-2xl bg-fill" />
          <div className="h-40 rounded-2xl bg-fill" />
        </div>
      }
    >
      <ProfilContent />
    </Suspense>
  );
}

async function ProfilContent() {
  await connection();
  const user = await getCurrentUser();
  const logs = await getRecentLogs(60);

  // Berat terbaru: catatan harian dulu, lalu profil
  const beratTerbaru = [...logs].reverse().find((l) => l.weightKg != null)?.weightKg ?? user.weightKg ?? null;
  const imt = beratTerbaru && user.heightCm ? hitungImt(beratTerbaru, user.heightCm) : null;
  const imtInfo: ImtInfo = {
    imt,
    label: imt ? imtCategory(imt).label : null,
    tone: imt ? imtCategory(imt).tone : null,
    ideal: user.heightCm ? rentangIdeal(user.heightCm) : null,
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center gap-4">
        <span
          className="w-14 h-14 rounded-full flex items-center justify-center text-[22px] font-semibold shrink-0"
          style={{ background: "rgba(0,122,255,0.14)", color: "var(--blue)" }}
          aria-hidden
        >
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold tracking-tight truncate">{user.name}</h1>
          <p className="text-[14px] text-secondary truncate num">{user.email}</p>
        </div>
      </div>

      <ProfileForm user={user} imt={imtInfo} />

      <section className="grid lg:grid-cols-[minmax(0,450px)_minmax(0,700px)] gap-3 lg:gap-6 items-start">
        <div className="lg:pt-3">
          <h2 className="text-[16px] font-medium leading-tight">Sesi</h2>
          <p className="text-[14px] text-secondary mt-1 leading-snug">
            Keluar menghapus sesi di peramban ini. Datamu tetap tersimpan di akunmu.
          </p>
        </div>
        <div className="panel-tonal p-4 lg:p-5">
          <form action={logout}>
            <button type="submit" className="text-[15px] font-semibold text-negative">
              Keluar dari akun
            </button>
          </form>
        </div>
      </section>

      <p className="text-[12px] text-tertiary leading-relaxed lg:pt-2">
        Anggota sejak 2026 · data kesehatanmu adalah milikmu.
        <br />
        LangitTubuh bukan pengganti nasihat medis profesional.
      </p>
    </div>
  );
}
