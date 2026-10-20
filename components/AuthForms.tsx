"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/lib/actions/auth";

function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-ios-red text-[13px] mt-1.5">{children}</p>;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-[13px] font-semibold text-secondary uppercase tracking-wide">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="nama@email.com" className="input-ios mt-1.5" />
        <ErrorText>{state?.errors?.email?.[0]}</ErrorText>
      </div>
      <div>
        <label htmlFor="password" className="text-[13px] font-semibold text-secondary uppercase tracking-wide">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className="input-ios mt-1.5" />
        <ErrorText>{state?.errors?.password?.[0]}</ErrorText>
      </div>
      {state?.message ? <ErrorText>{state.message}</ErrorText> : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Masuk…" : "Masuk"}
      </button>
      <p className="text-center text-[15px] text-secondary">
        Belum punya akun?{" "}
        <Link href="/register" className="text-accent font-semibold">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-[13px] font-semibold text-secondary uppercase tracking-wide">
          Nama
        </label>
        <input id="name" name="name" required placeholder="Nama panggilan" className="input-ios mt-1.5" />
        <ErrorText>{state?.errors?.name?.[0]}</ErrorText>
      </div>
      <div>
        <label htmlFor="email" className="text-[13px] font-semibold text-secondary uppercase tracking-wide">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="nama@email.com" className="input-ios mt-1.5" />
        <ErrorText>{state?.errors?.email?.[0]}</ErrorText>
      </div>
      <div>
        <label htmlFor="password" className="text-[13px] font-semibold text-secondary uppercase tracking-wide">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Minimal 8 karakter, ada huruf & angka" className="input-ios mt-1.5" />
        {state?.errors?.password ? (
          <ul className="text-ios-red text-[13px] mt-1.5 space-y-0.5">
            {state.errors.password.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Mendaftarkan…" : "Buat Akun"}
      </button>
      <p className="text-center text-[15px] text-secondary">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-accent font-semibold">
          Masuk
        </Link>
      </p>
    </form>
  );
}
