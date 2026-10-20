"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActivePath, NavItemLink } from "@/components/nav-items";

/** Mark LangitTubuh · matahari di balik awan, digambar untuk produk ini. */
export function LangitMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8.5" r="3.6" fill="var(--blue)" />
      <path
        d="M9.5 17.5a3.7 3.7 0 0 1-.4-7.4 4.8 4.8 0 0 1 9.2-.9 3.3 3.3 0 0 1 .4 6.5l-.2.1H9.5z"
        fill="var(--blue)"
        opacity="0.55"
      />
      <path
        d="M9.5 17.5a3.7 3.7 0 0 1-.4-7.4 4.8 4.8 0 0 1 9.2-.9 3.3 3.3 0 0 1 .4 6.5l-.2.1H9.5z"
        stroke="var(--blue)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const GROUPS = ["Harian", "Analisis"] as const;

/**
 * Sidebar desktop (≥1024px). Di mobile disembunyikan · TabBar yang bekerja.
 * `userSlot` diisi layout server (berisi baris user + keluar di balik Suspense).
 */
export function Sidebar({ userSlot }: { userSlot: ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-separator bg-background">
      {/* Nama produk */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-6 pt-7 pb-6">
        <LangitMark />
        <span className="text-[15px] font-semibold tracking-tight">LangitTubuh</span>
      </Link>

      {/* Navigasi utama, per grup kalimat, pitch 34px */}
      <nav className="flex-1 overflow-y-auto no-scrollbar">
        {GROUPS.map((group) => (
          <div key={group} className="mb-5">
            <p className="px-6 text-[12px] text-secondary mb-2">{group}</p>
            {NAV_ITEMS.filter((i) => i.group === group).map((item) => (
              <NavItemLink
                key={item.href}
                item={item}
                active={isActivePath(pathname, item.href)}
                variant="sidebar"
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Baris user (stream dari server) */}
      {userSlot}
    </aside>
  );
}
