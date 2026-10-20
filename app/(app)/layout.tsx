import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { UserRow, UserRowFallback } from "@/components/UserRow";

/**
 * Layout semua halaman setelah login.
 * Membaca sesi (UserRow) di balik Suspense agar shell statis
 * (sidebar + navigasi) tetap ter-prerender · pola Cache Components.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      userSlot={
        <Suspense fallback={<UserRowFallback />}>
          <UserRow />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
