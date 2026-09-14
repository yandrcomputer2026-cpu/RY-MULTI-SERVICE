import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function KycPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const kycSteps = [
    {
      title: "Personal Details",
      description: "Name, mobile number और email verification",
      status: "available",
      icon: "👤",
    },
    {
      title: "PAN Verification",
      description: "PAN verification provider integration required",
      status: "pending",
      icon: "💳",
    },
    {
      title: "Aadhaar Verification",
      description: "Authorized Aadhaar / KYC provider integration required",
      status: "pending",
      icon: "🪪",
    },
    {
      title: "Business Verification",
      description: "Business details और applicable documents verification",
      status: "pending",
      icon: "🏢",
    },
    {
      title: "Bank Verification",
      description: "Settlement bank account verification",
      status: "pending",
      icon: "🏦",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <p className="text-xs text-gray-500">
              Account Verification
            </p>
          </div>

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
            अपने RY MULTI SERVICE account की verification status और required
            KYC steps देखें।
          </p>
        </div>

        {/* Main Status Card */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl">
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

            <span className="w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
              Setup Required
            </span>
          </div>

          {/* Important Notice */}
          <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
            <p className="font-semibold text-yellow-800">
              KYC provider अभी configure नहीं है
            </p>

            <p className="mt-2 text-sm leading-6 text-yellow-700">
              PAN, Aadhaar, business और bank verification के लिए secure और
              authorized KYC provider/backend integration आवश्यक है।
              Provider final होने तक sensitive documents इस website पर
              collect नहीं किए जाएंगे।
            </p>
          </div>

          {/* Account Details */}
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
                value="Not Verified"
                warning
              />
            </div>
          </div>

          {/* Verification Steps */}
          <div className="mt-10">
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                Verification Steps
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                Provider integration के बाद ये verification steps enable किए
                जाएंगे।
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

                      {step.status === "available" ? (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          Pending Setup
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

          {/* Provider Ready Notice */}
          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="font-semibold text-blue-800">
              Provider Integration Ready
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-700">
              जब authorized KYC / AEPS / BBPS provider final होगा, तब इसी
              section में secure verification APIs connect की जाएंगी।
              Verification result backend/database से लिया जाएगा।
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
          warning ? "text-yellow-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}