"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addSteps } from "@/lib/actions/logs";

/**
 * Pedometer opsional memakai sensor accelerometer perangkat
 * (DeviceMotion). Terutama berfungsi di HP; desktop & perangkat
 * tanpa sensor tetap bisa input manual lewat halaman Catatan.
 */
export function StepSensor() {
  const [count, setCount] = useState(0);
  const [listening, setListening] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [pending, startTransition] = useTransition();

  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("DeviceMotionEvent" in window);
  }, []);

  const prevMag = useRef(0);
  const lastStep = useRef(0);

  useEffect(() => {
    if (!listening) return;

    function onMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
      const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

      const now = Date.now();
      // Deteksi puncak sederhana: lonjakan di atas ambang + jeda minimal 350ms
      if (mag - prevMag.current > 1.6 && now - lastStep.current > 350) {
        lastStep.current = now;
        setCount((c) => c + 1);
      }
      prevMag.current = mag;
    }

    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [listening]);

  async function toggle() {
    if (listening) {
      setListening(false);
      return;
    }
    // iOS 13+ minta izin eksplisit
    const anyDME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof anyDME.requestPermission === "function") {
      try {
        const result = await anyDME.requestPermission();
        if (result !== "granted") {
          setPermissionDenied(true);
          return;
        }
      } catch {
        setPermissionDenied(true);
        return;
      }
    }
    setPermissionDenied(false);
    setListening(true);
  }

  function sync() {
    const n = count;
    if (n <= 0) return;
    startTransition(async () => {
      await addSteps(n);
      setCount(0);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold">Sensor langkah</p>
          <p className="text-[12px] text-secondary">
            {supported
              ? listening
                ? "Menghitung langkah… letakkan HP di saku"
                : "Aktifkan accelerometer untuk hitung otomatis"
              : "Perangkat ini tak punya sensor, input manual di Catatan"}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={!supported}
          className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold ${
            listening ? "bg-ios-red text-white" : "bg-ios-blue text-white"
          } disabled:opacity-40`}
        >
          {listening ? "Berhenti" : "Mulai"}
        </button>
      </div>

      {listening ? (
        <div className="mt-3 flex items-center justify-between bg-fill rounded-2xl px-4 py-3">
          <div>
            <span className="text-2xl font-bold tabular-nums">{count}</span>
            <span className="text-[13px] text-secondary ml-1.5">langkah terdeteksi</span>
          </div>
          <button type="button" onClick={sync} disabled={pending || count === 0} className="btn-secondary disabled:opacity-40">
            {pending ? "Sinkron…" : "Sinkronkan"}
          </button>
        </div>
      ) : null}

      {permissionDenied ? (
        <p className="text-ios-red text-[13px] mt-2">
          Izin sensor ditolak. Kamu tetap bisa mencatat langkah secara manual di halaman Catatan.
        </p>
      ) : null}
    </div>
  );
}
