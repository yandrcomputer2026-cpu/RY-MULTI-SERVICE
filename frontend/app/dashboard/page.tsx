import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import WalletBalance from "./WalletBalance";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

type ServiceCardProps = {
  href: string;
  icon: string;
  title: string;
  subtitle?: string;
};

function ServiceCard({
  href,
  icon,
  title,
  subtitle,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[118px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-2xl transition group-hover:bg-blue-50">
        {icon}
      </div>

      <p className="mt-3 text-sm font-bold leading-5 text-slate-800 transition group-hover:text-blue-700">
        {title}
      </p>

      {subtitle && (
        <p className="mt-1 text-[11px] leading-4 text-slate-400">
          {subtitle}
        </p>
      )}
    </Link>
  );
}

function SectionTitle({
  title,
  rightText,
}: {
  title: string;
  rightText?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-emerald-500" />

        <h2 className="text-base font-black tracking-wide text-slate-800 sm:text-lg">
          {title}
        </h2>
      </div>

      {rightText && (
        <span className="hidden text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:block">
          {rightText}
        </span>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      availableBalance: true,
    },
  });

  const walletBalance = Number(wallet?.availableBalance ?? 0);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[225px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-[78px] items-center border-b border-slate-100 px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <Image
                src="/ry-logo.jpg"
                alt="RY MULTI SERVICE"
                width={70}
                height={70}
                priority
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight text-blue-700">
                RY MULTI
              </p>
              <p className="text-xs font-extrabold tracking-[0.18em] text-slate-500">
                SERVICE
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Main Menu
          </p>

          <nav>
            <Link
              href="/dashboard"
              className="mb-1 flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                ▦
              </span>
              My Dashboard
            </Link>

            {/* RECHARGE */}
            <details className="group mb-1">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                    📱
                  </span>
                  Recharge
                </div>

                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>

              <div className="ml-6 border-l border-slate-200 py-1 pl-3">
                <Link
                  href="/service1/mobile-prepaid"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Mobile Prepaid
                </Link>

                <Link
                  href="/service1/dth"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  DTH Recharge
                </Link>
              </div>
            </details>

            {/* BANKING */}
            <details className="group mb-1">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                    🏦
                  </span>
                  Banking
                </div>

                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>

              <div className="ml-6 border-l border-slate-200 py-1 pl-3">
                <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  AEPS
                </p>

                <Link
                  href="/service2/aeps/withdraw"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Cash Withdrawal
                </Link>

                <Link
                  href="/service2/aeps/balance"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Balance Enquiry
                </Link>

                <Link
                  href="/service2/aeps/mini-statement"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Mini Statement
                </Link>

                <Link
                  href="/service2/aeps/deposit"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Cash Deposit
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <Link
                  href="/service2/money-transfer"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Money Transfer
                </Link>

                <Link
                  href="/service2/upi-cash"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  UPI Cash
                </Link>
              </div>
            </details>

            {/* TRAVEL */}
            <details className="group mb-1">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50">
                    ✈️
                  </span>
                  Travel
                </div>

                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>

              <div className="ml-6 border-l border-slate-200 py-1 pl-3">
                <Link
                  href="/service2/train"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Train Booking
                </Link>

                <Link
                  href="/service2/bus"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Bus Booking
                </Link>

                <Link
                  href="/service2/flight"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Flight Booking
                </Link>

                <Link
                  href="/service2/hotel"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Hotel Booking
                </Link>
              </div>
            </details>

            {/* UTILITY */}
            <details className="group mb-1">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-amber-700">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
                    💡
                  </span>
                  Utility
                </div>

                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>

              <div className="ml-6 border-l border-slate-200 py-1 pl-3">
                <Link
                  href="/service1/electricity"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  Electricity Bill
                </Link>

                <Link
                  href="/service1/mobile-postpaid"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  Mobile Postpaid
                </Link>

                <Link
                  href="/service1/fastag"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  FASTag Recharge
                </Link>
              </div>
            </details>

            {/* WALLET */}
            <details className="group mb-1">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-purple-700">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                    👛
                  </span>
                  Manage Wallet
                </div>

                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>

              <div className="ml-6 border-l border-slate-200 py-1 pl-3">
                <Link
                  href="/wallet"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                >
                  Wallet
                </Link>

                <Link
                  href="/wallet/add-money"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                >
                  Add Money
                </Link>

                <Link
                  href="/wallet/bank-settlement"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                >
                  Bank Settlement
                </Link>
              </div>
            </details>

            <Link
              href="/history"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                📊
              </span>
              Reports / History
            </Link>

            {/* ACCOUNT */}
            <details className="group mb-1">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                    👤
                  </span>
                  Account
                </div>

                <span className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>

              <div className="ml-6 border-l border-slate-200 py-1 pl-3">
                <Link
                  href="/account"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  My Profile
                </Link>

                <Link
                  href="/change-password"
                  className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Change Password
                </Link>
              </div>
            </details>

            <Link
              href="/kyc"
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                🪪
              </span>
              KYC
            </Link>

            {user.role === "ADMIN" && (
              <>
                <p className="mb-2 mt-5 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Administration
                </p>

                <Link
                  href="/admin"
                  className="mb-1 flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                    🛡️
                  </span>
                  Admin Panel
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div className="border-t border-slate-100 p-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="truncate text-xs font-bold text-slate-800">
              {user.name}
            </p>

            {user.userCode && (
              <p className="mt-1 text-[11px] font-semibold text-blue-600">
                {user.userCode}
              </p>
            )}

            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
              {user.role}
            </p>
          </div>
        </div>
      </aside>

      {/* =====================================================
          TOP HEADER
      ====================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:ml-[225px]">
        <div className="flex min-h-[70px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
          {/* Mobile Logo */}
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2 lg:hidden"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-white">
              <Image
                src="/ry-logo.jpg"
                alt="RY MULTI SERVICE"
                width={55}
                height={55}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-black text-blue-700">
                RY MULTI SERVICE
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Digital Services
              </p>
            </div>
          </Link>

          {/* Desktop welcome */}
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-400">
              Welcome back
            </p>

            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-800">
                {user.name}
              </h1>

              {user.userCode && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                  {user.userCode}
                </span>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
<div className="hidden md:block">
  <WalletBalance balance={walletBalance} />
</div>
            <Link
              href="/wallet/add-money"
              className="rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 sm:px-4"
            >
              + Add Money
            </Link>

            <Link
              href="/account"
              title="My Account"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-lg transition hover:bg-blue-100"
            >
              👤
            </Link>

            <div className="hidden sm:block">
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Mobile quick navigation */}
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
          <Link
            href="/dashboard"
            className="whitespace-nowrap rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/service1/mobile-prepaid"
            className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"
          >
            Recharge
          </Link>

          <Link
            href="/service2/aeps/withdraw"
            className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"
          >
            Banking
          </Link>

          <Link
            href="/service2/flight"
            className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"
          >
            Travel
          </Link>

          <Link
            href="/service1/electricity"
            className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"
          >
            Utility
          </Link>

          <Link
            href="/wallet"
            className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"
          >
            Wallet
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <section className="px-4 py-5 sm:px-6 lg:ml-[225px] lg:px-7">
        {/* Heading + Search appearance */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-emerald-500" />

              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800">
                  ALL SERVICES
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  RY MULTI SERVICE digital service portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-sm items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <span className="mr-2 text-sm">🔍</span>

            <input
              type="text"
              placeholder="Search service..."
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* =================================================
            COMPACT HERO
        ================================================== */}
        <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 shadow-lg shadow-blue-100">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 right-28 h-64 w-64 rounded-full bg-white/10" />

          <div className="relative grid items-center gap-6 px-6 py-7 md:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                RY MULTI SERVICE
              </div>

              <h2 className="mt-3 max-w-xl text-2xl font-black leading-tight text-white sm:text-3xl">
                Digital Services,
                <br className="hidden sm:block" /> One Professional Platform
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Recharge, Banking, Travel, Utility और Wallet services को
                एक ही dashboard से access करें।
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/service1/mobile-prepaid"
                  className="rounded-lg bg-white px-4 py-2.5 text-xs font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  Mobile Recharge
                </Link>

                <Link
                  href="/history"
                  className="rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  View History
                </Link>
              </div>
            </div>

            <div className="hidden grid-cols-3 gap-2 md:grid">
              {[
                ["📱", "Recharge"],
                ["🏦", "Banking"],
                ["✈️", "Travel"],
                ["💡", "Utility"],
                ["👛", "Wallet"],
                ["📊", "Reports"],
              ].map(([icon, title]) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/10 bg-white/10 px-2 py-3 text-center backdrop-blur"
                >
                  <div className="text-2xl">{icon}</div>
                  <p className="mt-1 text-[10px] font-bold text-white">
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =================================================
            TRENDING SERVICES
        ================================================== */}
        <div className="mt-7">
          <SectionTitle
            title="TRENDING SERVICES"
            rightText="Available Services"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8">
            <ServiceCard
              href="/service1/mobile-prepaid"
              icon="📱"
              title="Mobile Recharge"
            />

            <ServiceCard
              href="/service2/aeps/withdraw"
              icon="💵"
              title="AEPS Withdrawal"
            />

            <ServiceCard
              href="/service2/money-transfer"
              icon="💸"
              title="Money Transfer"
            />

            <ServiceCard
              href="/service1/electricity"
              icon="⚡"
              title="Electricity Bill"
            />

            <ServiceCard
              href="/service2/train"
              icon="🚆"
              title="Train Booking"
            />

            <ServiceCard
              href="/service2/flight"
              icon="✈️"
              title="Flight Booking"
            />

            <ServiceCard
              href="/wallet/add-money"
              icon="➕"
              title="Add Money"
            />

            <ServiceCard
              href="/history"
              icon="📊"
              title="Reports"
            />
          </div>
        </div>

        {/* =================================================
            BANKING SERVICES
        ================================================== */}
        <div className="mt-8">
          <SectionTitle title="BANKING SERVICES" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            <ServiceCard
              href="/service2/aeps/withdraw"
              icon="💵"
              title="Cash Withdrawal"
              subtitle="AEPS"
            />

            <ServiceCard
              href="/service2/aeps/balance"
              icon="💳"
              title="Balance Enquiry"
              subtitle="AEPS"
            />

            <ServiceCard
              href="/service2/aeps/mini-statement"
              icon="📄"
              title="Mini Statement"
              subtitle="AEPS"
            />

            <ServiceCard
              href="/service2/aeps/deposit"
              icon="💰"
              title="Cash Deposit"
              subtitle="AEPS"
            />

            <ServiceCard
              href="/service2/money-transfer"
              icon="💸"
              title="Money Transfer"
              subtitle="Provider Setup"
            />

            <ServiceCard
              href="/service2/upi-cash"
              icon="📲"
              title="UPI Cash"
              subtitle="Provider Setup"
            />
          </div>
        </div>

        {/* =================================================
            TRAVEL SERVICES
        ================================================== */}
        <div className="mt-8">
          <SectionTitle title="TRAVEL SERVICES" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ServiceCard
              href="/service2/train"
              icon="🚆"
              title="Train Booking"
            />

            <ServiceCard
              href="/service2/bus"
              icon="🚌"
              title="Bus Booking"
            />

            <ServiceCard
              href="/service2/flight"
              icon="✈️"
              title="Flight Booking"
            />

            <ServiceCard
              href="/service2/hotel"
              icon="🏨"
              title="Hotel Booking"
            />
          </div>
        </div>

        {/* =================================================
            UTILITY / RECHARGE
        ================================================== */}
        <div className="mt-8">
          <SectionTitle title="UTILITY & RECHARGE SERVICES" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <ServiceCard
              href="/service1/mobile-prepaid"
              icon="📲"
              title="Mobile Prepaid"
            />

            <ServiceCard
              href="/service1/dth"
              icon="📺"
              title="DTH Recharge"
            />

            <ServiceCard
              href="/service1/electricity"
              icon="⚡"
              title="Electricity Bill"
            />

            <ServiceCard
              href="/service1/mobile-postpaid"
              icon="📱"
              title="Mobile Postpaid"
            />

            <ServiceCard
              href="/service1/fastag"
              icon="🚗"
              title="FASTag Recharge"
            />
          </div>
        </div>

        {/* =================================================
            WALLET / ACCOUNT
        ================================================== */}
        <div className="mt-8">
          <SectionTitle title="WALLET & ACCOUNT SERVICES" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
            <ServiceCard
              href="/wallet"
              icon="👛"
              title="My Wallet"
            />

            <ServiceCard
              href="/wallet/add-money"
              icon="➕"
              title="Add Money"
            />

            <ServiceCard
              href="/wallet/bank-settlement"
              icon="🏦"
              title="Bank Settlement"
            />

            <ServiceCard
              href="/account"
              icon="👤"
              title="My Profile"
            />

            <ServiceCard
              href="/change-password"
              icon="🔐"
              title="Change Password"
            />

            <ServiceCard
              href="/kyc"
              icon="🪪"
              title="KYC"
            />

            <ServiceCard
              href="/history"
              icon="📋"
              title="History"
            />
          </div>
        </div>

        {/* =================================================
            ADMIN
        ================================================== */}
        {user.role === "ADMIN" && (
          <div className="mt-8">
            <SectionTitle title="ADMINISTRATION" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              <ServiceCard
                href="/admin"
                icon="🛡️"
                title="Admin Panel"
                subtitle="Management"
              />
            </div>
          </div>
        )}

        {/* =================================================
            MOBILE LOGOUT
        ================================================== */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 sm:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-800">
                {user.name}
              </p>

              {user.userCode && (
                <p className="mt-1 text-xs font-bold text-blue-600">
                  {user.userCode}
                </p>
              )}
            </div>

            <LogoutButton />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} RY MULTI SERVICE • Digital Services
          Platform
        </footer>
      </section>
    </main>
  );
}