import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RechargePage() {
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
              Recharge Services
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
        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-500 p-7 text-white shadow">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
            RY MULTI SERVICE
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            📱 Recharge Services
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
            Mobile Prepaid और DTH recharge services के लिए provider-ready
            section।
          </p>
        </div>

        {/* ================= PROVIDER NOTICE ================= */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>

            <div>
              <h3 className="font-bold text-amber-900">
                Live Recharge Provider Setup Required
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Current recharge flows testing/development के लिए तैयार हैं।
                Authorized live recharge / BBPS provider integration complete
                होने तक इन्हें live operator recharge service नहीं माना जाना
                चाहिए।
              </p>
            </div>
          </div>
        </div>

        {/* ================= SERVICE CARDS ================= */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* MOBILE PREPAID */}
          <Link
            href="/service1/mobile-prepaid"
            className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-4xl">📱</div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Test Mode
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Mobile Prepaid Recharge
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Mobile prepaid recharge flow। Live operator processing के लिए
              authorized provider integration required है।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Open Recharge →
            </p>
          </Link>

          {/* DTH */}
          <Link
            href="/service1/dth"
            className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-4xl">📺</div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Test Mode
              </span>
            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              DTH Recharge
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              DTH recharge flow। Live DTH processing के लिए authorized
              provider integration required है।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Open DTH →
            </p>
          </Link>
        </div>

        {/* ================= INTEGRATION STATUS ================= */}
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Recharge Integration Status
          </h3>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700">
                Mobile Prepaid Provider
              </span>

              <span className="font-bold text-amber-600">
                Test / Provider Pending
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">
                DTH Provider
              </span>

              <span className="font-bold text-amber-600">
                Test / Provider Pending
              </span>
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