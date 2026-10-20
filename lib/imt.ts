/** Kesehatan turunan: IMT (Kemenkes/WHO) & rentang berat ideal. */

export type ImtCategory = {
  label: string;
  tone: "positif" | "netral" | "negatif";
  range: string;
};

const IMT_CATEGORIES: { min: number; cat: ImtCategory }[] = [
  { min: 30, cat: { label: "Obesitas", tone: "negatif", range: "≥ 30" } },
  { min: 25, cat: { label: "Berlebih", tone: "netral", range: "25 – 29,9" } },
  { min: 18.5, cat: { label: "Normal", tone: "positif", range: "18,5 – 24,9" } },
  { min: 0, cat: { label: "Kurus", tone: "netral", range: "< 18,5" } },
];

export function imtCategory(imt: number): ImtCategory {
  return IMT_CATEGORIES.find((c) => imt >= c.min)!.cat;
}

export function hitungImt(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

/** Rentang berat ideal (IMT 18,5–24,9) dalam kg, dibulatkan. */
export function rentangIdeal(heightCm: number): [number, number] | null {
  if (heightCm <= 0) return null;
  const m = heightCm / 100;
  return [Math.round(18.5 * m * m), Math.round(24.9 * m * m)];
}
