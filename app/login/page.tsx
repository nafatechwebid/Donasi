import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-2xl text-brand-dark">Masuk</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Masuk untuk melihat riwayat donasi Anda.
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={login} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-sm text-neutral-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-neutral-700">Kata Sandi</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-md bg-brand px-4 py-2 text-white transition hover:bg-brand-dark"
        >
          Masuk
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        Belum punya akun? <a href="/register" className="text-brand underline">Daftar</a>
      </p>
    </main>
  );
}
