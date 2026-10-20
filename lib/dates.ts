/** Util tanggal (string YYYY-MM-DD lokal, tanpa dependensi locale). */

export function toDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatTanggalPanjang(d: Date = new Date()): string {
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTanggalSingkat(dateStr: string): string {
  const d = fromDateStr(dateStr);
  return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)}`;
}

/** "13–19 Okt 2026", atau "28 Okt – 3 Nov 2026" bila beda bulan/tahun. */
export function formatRentangTanggal(a: Date, b: Date): string {
  const ta = `${a.getDate()} ${BULAN[a.getMonth()].slice(0, 3)}`;
  const tb = `${b.getDate()} ${BULAN[b.getMonth()].slice(0, 3)}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()}–${b.getDate()} ${BULAN[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
  }
  return `${ta} – ${tb} ${b.getFullYear()}`;
}

export function formatBulanPanjang(tahun: number, bulan: number): string {
  return `${BULAN[bulan]} ${tahun}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 4) return "Selamat malam";
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}
