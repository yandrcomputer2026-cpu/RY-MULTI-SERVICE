import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BrandLogo from "@/components/BrandLogo";

export const dynamic = "force-dynamic";

type StatCardProps = {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
};

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

type ManagementCardProps = {
  href: string;
  icon: string;
  title: string;
  description: string;
};

function ManagementCard({
  href,
  icon,
  title,
  description,
}: ManagementCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-900 transition group-hover:text-blue-700">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-xs font-black text-blue-600">
        Open Management →
      </p>
    </Link>
  );
}

export default async function AdminPage() {
  // =====================================================
  // ADMIN SECURITY
  // =====================================================
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // =====================================================
  // LIVE DATABASE STATISTICS
  // =====================================================
  const [
    totalUsers,
    totalRetailers,
    totalDistributors,
    totalMasterDistributors,
    totalFse,
    wallets,
    successfulTransactions,
    pendingTransactions,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        role: "RETAILER",
      },
    }),

    prisma.user.count({
      where: {
        role: "DISTRIBUTOR",
      },
    }),

    prisma.user.count({
      where: {
        role: "MASTER_DISTRIBUTOR",
      },
    }),

    prisma.user.count({
      where: {
        role: "FSE",
      },
    }),

    prisma.wallet.findMany({
      select: {
        availableBalance: true,
        lockedBalance: true,
      },
    }),

    prisma.walletTransaction.count({
      where: {
        status: "SUCCESS",
      },
    }),

    prisma.walletTransaction.count({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    }),
  ]);

  // =====================================================
  // WALLET TOTAL
  // =====================================================
  const totalAvailableBalance = wallets.reduce(
    (total, wallet) => total + Number(wallet.availableBalance),
    0
  );

  const totalLockedBalance = wallets.reduce(
    (total, wallet) => total + Number(wallet.lockedBalance),
    0
  );

  const totalWalletBalance =
    totalAvailableBalance + totalLockedBalance;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo
  href="/admin"
  admin
/>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              ← User Dashboard
            </Link>

            <div className="hidden rounded-lg bg-emerald-50 px-3 py-2 sm:block">
              <p className="text-xs font-black text-emerald-700">
                {user.name}
              </p>

              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                ADMIN
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* TITLE */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              RY MULTI SERVICE
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              🛡️ Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Users, FSE, wallets, transactions और services को manage करें।
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-black text-emerald-700">
              Admin Access Protected
            </span>
          </div>
        </div>

        {/* USER STATISTICS */}
        <div className="mt-7">
          <h2 className="text-lg font-black text-slate-900">
            User Network
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon="👥"
              title="Total Users"
              value={totalUsers}
              subtitle="All registered accounts"
            />

            <StatCard
              icon="🧑‍💼"
              title="Retailers"
              value={totalRetailers}
              subtitle="Retailer accounts"
            />

            <StatCard
              icon="🤝"
              title="Distributors"
              value={totalDistributors}
              subtitle="Distributor accounts"
            />

            <StatCard
              icon="🏢"
              title="Master Distributors"
              value={totalMasterDistributors}
              subtitle="Master Distributor accounts"
            />

            <StatCard
              icon="🧑‍💻"
              title="FSE"
              value={totalFse}
              subtitle="Field Sales Executives"
            />
          </div>
        </div>

        {/* BUSINESS STATISTICS */}
        <div className="mt-7">
          <h2 className="text-lg font-black text-slate-900">
            Business Overview
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="👛"
              title="Total Wallet Balance"
              value={formatMoney(totalWalletBalance)}
              subtitle="Available + locked"
            />

            <StatCard
              icon="💰"
              title="Available Balance"
              value={formatMoney(totalAvailableBalance)}
              subtitle="All wallets combined"
            />

            <StatCard
              icon="✅"
              title="Successful"
              value={successfulTransactions}
              subtitle="Successful wallet transactions"
            />

            <StatCard
              icon="⏳"
              title="Pending"
              value={pendingTransactions}
              subtitle="Pending + processing"
            />
          </div>
        </div>

        {/* WALLET SUMMARY */}
        <div className="relative mt-7 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 p-6 text-white shadow-lg">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Total Wallet Funds
              </p>

              <p className="mt-2 text-3xl font-black">
                {formatMoney(totalWalletBalance)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Available
              </p>

              <p className="mt-2 text-2xl font-black">
                {formatMoney(totalAvailableBalance)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Locked
              </p>

              <p className="mt-2 text-2xl font-black">
                {formatMoney(totalLockedBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* MANAGEMENT */}
        <div className="mt-9">
          <h2 className="text-xl font-black text-slate-900">
            Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            RY MULTI SERVICE के administrative controls
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ManagementCard
              href="/admin/fse"
              icon="🧑‍💻"
              title="FSE Management"
              description="FSE add करें और उनके द्वारा onboard किए गए members manage करें।"
            />

            <ManagementCard
              href="/admin/users"
              icon="👥"
              title="User Management"
              description="Retailer, Distributor और Master Distributor accounts manage करें।"
            />

            <ManagementCard
              href="/admin/wallets"
              icon="👛"
              title="Wallet Management"
              description="User balances, credit, debit और wallet adjustments manage करें।"
            />

            <ManagementCard
              href="/admin/transactions"
              icon="📊"
              title="Transactions"
              description="Success, pending, processing और failed transactions monitor करें।"
            />

            <ManagementCard
              href="/admin/kyc"
              icon="🪪"
              title="KYC Management"
              description="Retailer और network member KYC requests review करें।"
            />

            <ManagementCard
              href="/admin/services"
              icon="⚙️"
              title="Service Management"
              description="Recharge, BBPS, DMT, AEPS और Travel services control करें।"
            />

            <ManagementCard
              href="/admin/commissions"
              icon="💹"
              title="Commission"
              description="Retailer, Distributor और network commission configuration manage करें।"
            />

            <ManagementCard
              href="/admin/reports"
              icon="📑"
              title="Reports"
              description="User, wallet और transaction reports देखें।"
            />
          </div>
        </div>

        {/* FSE INFORMATION */}
        <div className="mt-9 rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <div className="flex gap-4">
            <div className="text-3xl">
              🧑‍💻
            </div>

            <div>
              <h3 className="font-black text-purple-900">
                FSE Network
              </h3>

              <p className="mt-2 text-sm leading-6 text-purple-700">
                FSE Retailer, Distributor और Master Distributor onboarding
                में काम करेगा। प्रत्येक onboarded account को संबंधित FSE
                के साथ database में link किया जा सकेगा।
              </p>

              <Link
                href="/admin/fse"
                className="mt-4 inline-block rounded-lg bg-purple-700 px-4 py-2.5 text-xs font-black text-white transition hover:bg-purple-800"
              >
                Manage FSE →
              </Link>
            </div>
          </div>
        </div>

        {/* ADMIN INFO */}
        <div className="mt-9 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Logged in Administrator
              </p>

              <p className="mt-1 font-black text-slate-900">
                {user.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="w-fit rounded-lg bg-slate-900 px-5 py-3 text-xs font-black text-white transition hover:bg-slate-800"
            >
              ← Dashboard पर वापस जाएँ
            </Link>
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} RY MULTI SERVICE • Administration
        </footer>
      </section>
    </main>
  );
}