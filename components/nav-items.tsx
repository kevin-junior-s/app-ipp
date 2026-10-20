import Link from "next/link";
import { usePathname } from "next/navigation";

/** Ikon outline 16px, stroke 1.5 · satu set, abu, mengikuti teks. */
const ICON = {
  className: "w-4 h-4 shrink-0",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function BerandaIcon() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <circle cx="8" cy="8" r="3.2" />
      <line x1="8" y1="1.8" x2="8" y2="3.2" />
      <line x1="1.8" y1="8" x2="3.2" y2="8" />
      <line x1="3.7" y1="3.7" x2="4.7" y2="4.7" />
      <line x1="11.3" y1="4.7" x2="12.3" y2="3.7" />
      <path d="M19 13a4.5 4.5 0 0 0-4.2 3A3.4 3.4 0 0 0 15.4 22H21a3 3 0 0 0 0-6 4.4 4.4 0 0 0-2-3z" />
    </svg>
  );
}

function CatatanIcon() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function RiwayatIcon() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-5 3.5 3.5L21 6" />
    </svg>
  );
}

function WawasanIcon() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1.1 1 1.7l.1.5h5l.1-.5c.1-.6.4-1.2 1-1.7A6 6 0 0 0 12 3z" />
    </svg>
  );
}

function ProfilIcon() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  );
}

export type NavItem = {
  href: string;
  label: string;
  group: "Harian" | "Analisis" | "Akun";
  icon: () => React.JSX.Element;
};

/** Sumber kebenaran item navigasi · dipakai Sidebar (desktop) & TabBar (mobile). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", group: "Harian", icon: BerandaIcon },
  { href: "/catatan", label: "Catatan", group: "Harian", icon: CatatanIcon },
  { href: "/riwayat", label: "Riwayat", group: "Analisis", icon: RiwayatIcon },
  { href: "/wawasan", label: "Wawasan", group: "Analisis", icon: WawasanIcon },
  { href: "/profil", label: "Profil", group: "Akun", icon: ProfilIcon },
];

export function useActivePath() {
  const pathname = usePathname();
  return pathname;
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Baris nav (dipakai Sidebar & TabBar) dengan status aktif gaya editorial: pill netral. */
export function NavItemLink({
  item,
  active,
  variant,
}: {
  item: NavItem;
  active: boolean;
  variant: "sidebar" | "tab";
}) {
  const Icon = item.icon;

  if (variant === "tab") {
    return (
      <Link
        href={item.href}
        className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
          active ? "text-label" : "text-secondary"
        }`}
        aria-current={active ? "page" : undefined}
      >
        <Icon />
        <span className={`text-[11px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 mx-2.5 px-2.5 rounded-[10px] text-[14px] transition-colors ${
        active ? "bg-active text-label font-medium" : "text-secondary hover:bg-fill hover:text-label"
      }`}
      style={{ height: 34 }}
      aria-current={active ? "page" : undefined}
    >
      <Icon />
      {item.label}
    </Link>
  );
}
