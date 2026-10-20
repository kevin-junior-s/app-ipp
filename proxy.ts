import { NextResponse, type NextRequest } from "next/server";
import { decrypt, COOKIE_NAME } from "@/lib/session";

const PROTECTED = ["/dashboard", "/catatan", "/riwayat", "/wawasan", "/profil"];
const PUBLIC = ["/login", "/register"];

function match(path: string, routes: string[]) {
  return routes.some((r) => path === r || path.startsWith(`${r}/`));
}

/**
 * Proxy Next.js 16 (pengganti middleware). Berjalan di runtime Node.js
 * sebelum request sampai ke halaman: cek sesi lalu redirect optimis.
 * Verifikasi sesi sebenarnya tetap terjadi di `getCurrentUser()`.
 */
export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const cookie = req.cookies.get(COOKIE_NAME)?.value;

  return decrypt(cookie).then((session) => {
    const authed = Boolean(session?.userId);

    if (path === "/") {
      return NextResponse.redirect(new URL(authed ? "/dashboard" : "/login", req.nextUrl));
    }

    if (match(path, PROTECTED) && !authed) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (match(path, PUBLIC) && authed) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|.*\\.(?:svg|png|jpg|jpeg|ico|webp)$).*)",
  ],
};
