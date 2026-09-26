import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BrandLogo from "@/components/BrandLogo";

export const dynamic = "force-dynamic";

function statusStyle(status: string) {
  switch (status) {
    case "VERIFIED":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function maskPan(pan?: string | null) {
  if (!pan) return "—";

  const value = pan.toUpperCase();

  if (value.length <= 4) {
    return "****";
  }

  return `${value.slice(0, 2)}******${value.slice(-2)}`;
}

export default async function AdminKycPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

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
      createdAt: true,

      kyc: {
        select: {
          id: true,
          status: true,
          panNumber: true,
          aadhaarLast4: true,
          rejectionReason: true,
          verifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  const totalUsers = users.length;

  const pendingCount = users.filter(
    (item) => item.kyc?.status === "PENDING"
  ).length;

  const verifiedCount = users.filter(
    (item) => item.kyc?.status === "VERIFIED"
  ).length;

  const rejectedCount = users.filter(
    (item) => item.kyc?.status === "REJECTED"
  ).length;

  const notSubmittedCount = users.filter(
    (item) => !item.kyc || item.kyc.status === "NOT_SUBMITTED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo href="/admin" admin />

          <Link
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            KYC Management
          </p>

          <h1 className="mt-1 text-3xl font-black text-slate-900">
            User KYC
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            User KYC submission और verification status यहाँ monitor करें।
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Users
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {totalUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Not Submitted
            </p>
            <p className="mt-2 text-3xl font-black text-slate-700">
              {notSubmittedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending
            </p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Verified
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {verifiedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">
              Rejected
            </p>
            <p className="mt-2 text-3xl font-black text-red-700">
              {rejectedCount}
            </p>
          </div>
        </section>

        {/* KYC TABLE */}
        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-black text-slate-900">
              KYC Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              PAN और Aadhaar information security के लिए masked दिखाई जा रही
              है।
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Mobile</th>
                  <th className="px-5 py-4">PAN</th>
                  <th className="px-5 py-4">Aadhaar</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Updated</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((item) => {
                  const status = item.kyc?.status ?? "NOT_SUBMITTED";

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {item.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {item.userCode || `USER-${item.id}`}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {item.email}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-700">
                          {item.role.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.mobile}
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-600">
                        {maskPan(item.kyc?.panNumber)}
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-600">
                        {item.kyc?.aadhaarLast4
                          ? `XXXX XXXX ${item.kyc.aadhaarLast4}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusStyle(
                            status
                          )}`}
                        >
                          {status.replaceAll("_", " ")}
                        </span>

                        {status === "REJECTED" &&
                          item.kyc?.rejectionReason && (
                            <p className="mt-2 max-w-[220px] text-xs text-red-600">
                              {item.kyc.rejectionReason}
                            </p>
                          )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {item.kyc
                          ? item.kyc.updatedAt.toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      कोई user record नहीं मिला।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECURITY NOTE */}
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="font-bold text-blue-900">
            KYC Security
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">
            इस admin screen पर sensitive identity information को limited और
            masked रखा गया है। Full Aadhaar number को इस table में display
            नहीं किया जाएगा।
          </p>
        </div>
      </div>
    </main>
  );
}