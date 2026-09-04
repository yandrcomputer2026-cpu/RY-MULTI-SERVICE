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
    <main className="min-h-screen bg-gray-100">
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

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            🏦 Banking Service
          </h2>

          <p className="mt-2 text-gray-600">
            AEPS, Money Transfer और UPI Cash services।
          </p>
        </div>

        {/* ================= AEPS ================= */}
        <h3 className="mt-8 text-2xl font-bold text-gray-900">
          Aadhaar Enabled Payment System (AEPS)
        </h3>

        <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/service2/aeps/withdraw"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">💵</div>

            <h4 className="mt-4 text-xl font-bold text-gray-900">
              Cash Withdrawal
            </h4>

            <p className="mt-2 text-gray-500">
              AEPS के माध्यम से cash withdrawal।
            </p>

            <p className="mt-5 font-semibold text-green-600">
              Withdraw →
            </p>
          </Link>

          <Link
            href="/service2/aeps/balance"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">💳</div>

            <h4 className="mt-4 text-xl font-bold text-gray-900">
              Balance Enquiry
            </h4>

            <p className="mt-2 text-gray-500">
              Bank account balance check करें।
            </p>

            <p className="mt-5 font-semibold text-green-600">
              Check Balance →
            </p>
          </Link>

          <Link
            href="/service2/aeps/mini-statement"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">📄</div>

            <h4 className="mt-4 text-xl font-bold text-gray-900">
              Mini Statement
            </h4>

            <p className="mt-2 text-gray-500">
              Last bank transactions देखें।
            </p>

            <p className="mt-5 font-semibold text-green-600">
              View Statement →
            </p>
          </Link>

          <Link
            href="/service2/aeps/deposit"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">💰</div>

            <h4 className="mt-4 text-xl font-bold text-gray-900">
              Cash Deposit
            </h4>

            <p className="mt-2 text-gray-500">
              AEPS Cash Deposit service।
            </p>

            <p className="mt-5 font-semibold text-green-600">
              Deposit →
            </p>
          </Link>
        </div>

        {/* ================= OTHER BANKING ================= */}
        <h3 className="mt-10 text-2xl font-bold text-gray-900">
          Other Banking Services
        </h3>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <Link
            href="/service2/money-transfer"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">💸</div>

            <h4 className="mt-4 text-xl font-bold text-gray-900">
              Money Transfer
            </h4>

            <p className="mt-2 text-gray-500">
              Bank account में money transfer करें।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Money Transfer →
            </p>
          </Link>

          <Link
            href="/service2/upi-cash"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">📲</div>

            <h4 className="mt-4 text-xl font-bold text-gray-900">
              UPI Cash
            </h4>

            <p className="mt-2 text-gray-500">
              QR Code generate करके UPI payment करें।
            </p>

            <p className="mt-5 font-semibold text-purple-600">
              Open UPI Cash →
            </p>
          </Link>
        </div>

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