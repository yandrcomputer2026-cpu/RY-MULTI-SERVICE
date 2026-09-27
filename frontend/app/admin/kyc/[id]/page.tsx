import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import BrandLogo from "@/components/BrandLogo";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KycReviewActions from "./KycReviewActions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DocumentType =
  | "PAN"
  | "AADHAAR_FRONT"
  | "AADHAAR_BACK"
  | "PROFILE_PHOTO";

function maskPan(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  const clean = value.trim().toUpperCase();

  if (clean.length <= 4) {
    return "••••";
  }

  return `${clean.slice(0, 2)}••••${clean.slice(-2)}`;
}

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

function statusClasses(status: string) {
  switch (status) {
    case "VERIFIED":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "VERIFIED":
      return "Verified";

    case "PENDING":
      return "Pending Review";

    case "REJECTED":
      return "Rejected";

    default:
      return "Not Submitted";
  }
}

export default async function AdminKycReviewPage({
  params,
}: PageProps) {
  // ==========================================
  // ADMIN AUTHORIZATION
  // ==========================================
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // ==========================================
  // ROUTE PARAM
  // ==========================================
  const { id } = await params;

  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  // ==========================================
  // USER + KYC
  // ==========================================
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
      createdAt: true,

      kyc: {
        select: {
          id: true,
          panNumber: true,
          aadhaarLast4: true,

          panDocumentUrl: true,
          aadhaarFrontUrl: true,
          aadhaarBackUrl: true,
          profilePhotoUrl: true,

          status: true,
          rejectionReason: true,
          verifiedAt: true,
          verifiedBy: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const kyc = user.kyc;

  const documents: {
    type: DocumentType;
    title: string;
    icon: string;
    uploaded: boolean;
  }[] = [
    {
      type: "PAN",
      title: "PAN Card",
      icon: "💳",
      uploaded: Boolean(kyc?.panDocumentUrl),
    },
    {
      type: "AADHAAR_FRONT",
      title: "Aadhaar Front",
      icon: "🪪",
      uploaded: Boolean(kyc?.aadhaarFrontUrl),
    },
    {
      type: "AADHAAR_BACK",
      title: "Aadhaar Back",
      icon: "🪪",
      uploaded: Boolean(kyc?.aadhaarBackUrl),
    },
    {
      type: "PROFILE_PHOTO",
      title: "Profile Photo",
      icon: "👤",
      uploaded: Boolean(kyc?.profilePhotoUrl),
    },
  ];

  const uploadedCount = documents.filter(
    (document) => document.uploaded
  ).length;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <BrandLogo
            href="/admin"
            compact
            admin
          />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/kyc"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← KYC List
            </Link>

            <Link
              href="/admin"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              KYC Review
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              {user.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review user details and privately stored KYC
              documents.
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${statusClasses(
              kyc?.status ?? "NOT_SUBMITTED"
            )}`}
          >
            {statusLabel(
              kyc?.status ?? "NOT_SUBMITTED"
            )}
          </span>
        </div>

        {/* USER INFORMATION */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">
            User Information
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              label="User ID"
              value={String(user.id)}
            />

            <InfoCard
              label="User Code"
              value={user.userCode || "-"}
            />

            <InfoCard
              label="Name"
              value={user.name}
            />

            <InfoCard
              label="Role"
              value={user.role}
            />

            <InfoCard
              label="Mobile"
              value={user.mobile}
            />

            <InfoCard
              label="Email"
              value={user.email}
            />

            <InfoCard
              label="Registered"
              value={formatDate(user.createdAt)}
            />

            <InfoCard
              label="KYC Record"
              value={kyc ? `#${kyc.id}` : "Not created"}
            />
          </div>
        </section>

        {/* KYC INFORMATION */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                KYC Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sensitive identity values are masked.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              {uploadedCount}/4 Documents Uploaded
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              label="PAN"
              value={maskPan(
                kyc?.panNumber ?? null
              )}
            />

            <InfoCard
              label="Aadhaar"
              value={
                kyc?.aadhaarLast4
                  ? `XXXX-XXXX-${kyc.aadhaarLast4}`
                  : "Not provided"
              }
            />

            <InfoCard
              label="Status"
              value={statusLabel(
                kyc?.status ?? "NOT_SUBMITTED"
              )}
            />

            <InfoCard
              label="Last Updated"
              value={
                kyc
                  ? formatDate(kyc.updatedAt)
                  : "-"
              }
            />
          </div>

          {kyc?.rejectionReason && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800">
                Rejection Reason
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {kyc.rejectionReason}
              </p>
            </div>
          )}
        </section>

        {/* DOCUMENTS */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              KYC Documents
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Documents private storage से temporary secure
              link के माध्यम से खोले जाते हैं।
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {documents.map((document) => (
              <div
                key={document.type}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                    {document.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900">
                      {document.title}
                    </h3>

                    <p
                      className={`mt-1 text-sm font-semibold ${
                        document.uploaded
                          ? "text-green-600"
                          : "text-slate-400"
                      }`}
                    >
                      {document.uploaded
                        ? "✓ Uploaded"
                        : "Not uploaded"}
                    </p>
                  </div>
                </div>

                {document.uploaded ? (
                  <a
                    href={`/api/admin/kyc/document?userId=${user.id}&documentType=${document.type}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    View Document ↗
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-5 cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-500"
                  >
                    Document Missing
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* VERIFICATION INFORMATION */}
        {kyc && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">
              Verification Information
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard
                label="Submitted / Created"
                value={formatDate(kyc.createdAt)}
              />

              <InfoCard
                label="Last Updated"
                value={formatDate(kyc.updatedAt)}
              />

              <InfoCard
                label="Verified At"
                value={formatDate(kyc.verifiedAt)}
              />

              <InfoCard
                label="Verified By"
                value={
                  kyc.verifiedBy
                    ? `Admin #${kyc.verifiedBy}`
                    : "-"
                }
              />
            </div>
          </section>
        )}

        <KycReviewActions
  userId={user.id}
  status={kyc?.status ?? "NOT_SUBMITTED"}
/>

        {/* SECURITY NOTICE */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-bold text-amber-900">
            🔒 KYC Security
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            KYC documents public storage URLs के रूप में expose
            नहीं किए जाते। केवल authenticated admin secure
            document endpoint के माध्यम से इन्हें access कर सकता
            है। Aadhaar का पूरा number इस page पर display नहीं
            किया जाता।
          </p>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}