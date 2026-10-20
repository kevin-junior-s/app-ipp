"use client";

import { useEffect, useRef, useState } from "react";

type Cfg = { intervalMin: number };

const STORE_KEY = "lt-water-reminder";
const FROM_HOUR = 8; // pengingat hanya 08.00–21.00
const TO_HOUR = 21;

/**
 * Pengingat minum air lewat Notification API.
 * Interval bisa dipilih, tersimpan di localStorage; pengingat hanya
 * berbunyi 08.00–21.00 dan selama tab aplikasi terbuka · batasan
 * disebut apa adanya di UI.
 */
export function WaterReminder() {
  const [enabled, setEnabled] = useState(false);
  const [intervalMin, setIntervalMin] = useState(60);
  const [nextAt, setNextAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [supported, setSupported] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Muat pengaturan tersimpan
  useEffect(() => {
    setMounted(true);
    setSupported("Notification" in window);
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { enabled: boolean; intervalMin?: number };
        if (saved.intervalMin === 30 || saved.intervalMin === 60 || saved.intervalMin === 90) {
          setIntervalMin(saved.intervalMin);
        }
        if (saved.enabled && "Notification" in window && Notification.permission === "granted") {
          setEnabled(true);
        }
      }
    } catch {
      /* pengaturan rusak diabaikan */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const ms = intervalMin * 60 * 1000;

    function nextWake(now: Date): Date {
      const t = new Date(now.getTime() + ms);
      if (t.getHours() >= TO_HOUR) {
        // lompat ke jam mulai besok
        const besok = new Date(t);
        besok.setDate(besok.getDate() + 1);
        besok.setHours(FROM_HOUR, 0, 0, 0);
        return besok;
      }
      if (t.getHours() < FROM_HOUR) {
        const ini = new Date(t);
        ini.setHours(FROM_HOUR, 0, 0, 0);
        return ini;
      }
      return t;
    }

    function fire() {
      try {
        if (Notification.permission === "granted") {
          new Notification("Waktunya minum air", {
            body: "Sedikit saja, tubuhmu berterima kasih. Angkat gelasmu!",
            icon: "/icon.svg",
          });
        }
      } catch {
        /* notifikasi bisa gagal di beberapa lingkungan; abaikan */
      }
      const nxt = nextWake(new Date());
      setNextAt(nxt);
      timer.current = setTimeout(fire, nxt.getTime() - Date.now());
    }

    const first = nextWake(new Date());
    setNextAt(first);
    timer.current = setTimeout(fire, first.getTime() - Date.now());

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, intervalMin]);

  async function toggle() {
    if (enabled) {
      setEnabled(false);
      setNextAt(null);
      localStorage.setItem(STORE_KEY, JSON.stringify({ enabled: false, intervalMin }));
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    setIntervalMin((v) => {
      localStorage.setItem(STORE_KEY, JSON.stringify({ enabled: true, intervalMin: v }));
      return v;
    });
    setEnabled(true);
  }

  function changeInterval(v: number) {
    setIntervalMin(v);
    localStorage.setItem(STORE_KEY, JSON.stringify({ enabled, intervalMin: v }));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">Pengingat minum</p>
          <p className="text-[12px] text-secondary leading-snug">
            {/* Dukungan notifikasi diketahui setelah mount, agar server & klien sama */}
            {!mounted
              ? `Pengingat tiap ${intervalMin} menit, 08.00-21.00`
              : !supported
                ? "Notifikasi tidak didukung peramban ini"
                : enabled && nextAt
                  ? `Berikutnya sekitar ${nextAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}, 08.00-21.00 (selama tab terbuka)`
                  : `Pengingat tiap ${intervalMin} menit, 08.00-21.00`}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={!supported}
          aria-pressed={enabled}
          className={`shrink-0 rounded-[10px] px-4 h-9 text-[13px] font-semibold transition-colors disabled:opacity-40 ${
            enabled ? "bg-ios-blue text-white" : "bg-fill text-label hover:bg-active"
          }`}
        >
          {enabled ? "Aktif" : "Aktifkan"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[13px]">
        <label htmlFor="water-interval" className="text-secondary">
          Interval
        </label>
        <select
          id="water-interval"
          value={intervalMin}
          onChange={(e) => changeInterval(Number(e.target.value))}
          className="input-ios w-auto h-8 min-h-0 py-1 text-[13px]"
        >
          <option value={30}>30 menit</option>
          <option value={60}>60 menit</option>
          <option value={90}>90 menit</option>
        </select>
      </div>
    </div>
  );
}
