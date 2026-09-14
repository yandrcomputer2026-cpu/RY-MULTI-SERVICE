import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BankingPage() {
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
              Banking Services
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
        {/* ================= PAGE HEADING ================= */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-green-500 p-7 text-white shadow">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-100">
            RY MULTI SERVICE
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            🏦 Banking Services
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-green-50">
            AEPS, Money Transfer और UPI Cash services के लिए
            provider-ready banking section।
          </p>
        </div>

        {/* ================= SETUP NOTICE ================= */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>

            <div>
              <h3 className="font-bold text-amber-900">
                Banking Provider Setup Required
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                AEPS, Money Transfer और UPI Cash के लिए authorized banking
                provider API integration आवश्यक है। Provider activation होने
                तक कोई real banking transaction process नहीं किया जाएगा।
              </p>
            </div>
          </div>
        </div>

        {/* ================= AEPS ================= */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Aadhaar Enabled Payment System
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Authorized AEPS provider integration required.
            </p>
          </div>

          <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-700">
            SETUP REQUIRED
          </span>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Cash Withdrawal */}
          <Link
            href="/service2/aeps/withdraw"
            className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">💵</div>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                Setup
              </span>
            </div>

            <h4 className="mt-4 text-lg font-bold text-gray-900">
              Cash Withdrawal
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Aadhaar authentication के माध्यम से cash withdrawal service।
            </p>

            <p className="mt-5 text-sm font-bold text-emerald-600">
              View Setup →
            </p>
          </Link>

          {/* Balance */}
          <Link
            href="/service2/aeps/balance"
            className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">💳</div>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                Setup
              </span>
            </div>

            <h4 className="mt-4 text-lg font-bold text-gray-900">
              Balance Enquiry
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              AEPS provider के माध्यम से bank account balance enquiry।
            </p>

            <p className="mt-5 text-sm font-bold text-emerald-600">
              View Setup →
            </p>
          </Link>

          {/* Mini Statement */}
          <Link
            href="/service2/aeps/mini-statement"
            className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">📄</div>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                Setup
              </span>
            </div>

            <h4 className="mt-4 text-lg font-bold text-gray-900">
              Mini Statement
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Customer के recent bank transactions देखने की AEPS service।
            </p>

            <p className="mt-5 text-sm font-bold text-emerald-600">
              View Setup →
            </p>
          </Link>

          {/* Cash Deposit */}
          <Link
            href="/service2/aeps/deposit"
            className="group block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">💰</div>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                Setup
              </span>
            </div>

            <h4 className="mt-4 text-lg font-bold text-gray-900">
              Cash Deposit
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Supported provider उपलब्ध होने पर AEPS cash deposit service।
            </p>

            <p className="mt-5 text-sm font-bold text-emerald-600">
              View Setup →
            </p>
          </Link>
        </div>

        {/* ================= OTHER BANKING ================= */}
        <div className="mt-12">
          <h3 className="text-2xl font-extrabold text-slate-900">
            Other Banking Services
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Money Transfer और UPI-based assisted services।
          </p>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {/* Money Transfer */}
          <Link
            href="/service2/money-transfer"
            className="block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">💸</div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                Provider Required
              </span>
            </div>

            <h4 className="mt-4 text-xl font-bold text-gray-900">
              Money Transfer
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              DMT provider integration के बाद bank account money transfer
              service activate होगी।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              View Setup →
            </p>
          </Link>

          {/* UPI Cash */}
          <Link
            href="/service2/upi-cash"
            className="block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">📲</div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                Verification Required
              </span>
            </div>

            <h4 className="mt-4 text-xl font-bold text-gray-900">
              UPI Cash
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              QR generation केवल payment request है। Real payment confirmation
              provider verification के बाद ही valid मानी जाएगी।
            </p>

            <p className="mt-5 font-semibold text-purple-600">
              View Setup →
            </p>
          </Link>
        </div>

        {/* ================= PROVIDER STATUS ================= */}
        <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Banking Integration Status
          </h3>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700">
                AEPS Provider
              </span>

              <span className="font-bold text-amber-600">
                Pending
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700">
                DMT / Money Transfer Provider
              </span>

              <span className="font-bold text-amber-600">
                Pending
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">
                UPI Payment Verification
              </span>

              <span className="font-bold text-amber-600">
                Pending
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