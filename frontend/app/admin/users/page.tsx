import UsersTable from "./UsersTable";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BrandLogo from "@/components/BrandLogo";

export const dynamic = "force-dynamic";


export default async function AdminUsersPage() {
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
  // USERS
  // =====================================================

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      userCode: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      registrationSource: true,
      assignmentStatus: true,
      pincode: true,
      createdAt: true,

      wallet: {
        select: {
          availableBalance: true,
          lockedBalance: true,
          status: true,
        },
      },
    },
  });

  // =====================================================
  // COUNTS
  // =====================================================

  const retailerCount = users.filter(
    (item) => item.role === "RETAILER"
  ).length;

  const distributorCount = users.filter(
    (item) => item.role === "DISTRIBUTOR"
  ).length;

  const masterDistributorCount = users.filter(
    (item) => item.role === "MASTER_DISTRIBUTOR"
  ).length;

  const fseCount = users.filter(
    (item) => item.role === "FSE"
  ).length;

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo
  href="/admin"
  admin
/>

          <Link
            href="/admin"
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* TITLE */}

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            ADMINISTRATION
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            👥 User Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Retailer, Distributor, Master Distributor और दूसरे
            registered accounts देखें।
          </p>
        </div>

        {/* SUMMARY */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            title="Total Users"
            value={users.length}
            icon="👥"
          />

          <SummaryCard
            title="Retailers"
            value={retailerCount}
            icon="🧑‍💼"
          />

          <SummaryCard
            title="Distributors"
            value={distributorCount}
            icon="🤝"
          />

          <SummaryCard
            title="Master Distributors"
            value={masterDistributorCount}
            icon="🏢"
          />

          <SummaryCard
            title="FSE"
            value={fseCount}
            icon="🧑‍💻"
          />
        </div>

        {/* USERS TABLE */}

        <UsersTable
  users={users.map((item) => ({
    id: item.id,
    userCode: item.userCode,
    name: item.name,
    email: item.email,
    mobile: item.mobile,
    role: item.role,
    registrationSource: item.registrationSource,
    assignmentStatus: item.assignmentStatus,
    pincode: item.pincode,
    createdAt: item.createdAt.toISOString(),

    wallet: item.wallet
      ? {
          availableBalance: Number(
            item.wallet.availableBalance
          ),
          lockedBalance: Number(
            item.wallet.lockedBalance
          ),
          status: item.wallet.status,
        }
      : null,
  }))}
/>
      </section>
    </main>
  );
}

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
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
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