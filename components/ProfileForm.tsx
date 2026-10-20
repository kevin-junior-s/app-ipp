"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import type { CurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export type ImtInfo = {
  imt: number | null;
  label: string | null;
  tone: "positif" | "netral" | "negatif" | null;
  ideal: [number, number] | null;
};

function Row({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-medium">{label}</span>
        {hint ? <span className="text-[12px] text-tertiary">{hint}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
      {error ? <p className="text-ios-red text-[13px] mt-1">{error}</p> : null}
    </div>
  );
}

/** Baris pengaturan: kolom label (kiri) + panel tonal berisi kontrol (kanan). */
function SettingSection({
  title,
  desc,
  aside,
  children,
}: {
  title: string;
  desc: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid lg:grid-cols-[minmax(0,450px)_minmax(0,700px)] gap-3 lg:gap-6 items-start">
      <div className="lg:pt-3">
        <h2 className="text-[16px] font-medium leading-tight">{title}</h2>
        <p className="text-[14px] text-secondary mt-1 leading-snug">{desc}</p>
        {aside ? <div className="mt-3">{aside}</div> : null}
      </div>
      <div className="panel-tonal p-4 lg:p-5">{children}</div>
    </section>
  );
}

export function ProfileForm({ user, imt }: { user: CurrentUser; imt: ImtInfo }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  const toneColor =
    imt.tone === "positif"
      ? "var(--positive)"
      : imt.tone === "negatif"
        ? "var(--negative)"
        : imt.tone === "netral"
          ? "var(--color-ios-orange)"
          : undefined;

  return (
    <form action={action} className="space-y-6 lg:space-y-8">
      <SettingSection title="Akun" desc="Nama yang tampil di seluruh aplikasi beserta alamat email masuk.">
        <div className="space-y-4">
          <Row label="Nama" error={state?.errors?.name?.[0]}>
            <input name="name" required defaultValue={user.name} className="input-ios" />
          </Row>
          <div>
            <span className="text-[14px] font-medium">Email</span>
            <p className="mt-2 text-[15px] text-secondary num">{user.email}</p>
            <p className="text-[12px] text-tertiary mt-1">Perubahan email belum tersedia.</p>
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Tubuh"
        desc="Data dasar untuk menghitung IMT dan menyesuaikan ramalan cuaca tubuh."
        aside={
          imt.imt != null && imt.label ? (
            <div>
              <p className="text-[12px] text-tertiary">IMT saat ini</p>
              <p className="text-[22px] leading-none num mt-1" style={{ fontWeight: 400, color: toneColor }}>
                {imt.imt.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                <span className="text-[13px] font-medium ml-1.5" style={{ color: toneColor }}>
                  {imt.label}
                </span>
              </p>
              {imt.ideal ? (
                <p className="text-[12px] text-tertiary mt-1.5 num">
                  Rentang ideal: {imt.ideal[0]}–{imt.ideal[1]} kg
                </p>
              ) : null}
            </div>
          ) : null
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Row label="Tinggi" hint="cm" error={state?.errors?.heightCm?.[0]}>
            <input name="heightCm" type="number" inputMode="decimal" step="0.5" min={50} max={260} defaultValue={user.heightCm ?? ""} className="input-ios num" />
          </Row>
          <Row label="Berat" hint="kg" error={state?.errors?.weightKg?.[0]}>
            <input name="weightKg" type="number" inputMode="decimal" step="0.1" min={20} max={400} defaultValue={user.weightKg ?? ""} className="input-ios num" />
          </Row>
          <Row label="Usia" hint="tahun" error={state?.errors?.age?.[0]}>
            <input name="age" type="number" inputMode="numeric" min={1} max={120} defaultValue={user.age ?? ""} className="input-ios num" />
          </Row>
          <Row label="Jenis kelamin" error={state?.errors?.gender?.[0]}>
            <select name="gender" defaultValue={user.gender ?? ""} className="input-ios">
              <option value="">— tidak disebutkan —</option>
              <option value="wanita">Wanita</option>
              <option value="pria">Pria</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </Row>
        </div>
      </SettingSection>

      <SettingSection title="Target harian" desc="Target inilah yang menentukan skor cuaca tubuh setiap hari.">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Row label="Langkah" error={state?.errors?.stepGoal?.[0]}>
              <input name="stepGoal" type="number" inputMode="numeric" min={1000} max={100000} step={500} defaultValue={user.stepGoal} className="input-ios num" />
            </Row>
            <Row label="Air minum" hint="ml" error={state?.errors?.waterGoalMl?.[0]}>
              <input name="waterGoalMl" type="number" inputMode="numeric" min={250} max={10000} step={100} defaultValue={user.waterGoalMl} className="input-ios num" />
            </Row>
          </div>
          <Row label="Tidur" hint="jam" error={state?.errors?.sleepGoalH?.[0]}>
            <input name="sleepGoalH" type="number" inputMode="decimal" step="0.5" min={3} max={16} defaultValue={user.sleepGoalH} className="input-ios num" />
          </Row>

          <div className="flex items-center justify-end gap-3 pt-1">
            {state?.message ? (
              <p className={`text-[14px] ${state.success ? "text-positive" : "text-ios-red"}`}>{state.message}</p>
            ) : null}
            <button type="submit" disabled={pending} className="btn-primary w-auto px-6">
              {pending ? "Menyimpan…" : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Tampilan"
        desc="Pilih terang, gelap, atau ikut sistem. Tema tersimpan di peramban ini."
      >
        <ThemeToggle />
      </SettingSection>
    </form>
  );
}
