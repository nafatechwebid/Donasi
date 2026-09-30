import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setNewPassword } from "./actions";

const inputCls =
  "mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default async function ResetSandiPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/lupa-sandi?error=" + encodeURIComponent("Tautan tidak valid. Silakan minta tautan baru."));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <img src="/logo.png" alt="Logo Donasi" width={64} height={64} />
          <h1 className="mt-4 font-serif text-2xl text-neutral-900">Atur kata sandi baru</h1>
        </div>

        {searchParams.error && (
          <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        )}

        <form
          action={setNewPassword}
          className="mt-5 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div>
            <label htmlFor="password" className="text-sm font-medium text-neutral-800">
              Kata sandi baru
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-neutral-500">Minimal 8 karakter.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="text-sm font-medium text-neutral-800">
              Ulangi kata sandi baru
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark"
          >
            Simpan kata sandi
          </button>
        </form>
      </div>
    </main>
  );
}
