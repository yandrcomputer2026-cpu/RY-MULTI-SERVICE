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
    <main className="min-h-screen bg-slate-50">
      {/* ================= TOP HEADER ================= */}
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="flex h-20 items-center justify-between px-5 lg:pl-[260px] lg:pr-8">
          <div className="lg:hidden">
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-700">
              Welcome, {user.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet */}
            <Link
              href="/wallet"
              className="hidden rounded-xl border bg-white px-4 py-2 shadow-sm sm:block"
            >
              <p className="text-xs font-semibold text-gray-400">
                MY WALLET
              </p>

              <p className="text-sm font-bold text-gray-800">
                Wallet Setup
              </p>
            </Link>

            {/* Add Money */}
            <Link
              href="/wallet"
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              Add Money
            </Link>

            {/* Account */}
            <Link
              href="/account"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-xl"
            >
              👤
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] border-r bg-white lg:block">
        <div className="border-b px-6 py-5">
          <h1 className="text-2xl font-extrabold text-blue-700">
            RY MULTI
          </h1>

          <p className="text-sm font-semibold text-gray-500">
            SERVICE
          </p>
        </div>

        <nav className="px-3 py-5">
          <Link
            href="/dashboard"
            className="mb-2 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 font-semibold text-blue-700"
          >
            <span>▦</span>
            Dashboard
          </Link>

{/* ================= RECHARGE DROPDOWN ================= */}
<details className="group mb-1">
  <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">
    <div className="flex items-center gap-3">
      <span>📱</span>
      <span>Recharge</span>
    </div>

    <span className="text-lg transition-transform duration-200 group-open:rotate-90">
      ›
    </span>
  </summary>

  <div className="ml-6 mt-1 border-l-2 border-blue-100 pl-3">
    <Link
      href="/service1/mobile-prepaid"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
    >
      <span>📲</span>

      <div>
        <p className="font-semibold">
          Mobile Prepaid
        </p>
        <p className="text-xs text-gray-400">
          Mobile Recharge
        </p>
      </div>
    </Link>

    <Link
      href="/service1/dth"
      className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
    >
      <span>📺</span>

      <div>
        <p className="font-semibold">
          DTH Recharge
        </p>
        <p className="text-xs text-gray-400">
          DTH Customer Recharge
        </p>
      </div>
    </Link>
  </div>
</details>

{/* ================= BANKING DROPDOWN ================= */}
<details className="group mb-1">
  <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-4 py-3 text-gray-700 transition hover:bg-green-50 hover:text-green-700">
    <div className="flex items-center gap-3">
      <span>🏦</span>
      <span>Banking</span>
    </div>

    <span className="text-lg transition-transform duration-200 group-open:rotate-90">
      ›
    </span>
  </summary>

  <div className="ml-6 mt-1 border-l-2 border-green-100 pl-3">
    {/* AEPS */}
    <details className="group/aeps">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-green-50 hover:text-green-700">
        <div className="flex items-center gap-3">
          <span>🪪</span>
          <span className="font-semibold">AEPS</span>
        </div>

        <span className="transition-transform duration-200 group-open/aeps:rotate-90">
          ›
        </span>
      </summary>

      <div className="ml-5 mt-1 space-y-1 border-l border-gray-200 pl-3">
        <Link
          href="/service2/aeps/withdraw"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-green-50 hover:text-green-700"
        >
          <span>💵</span>
          Cash Withdrawal
        </Link>

        <Link
          href="/service2/aeps/balance"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-green-50 hover:text-green-700"
        >
          <span>💳</span>
          Balance Enquiry
        </Link>

        <Link
          href="/service2/aeps/mini-statement"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-green-50 hover:text-green-700"
        >
          <span>📄</span>
          Mini Statement
        </Link>

        <Link
          href="/service2/aeps/deposit"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-green-50 hover:text-green-700"
        >
          <span>💰</span>
          Cash Deposit
        </Link>
      </div>
    </details>

    {/* Money Transfer */}
    <Link
      href="/service2/money-transfer"
      className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-green-50 hover:text-green-700"
    >
      <span>💸</span>

      <div>
        <p className="font-semibold">
          Money Transfer
        </p>
        <p className="text-xs text-gray-400">
          Bank Transfer
        </p>
      </div>
    </Link>

    {/* UPI Cash */}
    <Link
      href="/service2/upi-cash"
      className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-green-50 hover:text-green-700"
    >
      <span>📲</span>

      <div>
        <p className="font-semibold">
          UPI Cash
        </p>
        <p className="text-xs text-gray-400">
          QR Payment
        </p>
      </div>
    </Link>
  </div>
