import { redirect } from "next/navigation";

/**
 * Halaman root hanya pengalih. Proxy (`proxy.ts` di root) sudah
 * menangani `/` lebih dulu dan mengarahkan sesuai status login,
 * jadi redirect di sini hanya lapis pengaman bila proxy tak jalan.
 *
 * Validasi `instant` tidak bisa merender segmen yang langsung
 * melempar `redirect()`, jadi divalidasi dimatikan untuk rute ini.
 * (Lihat: docs instant-navigation · `export const instant = false`.)
 */
export const instant = false;

export default function Home() {
  redirect("/dashboard");
}
