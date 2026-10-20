import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

/** Baris user di kaki sidebar: avatar inisial, nama, email, tombol keluar. */
export async function UserRow() {
  const user = await getCurrentUser();

  return (
    <div className="border-t border-separator p-3">
      <div className="flex items-center gap-1">
        <Link
          href="/profil"
          className="flex items-center gap-2.5 flex-1 min-w-0 rounded-[10px] px-2 py-2 hover:bg-fill transition-colors"
        >
          <span
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-semibold"
            style={{ background: "rgba(0,122,255,0.14)", color: "var(--blue)" }}
            aria-hidden
          >
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-medium leading-tight truncate">{user.name}</span>
            <span className="block text-[12px] text-tertiary leading-tight truncate">{user.email}</span>
          </span>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            title="Keluar"
            aria-label="Keluar"
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-tertiary hover:bg-fill hover:text-label transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

/** Skeleton baris user untuk batas Suspense (ukuran nyata, tanpa shimmer). */
export function UserRowFallback() {
  return (
    <div className="border-t border-separator p-3">
      <div className="flex items-center gap-2.5 px-2 py-2">
        <span className="w-8 h-8 rounded-full bg-fill" />
        <span className="flex-1 space-y-1.5">
          <span className="block h-3.5 w-24 rounded bg-fill" />
          <span className="block h-3 w-32 rounded bg-fill" />
        </span>
      </div>
    </div>
  );
}
