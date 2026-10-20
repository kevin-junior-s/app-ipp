"use client";

import { useActionState, useState } from "react";
import { saveDailyLog } from "@/lib/actions/logs";
import type { FormState } from "@/lib/validations";

export type LogInitial = {
  steps: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  waterMl: number;
  weightKg: number | null;
  heartRate: number | null;
  systolic: number | null;
  diastolic: number | null;
  mood: number | null;
  energy: number | null;
  symptoms: string[];
  note: string | null;
};

const MOOD_LABEL = ["Lelah", "Sedih", "Biasa", "Baik", "Hebat"];
const ENERGI_LABEL = ["Kosong", "Tipis", "Sedang", "Penuh", "Meluap"];

function Field({
  label,
  hint,
  children,
  error,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  error?: string;
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

function ScalePicker({
  name,
  value,
  onChange,
  labels,
}: {
  name: string;
  value: number | null;
  onChange: (v: number | null) => void;
  labels: string[];
}) {
  return (
    <div className="flex gap-2">
      {labels.map((label, i) => {
        const v = i + 1;
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(active ? null : v)}
            className={`flex-1 rounded-[10px] py-2.5 text-center border transition-colors ${
              active ? "bg-ios-blue text-white border-ios-blue" : "bg-fill text-label border-transparent hover:bg-active"
            }`}
            aria-pressed={active}
          >
            <span className="text-[13px] font-semibold block leading-tight">{v}</span>
            <span className={`text-[11px] mt-0.5 block ${active ? "text-white/85" : "text-secondary"}`}>
              {label}
            </span>
          </button>
        );
      })}
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  );
}

export function DailyLogForm({ date, initial }: { date: string; initial: LogInitial | null }) {
  const [state, action, pending] = useActionState(saveDailyLog, undefined as FormState);
  const [mood, setMood] = useState<number | null>(initial?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(initial?.energy ?? null);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="date" value={date} />

      <Field label="Langkah" hint="deteksi otomatis di Beranda">
        <input name="steps" type="number" inputMode="numeric" min={0} max={200000} defaultValue={initial?.steps ?? ""} placeholder="cth. 6500" className="input-ios num" />
        <ErrorInline err={state?.errors?.steps?.[0]} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Jam tidur" hint="jam">
          <input name="sleepHours" type="number" inputMode="decimal" step="0.5" min={0} max={24} defaultValue={initial?.sleepHours ?? ""} placeholder="7.5" className="input-ios num" />
          <ErrorInline err={state?.errors?.sleepHours?.[0]} />
        </Field>
        <Field label="Kualitas tidur" hint="1-5">
          <select name="sleepQuality" defaultValue={initial?.sleepQuality ?? ""} className="input-ios">
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Air minum" hint="ml">
          <input name="waterMl" type="number" inputMode="numeric" min={0} max={10000} defaultValue={initial?.waterMl || ""} placeholder="2000" className="input-ios num" />
          <ErrorInline err={state?.errors?.waterMl?.[0]} />
        </Field>
        <Field label="Berat badan" hint="kg">
          <input name="weightKg" type="number" inputMode="decimal" step="0.1" min={20} max={400} defaultValue={initial?.weightKg ?? ""} placeholder="62.5" className="input-ios num" />
          <ErrorInline err={state?.errors?.weightKg?.[0]} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Denyut" hint="bpm">
          <input name="heartRate" type="number" inputMode="numeric" min={25} max={250} defaultValue={initial?.heartRate ?? ""} placeholder="72" className="input-ios num" />
        </Field>
        <Field label="Sistolik" hint="mmHg">
          <input name="systolic" type="number" inputMode="numeric" min={50} max={300} defaultValue={initial?.systolic ?? ""} placeholder="120" className="input-ios num" />
        </Field>
        <Field label="Diastolik" hint="mmHg">
          <input name="diastolic" type="number" inputMode="numeric" min={30} max={200} defaultValue={initial?.diastolic ?? ""} placeholder="80" className="input-ios num" />
        </Field>
      </div>

      <Field label="Mood hari ini">
        <ScalePicker name="mood" value={mood} onChange={setMood} labels={MOOD_LABEL} />
      </Field>

      <Field label="Energi" hint="1-5">
        <ScalePicker name="energy" value={energy} onChange={setEnergy} labels={ENERGI_LABEL} />
      </Field>

      <Field label="Gejala" hint="pisahkan dengan koma">
        <input name="symptoms" defaultValue={initial?.symptoms.join(", ")} placeholder="cth. pusing, pegal, mual" className="input-ios" />
      </Field>

      <Field label="Catatan bebas">
        <textarea name="note" rows={3} maxLength={500} defaultValue={initial?.note ?? ""} placeholder="Hari ini aku merasa…" className="input-ios resize-none" />
      </Field>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={pending} className="btn-primary w-auto px-6">
          {pending ? "Menyimpan…" : "Simpan Catatan"}
        </button>
        {state?.message ? (
          <p className={`text-[14px] ${state.success ? "text-positive" : "text-ios-red"}`}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}

function ErrorInline({ err }: { err?: string }) {
  if (!err) return null;
  return <p className="text-ios-red text-[13px] mt-1">{err}</p>;
}
