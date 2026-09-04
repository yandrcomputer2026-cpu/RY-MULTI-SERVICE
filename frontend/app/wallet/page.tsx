import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-blue-600"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            💰 Manage Wallet
          </h2>

          <p className="mt-2 text-gray-600">
            Wallet balance, Add Money और Bank Settlement manage करें।
          </p>
        </div>

        {/* INFO */}
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="font-semibold text-yellow-800">
            Wallet Setup Required
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            Wallet और settlement का secure backend अभी configure किया जाना है।
          </p>
        </div>

        {/* CARDS */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* WALLET */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">👛</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Wallet
            </h3>

            <p className="mt-2 text-gray-500">
              अपना wallet balance और wallet transactions देखें।
            </p>

            <p className="mt-5 font-semibold text-gray-400">
              Coming Soon
            </p>
          </div>

          {/* ADD MONEY */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">➕</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Add Money
            </h3>

            <p className="mt-2 text-gray-500">
              अपने RY Multi Service wallet में money add करें।
            </p>

            <p className="mt-5 font-semibold text-gray-400">
              Coming Soon
            </p>
          </div>

          {/* BANK SETTLEMENT */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">🏦</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Bank Settlement
            </h3>

            <p className="mt-2 text-gray-500">
              Wallet amount को registered bank account में settle करें।
            </p>

            <p className="mt-5 font-semibold text-gray-400">
              Coming Soon
            </p>
          </div>
        </div>

        {/* BACK */}
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white hover:bg-gray-900"
          >
            ← Dashboard पर वापस जाएँ
          </Link>
        </div>
      </div>
    </main>
  );
}