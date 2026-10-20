"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { ProfileFormSchema, type FormState } from "@/lib/validations";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = ProfileFormSchema.safeParse(
    Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v === "" ? undefined : v])),
  );

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Periksa kembali isianmu.",
    };
  }

  const d = parsed.data;

  await db.user.update({
    where: { id: userId },
    data: {
      name: d.name,
      heightCm: d.heightCm ?? null,
      weightKg: d.weightKg ?? null,
      age: d.age ?? null,
      gender: d.gender ?? null,
      stepGoal: d.stepGoal ?? 8000,
      waterGoalMl: d.waterGoalMl ?? 2000,
      sleepGoalH: d.sleepGoalH ?? 8,
    },
  });

  updateTag(`user:${userId}`);
  return { success: true, message: "Profil berhasil diperbarui." };
}
