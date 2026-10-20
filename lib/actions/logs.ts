"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { DailyLogFormSchema, type FormState } from "@/lib/validations";
import { toDateStr } from "@/lib/dates";

/** Ubah "" menjadi undefined agar field kosong tidak jadi 0. */
function emptyToUndefined(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    out[k] = v === "" ? undefined : v;
  }
  return out;
}

function invalidateLogTags(userId: string) {
  updateTag(`log:${userId}`);
  updateTag(`logs:${userId}`);
}

export async function saveDailyLog(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const parsed = DailyLogFormSchema.safeParse(
    emptyToUndefined(Object.fromEntries(formData.entries())),
  );

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Periksa kembali isianmu.",
    };
  }

  const d = parsed.data;
  const symptoms = String(formData.get("symptoms") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    steps: d.steps ?? null,
    sleepHours: d.sleepHours ?? null,
    sleepQuality: d.sleepQuality ?? null,
    weightKg: d.weightKg ?? null,
    heartRate: d.heartRate ?? null,
    systolic: d.systolic ?? null,
    diastolic: d.diastolic ?? null,
    mood: d.mood ?? null,
    energy: d.energy ?? null,
    symptoms: JSON.stringify(symptoms),
    note: d.note?.trim() ? d.note.trim() : null,
  };

  await db.dailyLog.upsert({
    where: { userId_date: { userId, date: d.date } },
    create: { userId, date: d.date, ...data, waterMl: d.waterMl ?? 0 },
    update: { ...data, ...(d.waterMl != null ? { waterMl: d.waterMl } : {}) },
  });

  invalidateLogTags(userId);
  return { success: true, message: "Catatan hari ini tersimpan." };
}

export async function addWater(ml: number) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const amount = Math.min(2000, Math.max(1, Math.round(ml)));
  const date = toDateStr();

  await db.dailyLog.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, waterMl: amount },
    update: { waterMl: { increment: amount } },
  });

  invalidateLogTags(userId);
}

export async function addSteps(count: number) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const amount = Math.min(50000, Math.max(1, Math.round(count)));
  const date = toDateStr();

  await db.dailyLog.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, steps: amount },
    update: { steps: { increment: amount } },
  });

  invalidateLogTags(userId);
}