</details>

          <Link
            href="/travels"
            className="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span>✈️</span>
            Travels
          </Link>

          <Link
            href="/utility"
            className="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span>💡</span>
            Utility
          </Link>

          <Link
            href="/wallet"
            className="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span>👛</span>
            Settlement
          </Link>

          <Link
            href="/history"
            className="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span>📋</span>
            Reports / History
          </Link>

          <Link
            href="/account"
            className="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span>👤</span>
            Account Details
          </Link>

          <Link
            href="/kyc"
            className="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <span>🪪</span>
            KYC
          </Link>

          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-green-700 hover:bg-green-50"
            >
              <span>🛡️</span>
              Admin Panel
            </Link>
          )}
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <section className="px-5 py-7 lg:ml-[240px] lg:px-8">
        {/* Heading */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-1 rounded bg-emerald-500" />

              <h2 className="text-2xl font-extrabold text-slate-800">
                ALL SERVICES
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              RY MULTI SERVICE की सभी services एक ही जगह।
            </p>
          </div>

          {/* Search UI */}
          <div className="flex w-full items-center rounded-full border bg-white px-5 py-3 shadow-sm md:w-[300px]">
            <span className="mr-3">🔍</span>

            <input
              type="text"
              placeholder="Search service..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* ================= HERO BANNER ================= */}
        <div className="mt-7 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-7 py-10 text-white shadow">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                RY MULTI SERVICE
              </p>

              <h3 className="mt-3 text-3xl font-extrabold md:text-4xl">
                Everything You Need,
                <br />
                Right at Your Fingertips
              </h3>

              <p className="mt-4 max-w-xl text-blue-100">
                Recharge, Utility, Banking, Travels, Wallet और
                account services एक ही platform पर।
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/recharge"
                  className="rounded-lg bg-white px-5 py-3 font-semibold text-blue-700"
                >
                  Start Recharge
                </Link>

                <Link
                  href="/history"
                  className="rounded-lg border border-white px-5 py-3 font-semibold text-white"
                >
                  View History
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-white/15 p-5 backdrop-blur">
                <div className="text-4xl">📱</div>
                <p className="mt-2 text-sm font-semibold">Recharge</p>
              </div>

              <div className="rounded-xl bg-white/15 p-5 backdrop-blur">
                <div className="text-4xl">🏦</div>
                <p className="mt-2 text-sm font-semibold">Banking</p>
              </div>

              <div className="rounded-xl bg-white/15 p-5 backdrop-blur">
                <div className="text-4xl">✈️</div>
                <p className="mt-2 text-sm font-semibold">Travel</p>
              </div>

              <div className="rounded-xl bg-white/15 p-5 backdrop-blur">
                <div className="text-4xl">💡</div>
                <p className="mt-2 text-sm font-semibold">Utility</p>
              </div>

              <div className="rounded-xl bg-white/15 p-5 backdrop-blur">
                <div className="text-4xl">👛</div>
                <p className="mt-2 text-sm font-semibold">Wallet</p>
              </div>

              <div className="rounded-xl bg-white/15 p-5 backdrop-blur">
                <div className="text-4xl">📋</div>
                <p className="mt-2 text-sm font-semibold">History</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TRENDING SERVICES ================= */}
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded bg-emerald-500" />

              <h3 className="text-xl font-extrabold text-slate-800">
                TRENDING SERVICES
              </h3>
            </div>

            <span className="text-sm font-semibold text-gray-500">
              ACTIVE SERVICES
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/recharge"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">📱</div>
              <h4 className="mt-4 text-lg font-bold">Mobile Recharge</h4>
              <p className="mt-2 text-sm text-gray-500">
                Prepaid और DTH recharge।
              </p>
            </Link>

            <Link
              href="/utility"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">💡</div>
              <h4 className="mt-4 text-lg font-bold">Utility Bills</h4>
              <p className="mt-2 text-sm text-gray-500">
                Electricity और Postpaid।
              </p>
            </Link>

            <Link
              href="/banking"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">🏦</div>
              <h4 className="mt-4 text-lg font-bold">Banking</h4>
              <p className="mt-2 text-sm text-gray-500">
                AEPS, Money Transfer और UPI Cash।
              </p>
            </Link>

            <Link
              href="/travels"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">✈️</div>
              <h4 className="mt-4 text-lg font-bold">Travel Booking</h4>
              <p className="mt-2 text-sm text-gray-500">
                Train, Bus, Flight और Hotel।
              </p>
            </Link>

            <Link
              href="/wallet"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">👛</div>
              <h4 className="mt-4 text-lg font-bold">Wallet</h4>
              <p className="mt-2 text-sm text-gray-500">
                Add Money और Settlement setup।
              </p>
            </Link>

            <Link
              href="/account"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">👤</div>
              <h4 className="mt-4 text-lg font-bold">Account</h4>
              <p className="mt-2 text-sm text-gray-500">
                Profile और password settings।
              </p>
            </Link>

            <Link
              href="/kyc"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">🪪</div>
              <h4 className="mt-4 text-lg font-bold">KYC</h4>
              <p className="mt-2 text-sm text-gray-500">
                KYC status और verification।
              </p>
            </Link>

            <Link
              href="/history"
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">📊</div>
              <h4 className="mt-4 text-lg font-bold">Reports</h4>
              <p className="mt-2 text-sm text-gray-500">
                Booking और transaction history।
              </p>
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-4xl">🛡️</div>
                <h4 className="mt-4 text-lg font-bold text-green-900">
                  Admin Panel
                </h4>
                <p className="mt-2 text-sm text-green-700">
                  Retailer और distributor management।
                </p>
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}