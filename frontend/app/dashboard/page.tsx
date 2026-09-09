import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/history"
              className="text-gray-600 hover:text-blue-600"
            >
              My History
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ================= DASHBOARD ================= */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Welcome */}
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome {user.name} 👋
        </h2>

        <p className="mt-2 text-gray-600">
          आपका Login सफल हो गया है।
        </p>

        {/* ================= PROFILE ================= */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h3 className="text-2xl font-bold text-gray-900">
            आपकी Profile
          </h3>

          <div className="mt-5 space-y-4 text-gray-700">
            <p>
              <span className="font-bold">Name:</span>{" "}
              {user.name}
            </p>

            <p>
              <span className="font-bold">Email:</span>{" "}
              {user.email}
            </p>

            <p>
              <span className="font-bold">Mobile:</span>{" "}
              {user.mobile}
            </p>

            <p>
              <span className="font-bold">Role:</span>{" "}
              {user.role}
            </p>
          </div>
        </div>

        {/* ================= MY HISTORY ================= */}
        <Link
          href="/history"
          className="mt-8 block rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-3xl">📋</div>

              <h3 className="mt-2 text-2xl font-bold">
                My History
              </h3>

              <p className="mt-2 text-blue-100">
                अपनी सभी bookings और transactions एक ही जगह देखें।
              </p>
            </div>

            <div className="text-lg font-semibold">
              View History →
            </div>
          </div>
        </Link>

        {/* ================= MAIN CATEGORIES ================= */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/recharge"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">📱</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Recharge
            </h3>

            <p className="mt-2 text-gray-500">
              Mobile Prepaid और DTH Recharge services।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              Recharge खोलें →
            </p>
          </Link>

          <Link
            href="/utility"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">💡</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Utility
            </h3>

            <p className="mt-2 text-gray-500">
              Electricity, Mobile Postpaid और FASTag services।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              Utility खोलें →
            </p>
          </Link>

          <Link
            href="/banking"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">🏦</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Banking
            </h3>

            <p className="mt-2 text-gray-500">
              AEPS, Money Transfer और UPI Cash services।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              Banking खोलें →
            </p>
          </Link>

          <Link
            href="/travels"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">✈️</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Travels
            </h3>

            <p className="mt-2 text-gray-500">
              Train, Bus, Flight और Hotel booking।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              Travels खोलें →
            </p>
          </Link>

          <Link
            href="/wallet"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">👛</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Manage Wallet
            </h3>

            <p className="mt-2 text-gray-500">
              Wallet, Add Money और Bank Settlement।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              Wallet खोलें →
            </p>
          </Link>

          <Link
            href="/account"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">👤</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Account Details
            </h3>

            <p className="mt-2 text-gray-500">
              Profile, password और account information।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              Account खोलें →
            </p>
          </Link>

          <Link
            href="/kyc"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">🪪</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              KYC
            </h3>

            <p className="mt-2 text-gray-500">
              KYC status और verification setup।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              KYC खोलें →
            </p>
          </Link>

          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="block rounded-xl border border-green-200 bg-green-50 p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">🛡️</div>

              <h3 className="mt-4 text-xl font-bold text-green-900">
                Admin Panel
              </h3>

              <p className="mt-2 text-green-700">
                Retailer, Distributor और Master Distributor management।
              </p>

              <p className="mt-4 font-semibold text-green-700">
                Admin Panel खोलें →
              </p>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}