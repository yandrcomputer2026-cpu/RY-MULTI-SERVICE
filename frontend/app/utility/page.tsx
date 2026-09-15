import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UtilityPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-extrabold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <p className="text-xs font-medium text-gray-400">
              Utility Services
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ================= HERO ================= */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 p-7 text-white shadow">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
            RY MULTI SERVICE
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            ⚡ Utility Services
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
            Electricity, Mobile Postpaid और FASTag utility services को एक
            ही जगह से access करें।
          </p>
        </div>

        {/* ================= SERVICES ================= */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* ================= ELECTRICITY ================= */}
          <Link
            href="/service1/electricity"
            className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-4xl">⚡</div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Utility
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Electricity Bill Payment
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Electricity bill payment service।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Open Electricity →
            </p>
          </Link>

          {/* ================= MOBILE POSTPAID ================= */}
          <Link
            href="/service1/mobile-postpaid"
            className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-4xl">📱</div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Utility
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Mobile Postpaid Bill
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Mobile postpaid bill payment service।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Open Postpaid →
            </p>
          </Link>

          {/* ================= FASTAG ================= */}
          <Link
            href="/service1/fastag"
            className="group block rounded-2xl border border-amber-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-4xl">🚘</div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Setup Required
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              FASTag Recharge
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Authorized FASTag provider API integration के बाद live recharge
              service activate होगी।
            </p>

            <p className="mt-5 font-semibold text-amber-600">
              View Setup →
            </p>
          </Link>
        </div>

        {/* ================= FASTAG PROVIDER NOTICE ================= */}
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>

            <div>
              <h3 className="font-bold text-amber-900">
                FASTag Provider Integration Pending
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                FASTag के लिए authorized provider API अभी configured नहीं है।
                Provider activation होने तक FASTag page से कोई real recharge
                या payment process नहीं किया जाएगा।
              </p>
            </div>
          </div>
        </div>

        {/* ================= BACK ================= */}
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-900"
          >
            ← Dashboard पर वापस जाएँ
          </Link>
        </div>
      </div>
    </main>
  );
}