import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BankSettlementPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const wallet = await prisma.wallet.upsert({
    where: {
      userId: user.id,
    },

    update: {},

    create: {
      userId: user.id,
      availableBalance: 0,
      lockedBalance: 0,
      status: "ACTIVE",
    },
  });

  const availableBalance = Number(wallet.availableBalance);
  const lockedBalance = Number(wallet.lockedBalance);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <Link
            href="/wallet"
            className="text-gray-600 hover:text-blue-600"
          >
            Wallet
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            🏦 Bank Settlement
          </h2>

          <p className="mt-2 text-gray-600">
            Wallet balance को verified bank account में settle करने की सुविधा।
          </p>
        </div>

        {/* WALLET SUMMARY */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-gray-500">
              Available Balance
            </p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              ₹
              {availableBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-gray-500">
              Locked Balance
            </p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              ₹
              {lockedBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>

        {/* SETUP NOTICE */}
        <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
          <h3 className="text-xl font-bold text-yellow-800">
            Settlement Setup Required
          </h3>

          <p className="mt-2 text-sm text-yellow-700">
            Bank Settlement enable करने से पहले verified payout provider,
            bank-account verification, KYC और secure settlement backend
            configure करना जरूरी है।
          </p>
        </div>

        {/* SETTLEMENT CARD */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <div className="text-4xl">🏦</div>

          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Bank Settlement
          </h3>

          <p className="mt-2 text-gray-500">
            Settlement provider configure होने के बाद यहाँ verified bank
            account और settlement amount select किया जा सकेगा।
          </p>

          <button
            type="button"
            disabled
            className="mt-6 cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-600"
          >
            Settlement Not Available Yet
          </button>
        </div>

        {/* SECURITY */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="font-semibold text-blue-800">
            🔒 Settlement Security
          </p>

          <p className="mt-2 text-sm text-blue-700">
            Bank verification और payout confirmation के बिना wallet balance
            debit या settlement successful नहीं माना जाएगा।
          </p>
        </div>

        {/* BACK */}
        <div className="mt-10">
          <Link
            href="/wallet"
            className="inline-block rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white hover:bg-gray-900"
          >
            ← Wallet पर वापस जाएँ
          </Link>
        </div>
      </div>
    </main>
  );
}