import Link from "next/link";
import { requestReset } from "./actions";

export default function LupaSandiPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <img src="/logo.png" alt="Logo Donasi" width={64} height={64} />
          <h1 className="mt-4 font-serif text-2xl text-neutral-900">Lupa kata sandi</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Masukkan email akun Anda. Kami kirimkan tautan untuk mengatur kata sandi baru.
          </p>
        </div>

        {searchParams.error && (
          <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        )}
        {searchParams.ok && (
          <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Jika email terdaftar, tautan reset sudah dikirim. Cek kotak masuk dan folder Spam.
          </p>
        )}

        <form
          action={requestReset}
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
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark"
          >
            Kirim tautan reset
          </button>
        </form>

        <p className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-4 text-center text-sm text-neutral-600">
          Ingat kata sandi?{" "}
          <Link href="/login" className="text-brand underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
