import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toDateStr } from "@/lib/dates";

export type DailyLogRow = {
  id: string;
  userId: string;
  date: string;
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
  symptoms: string;
  note: string | null;
};

/** Log hari ini (atau tanggal tertentu) untuk user yang sedang login. */
export async function getLogForDate(date: string) {
  const user = await getCurrentUser();
  return getLogByDate(user.id, date);
}

async function getLogByDate(userId: string, date: string) {
  "use cache";
  cacheTag(`log:${userId}`);
  cacheLife("minutes");

  return db.dailyLog.findUnique({
    where: { userId_date: { userId, date } },
  });
}

/** Daftar log N hari terakhir (termasuk hari ini), terurut naik. */
export async function getRecentLogs(days: number) {
  const user = await getCurrentUser();
  const since = toDateStr(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));
  return getLogsInRange(user.id, since);
}

async function getLogsInRange(userId: string, since: string) {
  "use cache";
  cacheTag(`logs:${userId}`);
  cacheLife("minutes");

  return db.dailyLog.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
  });
}

/**
 * Tanggal (YYYY-MM-DD) yang punya data dalam rentang · untuk
 * kalender catatan & streak. Baris apa pun dianggap tercatat
 * bila punya salah satu metrik terisi.
 */
export async function getLoggedDatesBetween(start: string, end: string) {
  const user = await getCurrentUser();
  return getLoggedDatesCached(user.id, start, end);
}

async function getLoggedDatesCached(userId: string, start: string, end: string) {
  "use cache";
  cacheTag(`logs:${userId}`);
  cacheLife("minutes");

  const rows = await db.dailyLog.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
      OR: [
        { steps: { not: null } },
        { sleepHours: { not: null } },
        { waterMl: { gt: 0 } },
        { mood: { not: null } },
        { heartRate: { not: null } },
        { weightKg: { not: null } },
      ],
    },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  return rows.map((r) => r.date);
}
