import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function AdminWalletsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const wallets = await prisma.wallet.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      availableBalance: true,
      lockedBalance: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          userCode: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
        },
      },

      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  const totalAvailable = wallets.reduce(
    (sum, item) => sum + Number(item.availableBalance),
    0
  );

  const totalLocked = wallets.reduce(
    (sum, item) => sum + Number(item.lockedBalance),
    0
  );

  const activeWallets = wallets.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const blockedWallets = wallets.filter(
    (item) => item.status === "BLOCKED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 md:px-8">
  <BrandLogo
  href="/admin"
  admin
/>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
        {/* TITLE */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="text-3xl font-black text-slate-950">
            Wallet Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            सभी user wallets, balances और wallet status को यहाँ से monitor करें।
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="TOTAL WALLETS"
            value={String(wallets.length)}
            subtitle="Created wallets"
            icon="👛"
          />

          <SummaryCard
            title="AVAILABLE BALANCE"
            value={`₹${money(totalAvailable)}`}
            subtitle="All wallets combined"
            icon="💰"
          />

          <SummaryCard
            title="LOCKED BALANCE"
            value={`₹${money(totalLocked)}`}
            subtitle="Currently locked funds"
            icon="🔒"
          />

          <SummaryCard
            title="ACTIVE / BLOCKED"
            value={`${activeWallets} / ${blockedWallets}`}
            subtitle="Wallet status"
            icon="🛡️"
          />
        </div>

        {/* WALLET TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                User Wallets
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Live wallet information from database
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
              {wallets.length} WALLETS
            </div>
          </div>

          {wallets.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mb-3 text-4xl">👛</div>

              <h3 className="text-lg font-black text-slate-900">
                No wallets found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                अभी database में कोई wallet उपलब्ध नहीं है।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Available</th>
                    <th className="px-5 py-4">Locked</th>
                    <th className="px-5 py-4">Total Funds</th>
                    <th className="px-5 py-4">Transactions</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {wallets.map((wallet) => {
                    const available = Number(wallet.availableBalance);
                    const locked = Number(wallet.lockedBalance);
                    const total = available + locked;

                    return (
                      <tr
                        key={wallet.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-5">
                          <div className="font-black text-slate-900">
                            {wallet.user.name}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {wallet.user.userCode || `USER-${wallet.user.id}`}
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            {wallet.user.mobile}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700">
                            {wallet.user.role}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="font-black text-emerald-600">
                            ₹{money(available)}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="font-bold text-amber-600">
                            ₹{money(locked)}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="font-black text-slate-900">
                            ₹{money(total)}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="font-black text-slate-800">
                            {wallet._count.transactions}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <WalletStatus status={wallet.status} />
                        </td>

                        <td className="px-5 py-5 text-right">
                          <Link
                            href={`/admin/users/${wallet.user.id}`}
                            className="inline-flex rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                          >
                            View User →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECURITY NOTE */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <div className="text-xl">🔐</div>

            <div>
              <h3 className="font-black text-amber-900">
                Wallet Security
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                यह page अभी wallet information को केवल monitor करता है।
                Manual Credit/Debit को अलग secure transaction workflow के साथ
                जोड़ा जाएगा ताकि balance सीधे unsafe तरीके से modify न हो।
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-2xl font-black text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function WalletStatus({
  status,
}: {
  status: "ACTIVE" | "BLOCKED" | "SUSPENDED";
}) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        ACTIVE
      </span>
    );
  }

  if (status === "BLOCKED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-black text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        BLOCKED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      SUSPENDED
    </span>
  );
}