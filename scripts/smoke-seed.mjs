/* Seed cepat untuk smoke test: buat user demo + beberapa log + cetak session JWT. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const db = new PrismaClient();

function dateStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const hash = await bcrypt.hash("password123", 10);
const user = await db.user.upsert({
  where: { email: "demo@langittubuh.test" },
  update: {},
  create: {
    name: "Demo Pengguna",
    email: "demo@langittubuh.test",
    passwordHash: hash,
    heightCm: 165,
    weightKg: 58,
    age: 26,
    gender: "wanita",
  },
});

// 10 hari log contoh dengan pola tidur↔mood positif
const samples = [
  { s: 9200, sl: 7.8, q: 4, w: 2100, hr: 68, sys: 112, dia: 74, m: 4, e: 4, sym: [] },
  { s: 7400, sl: 7.2, q: 4, w: 1900, hr: 71, sys: 115, dia: 76, m: 4, e: 3, sym: [] },
  { s: 4100, sl: 5.5, q: 2, w: 1200, hr: 78, sys: 121, dia: 80, m: 2, e: 2, sym: ["pusing"] },
  { s: 3800, sl: 5.8, q: 2, w: 1300, hr: 77, sys: 119, dia: 79, m: 2, e: 2, sym: ["pegal"] },
  { s: 8800, sl: 8.1, q: 5, w: 2300, hr: 65, sys: 110, dia: 72, m: 5, e: 5, sym: [] },
  { s: 10200, sl: 7.6, q: 4, w: 2200, hr: 66, sys: 111, dia: 73, m: 4, e: 4, sym: [] },
  { s: 5200, sl: 6.2, q: 3, w: 1600, hr: 74, sys: 118, dia: 78, m: 3, e: 3, sym: [] },
  { s: 6500, sl: 6.8, q: 3, w: 1750, hr: 72, sys: 116, dia: 77, m: 3, e: 3, sym: ["mual ringan"] },
  { s: 9500, sl: 8.4, q: 5, w: 2400, hr: 64, sys: 108, dia: 70, m: 5, e: 5, sym: [] },
  { s: 8100, sl: 7.4, q: 4, w: 2000, hr: 69, sys: 113, dia: 75, m: 4, e: 4, sym: [] },
];

for (let i = 0; i < samples.length; i++) {
  const r = samples[i];
  const date = dateStr(-(samples.length - 1 - i));
  await db.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {},
    create: {
      userId: user.id,
      date,
      steps: r.s,
      sleepHours: r.sl,
      sleepQuality: r.q,
      waterMl: r.w,
      heartRate: r.hr,
      systolic: r.sys,
      diastolic: r.dia,
      mood: r.m,
      energy: r.e,
      symptoms: JSON.stringify(r.sym),
    },
  });
}

const key = new TextEncoder().encode(process.env.SESSION_SECRET);
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const jwt = await new SignJWT({ userId: user.id, expiresAt: expiresAt.toISOString() })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("7d")
  .sign(key);

console.log(jwt);
await db.$disconnect();
