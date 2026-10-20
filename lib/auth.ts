import "server-only";
import { redirect } from "next/navigation";
import { cacheTag } from "next/cache";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
  gender: string | null;
  stepGoal: number;
  waterGoalMl: number;
  sleepGoalH: number;
};

/**
 * Membaca sesi dari cookie lalu mencari user di database.
 * Menggunakan `use cache: private` (Cache Components): hasilnya
 * disimpan di browser per sesi, tidak pernah di-cache di server.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  "use cache: private";

  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      heightCm: true,
      weightKg: true,
      age: true,
      gender: true,
      stepGoal: true,
      waterGoalMl: true,
      sleepGoalH: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  cacheTag(`user:${user.id}`);
  return user;
}

/** Versi ringan tanpa redirect · untuk dipakai di Server Actions. */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}
