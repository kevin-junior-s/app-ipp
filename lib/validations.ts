import * as z from "zod";

export const RegisterFormSchema = z.object({
  name: z.string().min(2, { error: "Nama minimal 2 karakter" }).trim(),
  email: z.email({ error: "Masukkan email yang valid" }).trim(),
  password: z
    .string()
    .min(8, { error: "Password minimal 8 karakter" })
    .regex(/[a-zA-Z]/, { error: "Harus mengandung huruf" })
    .regex(/[0-9]/, { error: "Harus mengandung angka" }),
});

export const LoginFormSchema = z.object({
  email: z.email({ error: "Masukkan email yang valid" }).trim(),
  password: z.string().min(1, { error: "Password wajib diisi" }),
});

const optionalInt = (min: number, max: number) =>
  z.coerce
    .number({ error: `Harus berupa angka (${min}-${max})` })
    .int("Harus bilangan bulat")
    .min(min, `Minimal ${min}`)
    .max(max, `Maksimal ${max}`)
    .nullable()
    .optional();

const optionalFloat = (min: number, max: number) =>
  z.coerce
    .number({ error: `Harus berupa angka (${min}-${max})` })
    .min(min, `Minimal ${min}`)
    .max(max, `Maksimal ${max}`)
    .nullable()
    .optional();

export const DailyLogFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Tanggal tidak valid" }),
  steps: optionalInt(0, 200000),
  sleepHours: optionalFloat(0, 24),
  sleepQuality: optionalInt(1, 5),
  waterMl: optionalInt(0, 10000),
  weightKg: optionalFloat(20, 400),
  heartRate: optionalInt(25, 250),
  systolic: optionalInt(50, 300),
  diastolic: optionalInt(30, 200),
  mood: optionalInt(1, 5),
  energy: optionalInt(1, 5),
  symptoms: z.string().optional(),
  note: z.string().max(500, { error: "Catatan maksimal 500 karakter" }).optional(),
});

export const ProfileFormSchema = z.object({
  name: z.string().min(2, { error: "Nama minimal 2 karakter" }).trim(),
  heightCm: optionalFloat(50, 260),
  weightKg: optionalFloat(20, 400),
  age: optionalInt(1, 120),
  gender: z.enum(["wanita", "pria", "lainnya"]).nullable().optional(),
  stepGoal: optionalInt(1000, 100000),
  waterGoalMl: optionalInt(250, 10000),
  sleepGoalH: optionalFloat(3, 16),
});

export type FormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  success?: boolean;
} | undefined;
