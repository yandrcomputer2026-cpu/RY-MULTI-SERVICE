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
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-blue-600"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            👤 Account Details
          </h2>

          <p className="mt-2 text-gray-600">
            अपनी account और profile जानकारी देखें।
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
              👤
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {user.name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                RY MULTI SERVICE Account
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Full Name
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {user.name || "-"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Mobile Number
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {user.mobile || "-"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <p className="mt-1 break-all font-semibold text-gray-900">
                {user.email || "-"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Account Status
              </p>

              <p className="mt-1 font-semibold text-green-600">
                Active
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/change-password"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              🔐 Change Password
            </Link>

            <Link
              href="/history"
              className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              📋 My History
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}