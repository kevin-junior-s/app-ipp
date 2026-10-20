import { toDateStr } from "@/lib/dates";

/**
 * Hari beruntun mencatat (log dengan data apa pun), dihitung mundur
 * dari hari ini. Jika hari ini belum diisi, hitungan dimulai dari
 * kemarin · streak hari ini belum terisi tidak langsung putus.
 */
export function logStreak(logDates: string[]): number {
  const set = new Set(logDates);
  const cursor = new Date();
  if (!set.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let n = 0;
  while (set.has(toDateStr(cursor))) {
    n += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

/** 7 hari terakhir: tercatat atau tidak (untuk titik konsistensi). */
export function last7Flags(logDates: string[], today = new Date()): boolean[] {
  const set = new Set(logDates);
  const out: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(set.has(toDateStr(d)));
  }
  return out;
}
