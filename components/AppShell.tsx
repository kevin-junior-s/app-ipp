"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TabBar } from "@/components/TabBar";

/**
 * Shell responsif LangitTubuh.
 *
 * Logika mobile vs desktop murni lewat breakpoint CSS (lg = 1024px),
 * tanpa JS media query · tidak ada kedip saat hydrasi di SSR:
 *   < 1024px : kolom sempit terpusat + TabBar bawah
 *   ≥ 1024px : Sidebar tetap 240px + canvas lebar (maks. 1152px)
 *
 * Grid kanvas desktop: 12 kolom × 76px + 11 gutter 16px = 1088px
 * (1152px wrapper − 2×32px padding).
 */
export function AppShell({ userSlot, children }: { userSlot: ReactNode; children: ReactNode }) {
  return (
    <div className="flex-1 w-full">
      <Sidebar userSlot={userSlot} />
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-[1152px] px-4 sm:px-6 lg:px-8 pt-5 lg:pt-9 pb-28 lg:pb-16">
          {children}
        </main>
      </div>
      <TabBar />
    </div>
  );
}
