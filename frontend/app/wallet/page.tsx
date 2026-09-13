import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // ======================================================
  // GET OR CREATE USER WALLET
  // ======================================================

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

  // ======================================================
  // RECENT WALLET TRANSACTIONS
  // ======================================================

  const transactions = await prisma.walletTransaction.findMany({
    where: {
      userId: user.id,
      walletId: wallet.id,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 10,
  });

  const availableBalance = Number(wallet.availableBalance);
  const lockedBalance = Number(wallet.lockedBalance);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/account"
              className="text-gray-600 hover:text-blue-600"
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* TITLE */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            💰 Manage Wallet
          </h2>

          <p className="mt-2 text-gray-600">
            अपना wallet balance और wallet transaction history देखें।
          </p>
        </div>

        {/* WALLET STATUS */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">
            Wallet Status:
          </span>

          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              wallet.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : wallet.status === "BLOCKED"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {wallet.status}
          </span>
        </div>

        {/* BALANCE CARDS */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* AVAILABLE BALANCE */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">👛</div>

            <p className="mt-4 text-sm font-semibold text-gray-500">
              Available Balance
            </p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              ₹
              {availableBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>

            <p className="mt-3 text-sm text-gray-500">
              Services और future wallet payments के लिए usable balance।
            </p>
          </div>

          {/* LOCKED BALANCE */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">🔒</div>

            <p className="mt-4 text-sm font-semibold text-gray-500">
              Locked Balance
            </p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              ₹
              {lockedBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>

            <p className="mt-3 text-sm text-gray-500">
              Processing या settlement के दौरान temporarily locked amount।
            </p>
          </div>

          {/* TOTAL BALANCE */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">💰</div>

            <p className="mt-4 text-sm font-semibold text-gray-500">
              Total Wallet Balance
            </p>

            <h3 className="mt-2 text-3xl font-bold text-gray-900">
              ₹
              {(availableBalance + lockedBalance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>

            <p className="mt-3 text-sm text-gray-500">
              Available और locked balance का total।
            </p>
          </div>
        </div>

        {/* ACTION CARDS */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
{/* ADD MONEY */}
<div className="rounded-xl bg-white p-6 shadow">
  <div className="text-4xl">➕</div>

  <h3 className="mt-4 text-xl font-bold text-gray-900">
    Add Money
  </h3>

  <p className="mt-2 text-gray-500">
    Razorpay verification के बाद wallet में money credit की जाएगी।
  </p>

  <Link
    href="/wallet/add-money"
    className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
  >
    ➕ Add Money
  </Link>
</div>

          {/* BANK SETTLEMENT */}
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">🏦</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Bank Settlement
            </h3>

            <p className="mt-2 text-gray-500">
              Wallet amount को verified bank account में settle करने की सुविधा।
            </p>

<Link
  href="/wallet/bank-settlement"
  className="mt-5 inline-block rounded-lg bg-gray-800 px-5 py-2.5 font-semibold text-white hover:bg-gray-900"
>
  🏦 Bank Settlement
</Link>
          </div>
        </div>

        {/* WALLET TRANSACTIONS */}
        <div className="mt-10 rounded-xl bg-white p-6 shadow">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Wallet Transactions
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Recent wallet credit, debit और settlement entries।
              </p>
            </div>

            <span className="text-sm text-gray-500">
              Last {transactions.length} entries
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <div className="text-4xl">📄</div>

              <h4 className="mt-3 font-bold text-gray-900">
                अभी कोई Wallet Transaction नहीं है
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Wallet credit या debit होने के बाद history यहाँ दिखाई देगी।
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-3 py-3">Transaction ID</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Source</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Balance</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b text-sm last:border-b-0"
                    >
                      <td className="px-3 py-4 font-medium text-gray-900">
                        {transaction.transactionId}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.type === "CREDIT" ||
                            transaction.type === "REFUND" ||
                            transaction.type === "RELEASE"
                              ? "bg-green-100 text-green-700"
                              : transaction.type === "DEBIT" ||
                                  transaction.type === "HOLD"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        {transaction.source.replaceAll("_", " ")}
                      </td>

                      <td className="px-3 py-4 font-semibold text-gray-900">
                        ₹
                        {Number(transaction.amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-3 py-4 text-gray-600">
                        ₹
                        {Number(transaction.balanceAfter).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td className="px-3 py-4">
                        {transaction.status}
                      </td>

                      <td className="px-3 py-4 text-gray-500">
                        {transaction.createdAt.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SAFETY NOTICE */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="font-semibold text-blue-800">
            Wallet Security
          </p>

          <p className="mt-1 text-sm text-blue-700">
            Wallet balance server-side database से load होता है। Add Money और
            Bank Settlement को payment verification के बिना successful नहीं
            माना जाएगा।
          </p>
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