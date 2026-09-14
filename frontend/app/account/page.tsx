import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <p className="text-xs text-gray-500">
              Account & Profile
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
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            👤 Account Details
          </h2>

          <p className="mt-2 text-gray-600">
            अपनी profile, account status और verification options देखें।
          </p>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                👤
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {user.name || "Account Holder"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  RY MULTI SERVICE Account
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Active
            </span>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-bold text-gray-900">
              Profile Information
            </h4>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <InfoCard
                label="Full Name"
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
                label="Account Status"
                value="Active"
                success
              />
            </div>
          </div>

          <div className="mt-10">
            <h4 className="text-lg font-bold text-gray-900">
              Account Security
            </h4>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="font-semibold text-blue-800">
                Password Security
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-700">
                अपने account को सुरक्षित रखने के लिए strong password रखें और
                password किसी के साथ share न करें।
              </p>

              <Link
                href="/change-password"
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                🔐 Change Password
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="text-lg font-bold text-gray-900">
              Verification
            </h4>

            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-yellow-800">
                    KYC Verification
                  </p>

                  <p className="mt-2 text-sm leading-6 text-yellow-700">
                    PAN, Aadhaar, business और bank verification provider
                    integration के बाद enable होगी।
                  </p>
                </div>

                <Link
                  href="/kyc"
                  className="w-fit rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700"
                >
                  🪪 View KYC
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="text-lg font-bold text-gray-900">
              Account Activity
            </h4>

            <div className="mt-4 rounded-xl border border-gray-200 p-5">
              <p className="font-semibold text-gray-900">
                Transaction & Booking History
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Recharge, utility payments, travel bookings और अन्य service
                transactions की history centralized History page पर उपलब्ध है।
              </p>

              <Link
                href="/history"
                className="mt-4 inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                📋 My History
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kyc"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              🪪 KYC
            </Link>

            <Link
              href="/history"
              className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              📋 My History
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
  success = false,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-5">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 break-all font-semibold ${
          success ? "text-green-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}