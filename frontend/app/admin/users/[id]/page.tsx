import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function roleLabel(role: string) {
  switch (role) {
    case "RETAILER":
      return "Retailer";

    case "DISTRIBUTOR":
      return "Distributor";

    case "MASTER_DISTRIBUTOR":
      return "Master Distributor";

    case "FSE":
      return "FSE";

    case "ADMIN":
      return "Admin";

    default:
      return role;
  }
}

function roleStyle(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-red-50 text-red-700";

    case "FSE":
      return "bg-purple-50 text-purple-700";

    case "MASTER_DISTRIBUTOR":
      return "bg-amber-50 text-amber-700";

    case "DISTRIBUTOR":
      return "bg-cyan-50 text-cyan-700";

    default:
      return "bg-blue-50 text-blue-700";
  }
}

function formatMoney(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminUserDetailsPage({
  params,
}: PageProps) {
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
  // USER ID
  // =====================================================

  const { id } = await params;

  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  // =====================================================
  // USER DETAILS
  // =====================================================

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
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
      updatedAt: true,

      wallet: {
        select: {
          id: true,
          availableBalance: true,
          lockedBalance: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      onboardedBy: {
        select: {
          id: true,
          userCode: true,
          name: true,
          mobile: true,
        },
      },

      distributor: {
        select: {
          id: true,
          userCode: true,
          name: true,
          mobile: true,
        },
      },

      masterDistributor: {
        select: {
          id: true,
          userCode: true,
          name: true,
          mobile: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const availableBalance = Number(
    user.wallet?.availableBalance ?? 0
  );

  const lockedBalance = Number(
    user.wallet?.lockedBalance ?? 0
  );

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
      href="/admin/users"
      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
    >
      ← All Users
    </Link>
  </div>
</header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* USER HEADER */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-700">
                {user.name
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                    {user.name}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black ${roleStyle(
                      user.role
                    )}`}
                  >
                    {roleLabel(user.role)}
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {user.userCode ||
                    `User #${user.id}`}
                </p>
              </div>
            </div>

            <div>
              <span
                className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${
                  user.assignmentStatus ===
                  "ASSIGNED"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {user.assignmentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* LEFT */}

          <div className="space-y-6 lg:col-span-2">
            {/* ACCOUNT DETAILS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-black text-slate-900">
                Account Details
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Registered user information
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="User ID"
                  value={String(user.id)}
                />

                <DetailItem
                  label="User Code"
                  value={
                    user.userCode || "Not assigned"
                  }
                />

                <DetailItem
                  label="Full Name"
                  value={user.name}
                />

                <DetailItem
                  label="Mobile Number"
                  value={user.mobile}
                />

                <DetailItem
                  label="Email Address"
                  value={user.email}
                />

                <DetailItem
                  label="PIN Code"
                  value={
                    user.pincode || "Not available"
                  }
                />

                <DetailItem
                  label="Role"
                  value={roleLabel(user.role)}
                />

                <DetailItem
                  label="Registration Source"
                  value={user.registrationSource}
                />

                <DetailItem
                  label="Assignment Status"
                  value={user.assignmentStatus}
                />

                <DetailItem
                  label="Registered On"
                  value={user.createdAt.toLocaleString(
                    "en-IN"
                  )}
                />

                <DetailItem
                  label="Last Updated"
                  value={user.updatedAt.toLocaleString(
                    "en-IN"
                  )}
                />
              </div>
            </div>

            {/* NETWORK DETAILS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-black text-slate-900">
                Network Assignment
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                FSE, Distributor और Master Distributor
                mapping
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <NetworkCard
                  title="Onboarded By / FSE"
                  name={
                    user.onboardedBy?.name ||
                    "Not assigned"
                  }
                  code={
                    user.onboardedBy?.userCode ||
                    null
                  }
                  mobile={
                    user.onboardedBy?.mobile ||
                    null
                  }
                />

                <NetworkCard
                  title="Distributor"
                  name={
                    user.distributor?.name ||
                    "Not assigned"
                  }
                  code={
                    user.distributor?.userCode ||
                    null
                  }
                  mobile={
                    user.distributor?.mobile ||
                    null
                  }
                />

                <NetworkCard
                  title="Master Distributor"
                  name={
                    user.masterDistributor?.name ||
                    "Not assigned"
                  }
                  code={
                    user.masterDistributor
                      ?.userCode || null
                  }
                  mobile={
                    user.masterDistributor
                      ?.mobile || null
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            {/* WALLET */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Wallet
                  </p>

                  <h2 className="mt-1 font-black text-slate-900">
                    Wallet Summary
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  💰
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-700">
                  Available Balance
                </p>

                <p className="mt-1 text-2xl font-black text-emerald-700">
                  ₹{formatMoney(availableBalance)}
                </p>
              </div>

              <div className="mt-3 rounded-xl bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-700">
                  Locked Balance
                </p>

                <p className="mt-1 text-xl font-black text-amber-700">
                  ₹{formatMoney(lockedBalance)}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-500">
                  Wallet Status
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black ${
                    user.wallet?.status ===
                    "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700"
                      : user.wallet
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {user.wallet?.status ||
                    "NO WALLET"}
                </span>
              </div>
            </div>

            {/* ADMIN ACTIONS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-black text-slate-900">
                Admin Actions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                User account management
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-black text-slate-800">
                    Change Role
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Retailer, Distributor, Master
                    Distributor या FSE role manage करें।
                  </p>

                  <span className="mt-3 inline-flex rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-500">
                    NEXT STEP
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-black text-slate-800">
                    Wallet Management
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Credit, debit और wallet status
                    manage करें।
                  </p>

                  <span className="mt-3 inline-flex rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-500">
                    NEXT STEP
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-black text-slate-800">
                    Network Assignment
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Distributor और network mapping
                    manage करें।
                  </p>

                  <span className="mt-3 inline-flex rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-500">
                    NEXT STEP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function NetworkCard({
  title,
  name,
  code,
  mobile,
}: {
  title: string;
  name: string;
  code: string | null;
  mobile: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-sm font-black text-slate-800">
        {name}
      </p>

      {code && (
        <p className="mt-1 text-xs text-slate-500">
          {code}
        </p>
      )}

      {mobile && (
        <p className="mt-1 text-xs text-slate-500">
          {mobile}
        </p>
      )}
    </div>
  );
}