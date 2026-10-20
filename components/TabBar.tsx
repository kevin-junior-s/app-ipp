"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActivePath, NavItemLink } from "@/components/nav-items";

/**
 * Navigasi mobile (<1024px): bar bawah melayang, lima tujuan.
 * Di desktop disembunyikan · Sidebar yang bekerja (lihat AppShell).
 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto rounded-full px-2 py-1.5 mx-4 mb-3 flex items-center gap-1 safe-bottom max-w-md w-full border border-separator bg-surface"
        style={{ boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItemLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
            variant="tab"
          />
        ))}
      </div>
    </nav>
  );
}
