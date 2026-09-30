import Link from "next/link";
import { login } from "./actions";

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Logo Donasi" width={64} height={64} />
          <h1 className="mt-4 font-serif text-2xl text-neutral-900">Masuk ke Donasi</h1>
        </div>

        {searchParams.error && (
          <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        )}

        <form
          action={login}
          className="mt-5 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div>
            <label htmlFor="email" className="text-sm font-medium text-neutral-800">
              Alamat email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputCls}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-neutral-800">
                Kata sandi
              </label>
              <Link href="/lupa-sandi" className="text-xs text-brand underline">
                Lupa kata sandi?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark"
          >
            Masuk
          </button>
        </form>

        <p className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-4 text-center text-sm text-neutral-600">
          Baru di Donasi?{" "}
          <Link href="/register" className="text-brand underline">
            Buat akun
          </Link>
        </p>
      </div>
    </main>
  );
}
