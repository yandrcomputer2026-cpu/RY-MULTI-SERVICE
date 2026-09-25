import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FseDashboardPage() {
  // =========================================
  // 1. CURRENT LOGGED-IN USER
  // =========================================

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // =========================================
  // 2. ONLY FSE ALLOWED
  // =========================================

  if (currentUser.role !== "FSE") {
    if (currentUser.role === "ADMIN") {
      redirect("/admin");
    }

    redirect("/dashboard");
  }

  // =========================================
  // 3. LOAD FSE DETAILS
  // =========================================

  const fse = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },

    select: {
      id: true,
      userCode: true,
      name: true,
      email: true,
      mobile: true,

      fseAreas: {
        where: {
          isActive: true,
        },

        orderBy: {
          pincode: "asc",
        },

        select: {
          id: true,
          pincode: true,
        },
      },

      onboardedUsers: {
        select: {
          id: true,
          role: true,
          assignmentStatus: true,
        },
      },
    },
  });

  if (!fse) {
    redirect("/login");
  }

  // =========================================
  // 4. MEMBER COUNTS
  // =========================================

  const totalMembers = fse.onboardedUsers.length;

  const retailerCount = fse.onboardedUsers.filter(
    (member) => member.role === "RETAILER"
  ).length;

  const distributorCount = fse.onboardedUsers.filter(
    (member) => member.role === "DISTRIBUTOR"
  ).length;

  const masterDistributorCount = fse.onboardedUsers.filter(
    (member) => member.role === "MASTER_DISTRIBUTOR"
  ).length;

  const pendingCount = fse.onboardedUsers.filter(
    (member) => member.assignmentStatus === "PENDING"
  ).length;

  const assignedCount = fse.onboardedUsers.filter(
    (member) => member.assignmentStatus === "ASSIGNED"
  ).length;

  // =========================================
  // 5. PAGE
  // =========================================

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================
          TOP HEADER
      ====================================== */}

      <header className="border-b border-slate-200 bg-white shadow-sm">
  <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
    {/* COMPANY BRANDING */}
    <Link
      href="/fse/dashboard"
      className="flex items-center gap-3"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
        <Image
          src="/ry-logo.jpg"
          alt="RY MULTI SERVICE Logo"
          width={70}
          height={70}
          priority
          className="h-full w-full object-contain"
        />
      </div>

      <div>
        <p className="text-lg font-black tracking-tight text-blue-700 sm:text-xl">
          RY MULTI SERVICE
        </p>

        <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
          FSE Network Management
        </p>
      </div>
    </Link>

    {/* FSE DETAILS */}
    <div className="hidden rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 sm:block">
      <p className="text-xs font-black text-blue-800">
        {fse.name}
      </p>

      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
        {fse.userCode || "FSE"}
      </p>
    </div>
  </div>
</header>

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Field Sales Executive
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                FSE Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                अपने assigned area और onboarded members को manage करें।
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/fse/members"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                👥 My Members
              </Link>

              <Link
                href="/fse/members/new"
                className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
              >
                ＋ Add New Member
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          CONTENT
      ====================================== */}

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {/* =====================================
            FSE INFORMATION
        ====================================== */}

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              FSE
            </p>

            <h2 className="mt-3 text-xl font-black text-slate-950">
              {fse.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {fse.email}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              FSE Code
            </p>

            <p className="mt-3 text-xl font-black text-blue-700">
              {fse.userCode || "—"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {fse.mobile}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Working PIN Codes
            </p>

            <p className="mt-3 text-3xl font-black text-emerald-600">
              {fse.fseAreas.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active assigned areas
            </p>
          </div>
        </div>

        {/* =====================================
            MEMBER SUMMARY
        ====================================== */}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Total Members
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {totalMembers}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-700">
              Retailers
            </p>

            <p className="mt-2 text-3xl font-black text-blue-900">
              {retailerCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-700">
              Distributors
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-900">
              {distributorCount}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
            <p className="text-sm font-bold text-purple-700">
              Master Distributors
            </p>

            <p className="mt-2 text-3xl font-black text-purple-900">
              {masterDistributorCount}
            </p>
          </div>
        </div>

        {/* =====================================
            AREA + ASSIGNMENT
        ====================================== */}

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          {/* PIN CODES */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    📍 My Working Area
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Admin द्वारा आपको assign किए गए active PIN codes.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {fse.fseAreas.length} PIN
                </span>
              </div>
            </div>

            <div className="p-6">
              {fse.fseAreas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <div className="text-3xl">📍</div>

                  <p className="mt-3 font-black text-slate-700">
                    कोई PIN Code assigned नहीं है
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Member onboard करने से पहले Admin से area assign करवाएँ।
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {fse.fseAreas.map((area) => (
                    <div
                      key={area.id}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                        Active PIN
                      </p>

                      <p className="mt-1 text-lg font-black text-emerald-900">
                        {area.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ASSIGNMENT STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-black text-slate-950">
                Member Assignment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current network status
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-4">
                <span className="text-sm font-bold text-emerald-700">
                  ✓ Assigned
                </span>

                <span className="text-xl font-black text-emerald-900">
                  {assignedCount}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-4">
                <span className="text-sm font-bold text-amber-700">
                  ⏳ Pending
                </span>

                <span className="text-xl font-black text-amber-900">
                  {pendingCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            SECURITY NOTICE
        ====================================== */}

        <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="text-xl">🔐</div>

            <div>
              <p className="font-black text-blue-900">
                Area Restricted Onboarding
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                आप केवल Admin द्वारा assigned active PIN codes के members
                onboard कर सकेंगे। यह validation server पर भी लागू की जाएगी।
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}