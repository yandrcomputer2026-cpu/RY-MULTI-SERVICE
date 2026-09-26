import Link from "next/link";
import { redirect } from "next/navigation";

import BrandLogo from "@/components/BrandLogo";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
  // =====================================================
  // ADMIN SECURITY
  // =====================================================

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // =====================================================
  // SERVICE TRANSACTIONS
  // =====================================================

  const serviceTransactions = await prisma.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  // =====================================================
  // WALLET TRANSACTIONS
  // =====================================================

  const walletTransactions =
    await prisma.walletTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 100,

      include: {
        user: {
          select: {
            id: true,
            userCode: true,
            name: true,
            mobile: true,
            role: true,
          },
        },
      },
    });

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalServiceTransactions =
    serviceTransactions.length;

  const successfulServiceTransactions =
    serviceTransactions.filter((item) =>
      isSuccessStatus(item.status)
    ).length;

  const pendingServiceTransactions =
    serviceTransactions.filter((item) =>
      isPendingStatus(item.status)
    ).length;

  const failedServiceTransactions =
    serviceTransactions.filter((item) =>
      isFailedStatus(item.status)
    ).length;

  const totalWalletTransactions =
    walletTransactions.length;

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo
            href="/admin"
            admin
          />

          <Link
            href="/admin"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* TITLE */}

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            📋 Transaction Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Service और wallet transactions को एक जगह
            monitor करें।
          </p>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            title="Service Transactions"
            value={totalServiceTransactions}
            icon="📋"
          />

          <SummaryCard
            title="Successful"
            value={successfulServiceTransactions}
            icon="✅"
          />

          <SummaryCard
            title="Pending"
            value={pendingServiceTransactions}
            icon="⏳"
          />

          <SummaryCard
            title="Failed"
            value={failedServiceTransactions}
            icon="❌"
          />

          <SummaryCard
            title="Wallet Transactions"
            value={totalWalletTransactions}
            icon="👛"
          />
        </div>

        {/* =================================================
            SERVICE TRANSACTIONS
        ================================================= */}

        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-black text-slate-900">
                Service Transactions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Recharge और अन्य service transactions
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
              {serviceTransactions.length} RECORDS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">
                    Transaction
                  </th>

                  <th className="px-5 py-3">
                    User
                  </th>

                  <th className="px-5 py-3">
                    Service
                  </th>

                  <th className="px-5 py-3">
                    Amount
                  </th>

                  <th className="px-5 py-3">
                    Provider
                  </th>

                  <th className="px-5 py-3">
                    Reference
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {serviceTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      अभी कोई service transaction नहीं है।
                    </td>
                  </tr>
                ) : (
                  serviceTransactions.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="max-w-[190px] truncate text-xs font-black text-slate-900">
                          {item.transactionId}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          ID #{item.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-700">
                          USER-{item.userId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-slate-700">
                          {formatText(item.service)}
                        </p>

                        {item.category && (
                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatText(item.category)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-slate-900">
                          {formatMoney(
                            Number(item.amount)
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-700">
                          {item.provider || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[160px] truncate text-xs text-slate-600">
                          {item.referenceId || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={item.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-700">
                          {formatDate(item.createdAt)}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================
            WALLET TRANSACTIONS
        ================================================= */}

        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-black text-slate-900">
                Wallet Transactions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Credit, Debit, Refund और wallet activity
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
              {walletTransactions.length} RECORDS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">
                    Transaction
                  </th>

                  <th className="px-5 py-3">
                    User
                  </th>

                  <th className="px-5 py-3">
                    Type
                  </th>

                  <th className="px-5 py-3">
                    Source
                  </th>

                  <th className="px-5 py-3">
                    Amount
                  </th>

                  <th className="px-5 py-3">
                    Before
                  </th>

                  <th className="px-5 py-3">
                    After
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {walletTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      अभी कोई wallet transaction नहीं है।
                    </td>
                  </tr>
                ) : (
                  walletTransactions.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="max-w-[180px] truncate text-xs font-black text-slate-900">
                          {item.transactionId}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          ID #{item.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${item.user.id}`}
                          className="text-xs font-black text-slate-900 hover:text-blue-600"
                        >
                          {item.user.name}
                        </Link>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.user.userCode ||
                            `USER-${item.user.id}`}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <TransactionTypeBadge
                          type={item.type}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-600">
                          {formatText(item.source)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className={`text-sm font-black ${
                            item.type === "CREDIT" ||
                            item.type === "REFUND" ||
                            item.type === "RELEASE"
                              ? "text-emerald-600"
                              : item.type === "DEBIT" ||
                                  item.type === "HOLD"
                                ? "text-red-600"
                                : "text-slate-900"
                          }`}
                        >
                          {formatMoney(
                            Number(item.amount)
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-600">
                          {formatMoney(
                            Number(
                              item.balanceBefore
                            )
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-slate-900">
                          {formatMoney(
                            Number(
                              item.balanceAfter
                            )
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={item.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-700">
                          {formatDate(item.createdAt)}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECURITY NOTE */}

        <div className="mt-7 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <p className="font-black text-amber-900">
            🔒 Transaction Security
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-700">
            यह page transaction monitoring के लिए है।
            Transaction status या wallet balance को इस
            page से manually modify नहीं किया जाता।
          </p>
        </div>
      </section>
    </main>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (isSuccessStatus(status)) {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
        ● {formatText(status)}
      </span>
    );
  }

  if (isFailedStatus(status)) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-700">
        ● {formatText(status)}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700">
      ● {formatText(status)}
    </span>
  );
}

// =====================================================
// TRANSACTION TYPE BADGE
// =====================================================

function TransactionTypeBadge({
  type,
}: {
  type: string;
}) {
  if (
    type === "CREDIT" ||
    type === "REFUND" ||
    type === "RELEASE"
  ) {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
        {formatText(type)}
      </span>
    );
  }

  if (
    type === "DEBIT" ||
    type === "HOLD"
  ) {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-700">
        {formatText(type)}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
      {formatText(type)}
    </span>
  );
}

// =====================================================
// STATUS HELPERS
// =====================================================

function isSuccessStatus(status: string) {
  const value = status.toUpperCase();

  return (
    value === "SUCCESS" ||
    value === "COMPLETED" ||
    value === "RECHARGE_SUCCESS"
  );
}

function isPendingStatus(status: string) {
  const value = status.toUpperCase();

  return (
    value === "PENDING" ||
    value === "PROCESSING" ||
    value === "RECHARGE_PENDING"
  );
}

function isFailedStatus(status: string) {
  const value = status.toUpperCase();

  return (
    value === "FAILED" ||
    value === "FAILURE" ||
    value === "RECHARGE_FAILED" ||
    value === "REVERSED"
  );
}

// =====================================================
// FORMAT HELPERS
// =====================================================

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatText(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}