import Link from "next/link";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import KycUploadForm from "./KycUploadForm";

export const dynamic = "force-dynamic";

function getStatusStyle(status: string) {
  switch (status) {
    case "VERIFIED":
      return {
        label: "Verified",
        className: "bg-green-100 text-green-700",
      };

    case "PENDING":
      return {
        label: "Pending Review",
        className: "bg-blue-100 text-blue-700",
      };

    case "REJECTED":
      return {
        label: "Rejected",
        className: "bg-red-100 text-red-700",
      };

    default:
      return {
        label: "Not Submitted",
        className: "bg-yellow-100 text-yellow-700",
      };
  }
}

export default async function KycPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const kyc = await prisma.kyc.findUnique({
    where: {
      userId: user.id,
    },
  });

  const status = kyc?.status ?? "NOT_SUBMITTED";
  const statusStyle = getStatusStyle(status);

  const uploadedDocuments = {
    pan: Boolean(kyc?.panDocumentUrl),
    aadhaarFront: Boolean(kyc?.aadhaarFrontUrl),
    aadhaarBack: Boolean(kyc?.aadhaarBackUrl),
    profilePhoto: Boolean(kyc?.profilePhotoUrl),
  };

  const uploadedCount = Object.values(
    uploadedDocuments
  ).filter(Boolean).length;

  const kycSteps = [
    {
      title: "Personal Details",
      description:
        "Name, mobile number और email account से प्राप्त किए गए हैं।",
      complete: true,
      icon: "👤",
    },
    {
      title: "PAN Document",
      description:
        "PAN card की private document copy upload करें।",
      complete: uploadedDocuments.pan,
      icon: "💳",
    },
    {
      title: "Aadhaar Documents",
      description:
        "Aadhaar card के front और back documents upload करें।",
      complete:
        uploadedDocuments.aadhaarFront &&
        uploadedDocuments.aadhaarBack,
      icon: "🪪",
    },
    {
      title: "Profile Photo",
      description:
        "Account verification के लिए clear profile photo upload करें।",
      complete: uploadedDocuments.profilePhoto,
      icon: "📷",
    },
    {
      title: "Admin Verification",
      description:
        status === "VERIFIED"
          ? "KYC documents verify किए जा चुके हैं।"
          : status === "PENDING"
            ? "आपके KYC documents admin review में हैं।"
            : status === "REJECTED"
              ? "KYC review में correction required है।"
              : "Required documents complete होने के बाद verification review होगा।",
      complete: status === "VERIFIED",
      icon: "✅",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <BrandLogo href="/dashboard" />

          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Page Heading */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            🪪 KYC Verification
          </h2>

          <p className="mt-2 text-gray-600">
            अपने RY MULTI SERVICE account की KYC status देखें और
            verification के लिए required documents upload करें।
          </p>
        </div>

        {/* Main Status Card */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
                🪪
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  KYC Status
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  RY MULTI SERVICE Account Verification
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${statusStyle.className}`}
            >
              {statusStyle.label}
            </span>
          </div>

          {/* Rejection Notice */}
          {status === "REJECTED" && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-red-800">
                KYC Correction Required
              </p>

              <p className="mt-2 text-sm leading-6 text-red-700">
                {kyc?.rejectionReason ||
                  "आपके KYC documents में correction required है। Required document दोबारा upload करें।"}
              </p>
            </div>
          )}

          {/* Pending Notice */}
          {status === "PENDING" && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="font-semibold text-blue-800">
                Documents Under Review
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-700">
                आपके KYC documents submit हो चुके हैं और verification
                review pending है।
              </p>
            </div>
          )}

          {/* Verified Notice */}
          {status === "VERIFIED" && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
              <p className="font-semibold text-green-800">
                KYC Verified
              </p>

              <p className="mt-2 text-sm leading-6 text-green-700">
                आपका KYC verification successfully complete हो चुका है।
              </p>
            </div>
          )}

          {/* Account Information */}
          <div className="mt-8">
            <h4 className="text-lg font-bold text-gray-900">
              Account Information
            </h4>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <InfoCard
                label="Account Holder"
                value={user.name || "-"}
              />

              <InfoCard
                label="Mobile Number"
                value={user.mobile || "-"}
              />

              <InfoCard
                label="Email Address"
                value={user.email || "-"}
              />

              <InfoCard
                label="KYC Status"
                value={statusStyle.label}
                warning={status !== "VERIFIED"}
              />
            </div>
          </div>

          {/* Upload Progress */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">
                  Document Upload Progress
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {uploadedCount} of 4 documents uploaded
                </p>
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                {uploadedCount}/4
              </span>
            </div>
          </div>

          {/* Upload Component */}
          {(status === "NOT_SUBMITTED" || status === "REJECTED") && (
  <KycUploadForm />
)}

          {/* Verification Steps */}
          <div className="mt-10">
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                Verification Steps
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                नीचे अपने KYC verification की current progress देखें।
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {kycSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    {step.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h5 className="font-semibold text-gray-900">
                        {index + 1}. {step.title}
                      </h5>

                      {step.complete ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Complete
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          Pending
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="font-semibold text-blue-800">
              🔒 Private Document Storage
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-700">
              KYC documents private storage में रखे जाते हैं और public
              file URL के रूप में expose नहीं किए जाते। Verification
              access authorized workflow के माध्यम से दिया जाएगा।
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/account"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              👤 Account Details
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg bg-gray-800 px-5 py-3 font-semibold text-white transition hover:bg-gray-900"
            >
              ← Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-5">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 break-all font-semibold ${
          warning
            ? "text-yellow-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}