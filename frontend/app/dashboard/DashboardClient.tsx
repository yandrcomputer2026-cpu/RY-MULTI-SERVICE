"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import WalletBalance from "./WalletBalance";

type DashboardClientProps = {
  user: {
    id: number;
    userCode: string | null;
    name: string;
    email: string;
    mobile: string;
    role: string;
  };
  walletBalance: number;
};

type MenuLinkProps = {
  href: string;
  icon: string;
  label: string;
  collapsed: boolean;
  active?: boolean;
};

function MenuLink({
  href,
  icon,
  label,
  collapsed,
  active = false,
}: MenuLinkProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-xl py-3 transition ${
        collapsed
          ? "justify-center px-2"
          : "gap-3 px-4"
      } ${
        active
          ? "bg-blue-50 font-bold text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center text-xl">
        {icon}
      </span>

      {!collapsed && (
        <span className="whitespace-nowrap text-sm font-semibold">
          {label}
        </span>
      )}
    </Link>
  );
}

type DropdownProps = {
  icon: string;
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
};

function Dropdown({
  icon,
  label,
  collapsed,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        title={label}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center rounded-xl px-2 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
      >
        <span className="flex h-7 w-7 items-center justify-center text-xl">
          {icon}
        </span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center text-xl">
            {icon}
          </span>

          <span className="text-sm font-semibold">{label}</span>
        </div>

        <span
          className={`text-xl transition-transform ${
            open ? "rotate-90" : ""
          }`}
        >
          ›
        </span>
      </button>

      {open && (
        <div className="ml-8 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
          {children}
        </div>
      )}
    </div>
  );
}

function SubLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
    >
      <span>{icon}</span>

      <div>
        <p className="font-semibold">{title}</p>

        {subtitle && (
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        )}
      </div>
    </Link>
  );
}

function ServiceCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition group-hover:scale-110">
        {icon}
      </div>

      <h3 className="mt-4 font-black text-slate-900 transition group-hover:text-blue-700">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-xs font-black text-blue-600">
        Open Service →
      </p>
    </Link>
  );
}

export default function DashboardClient({
  user,
  walletBalance,
}: DashboardClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
        {/* MOBILE SIDEBAR OVERLAY */}
{mobileMenuOpen && (
  <button
    type="button"
    aria-label="Close mobile menu"
    onClick={() => setMobileMenuOpen(false)}
    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
  />
)}
      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside
  className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white shadow-xl transition-all duration-300 ${
    mobileMenuOpen
      ? "translate-x-0"
      : "-translate-x-full"
  } w-[280px] lg:translate-x-0 lg:shadow-sm ${
    collapsed ? "lg:w-[86px]" : "lg:w-[250px]"
  }`}
>
        {/* ================= LOGO / SIDEBAR HEADER ================= */}
<div
  className={`flex h-[82px] shrink-0 items-center border-b border-slate-200 ${
    collapsed
      ? "lg:justify-center lg:px-2"
      : "justify-between px-4"
  }`}
>
  {/* BRAND */}
  <Link
    href="/dashboard"
    onClick={() => setMobileMenuOpen(false)}
    className={`flex min-w-0 items-center ${
      collapsed ? "lg:justify-center" : "gap-3"
    }`}
  >
    <img
      src="/ry-logo.jpg"
      alt="RY MULTI SERVICE"
      className="h-12 w-12 shrink-0 rounded-lg object-contain"
    />

    {/* Mobile पर हमेशा नाम दिखेगा।
        Desktop collapsed होने पर नाम hide होगा. */}
    <div className={collapsed ? "lg:hidden" : ""}>
      <h1 className="whitespace-nowrap text-lg font-black leading-none text-blue-700">
        RY MULTI
      </h1>

      <p className="mt-1 whitespace-nowrap text-[10px] font-black tracking-[0.18em] text-slate-500">
        SERVICE
      </p>
    </div>
  </Link>

  {/* MOBILE CLOSE BUTTON */}
  <button
    type="button"
    onClick={() => setMobileMenuOpen(false)}
    aria-label="Close menu"
    title="Close Menu"
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 lg:hidden"
  >
    ✕
  </button>

  {/* DESKTOP COLLAPSE BUTTON */}
  {!collapsed && (
    <button
      type="button"
      onClick={() => setCollapsed(true)}
      title="Collapse Sidebar"
      aria-label="Collapse sidebar"
      className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 lg:flex"
    >
      ‹
    </button>
  )}
</div>

{/* ================= DESKTOP COLLAPSED OPEN BUTTON ================= */}
{collapsed && (
  <div className="hidden px-3 pt-3 lg:block">
    <button
      type="button"
      onClick={() => setCollapsed(false)}
      title="Open Sidebar"
      aria-label="Open sidebar"
      className="flex w-full items-center justify-center rounded-xl border border-blue-100 bg-blue-50 py-2.5 font-black text-blue-700 transition hover:bg-blue-100"
    >
      ›
    </button>
  </div>
)}

        {/* MENU */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <MenuLink
            href="/dashboard"
            icon="▦"
            label="Dashboard"
            collapsed={collapsed}
            active
          />

          <Dropdown
            icon="📱"
            label="Recharge"
            collapsed={collapsed}
          >
            <SubLink
              href="/service1/mobile-prepaid"
              icon="📲"
              title="Mobile Prepaid"
              subtitle="Mobile Recharge"
            />

            <SubLink
              href="/service1/dth"
              icon="📺"
              title="DTH Recharge"
              subtitle="DTH Customer Recharge"
            />
          </Dropdown>

          <Dropdown
            icon="🏦"
            label="Banking"
            collapsed={collapsed}
          >
            <SubLink
              href="/service2/aeps/withdraw"
              icon="💵"
              title="AEPS Withdrawal"
            />

            <SubLink
              href="/service2/aeps/balance"
              icon="💳"
              title="Balance Enquiry"
            />

            <SubLink
              href="/service2/aeps/mini-statement"
              icon="📄"
              title="Mini Statement"
            />

            <SubLink
              href="/service2/aeps/deposit"
              icon="💰"
              title="Cash Deposit"
            />

            <SubLink
              href="/service2/money-transfer"
              icon="💸"
              title="Money Transfer"
              subtitle="Bank Transfer"
            />

            <SubLink
              href="/service2/upi-cash"
              icon="📲"
              title="UPI Cash"
              subtitle="QR Payment"
            />
          </Dropdown>

          <Dropdown
            icon="✈️"
            label="Travels"
            collapsed={collapsed}
          >
            <SubLink
              href="/service2/train"
              icon="🚆"
              title="Train Booking"
            />

            <SubLink
              href="/service2/bus"
              icon="🚌"
              title="Bus Booking"
            />

            <SubLink
              href="/service2/flight"
              icon="✈️"
              title="Flight Booking"
            />

            <SubLink
              href="/service2/hotel"
              icon="🏨"
              title="Hotel Booking"
            />
          </Dropdown>

          <Dropdown
            icon="💡"
            label="Utility"
            collapsed={collapsed}
          >
            <SubLink
              href="/service1/electricity"
              icon="⚡"
              title="Electricity Bill"
              subtitle="Bill Payment"
            />

            <SubLink
              href="/service1/mobile-postpaid"
              icon="📱"
              title="Mobile Postpaid"
              subtitle="Postpaid Bill Payment"
            />
          </Dropdown>

          <Dropdown
            icon="👛"
            label="Manage Wallet"
            collapsed={collapsed}
          >
            <SubLink
              href="/wallet"
              icon="👛"
              title="Wallet"
              subtitle="Wallet Details"
            />

            <SubLink
              href="/wallet"
              icon="➕"
              title="Add Money"
              subtitle="Wallet Funding"
            />

            <SubLink
              href="/wallet"
              icon="🏦"
              title="Bank Settlement"
              subtitle="Settlement Setup"
            />
          </Dropdown>

          <MenuLink
            href="/history"
            icon="📋"
            label="Reports / History"
            collapsed={collapsed}
          />

          <Dropdown
            icon="👤"
            label="Account Details"
            collapsed={collapsed}
          >
            <SubLink
              href="/account"
              icon="👤"
              title="My Profile"
            />

            <SubLink
              href="/change-password"
              icon="🔐"
              title="Change Password"
            />

            <SubLink
              href="/history"
              icon="📋"
              title="My History"
            />
          </Dropdown>

          <MenuLink
            href="/kyc"
            icon="🪪"
            label="KYC"
            collapsed={collapsed}
          />

          {user.role === "ADMIN" && (
            <MenuLink
              href="/admin"
              icon="🛡️"
              label="Admin Panel"
              collapsed={collapsed}
            />
          )}
        </nav>

        {/* SIDEBAR USER */}
        <div className="border-t border-slate-200 p-3">
          {!collapsed ? (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="truncate text-sm font-black text-slate-800">
                {user.name}
              </p>

              <p className="mt-1 truncate text-[11px] text-slate-500">
                {user.userCode || user.email}
              </p>

              <p className="mt-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-blue-700">
                {user.role.replaceAll("_", " ")}
              </p>
            </div>
          ) : (
            <Link
              href="/account"
              title={user.name}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-50 text-xl"
            >
              👤
            </Link>
          )}
        </div>
      </aside>

      {/* =====================================================
          PAGE AREA
      ====================================================== */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:ml-[86px]" : "lg:ml-[250px]"
        }`}
      >
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[82px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <button
  type="button"
  onClick={() => setMobileMenuOpen(true)}
  aria-label="Open menu"
  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 lg:hidden"
>
  ☰
</button>
            {/* MOBILE LOGO */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 lg:hidden"
            >
              <img
                src="/ry-logo.jpg"
                alt="RY MULTI SERVICE"
                className="h-10 w-10 object-contain"
              />

              <div className="hidden sm:block">
                <p className="text-sm font-black text-blue-700">
                  RY MULTI
                </p>
                <p className="text-[9px] font-bold tracking-wider text-slate-500">
                  SERVICE
                </p>
              </div>
            </Link>

            <div className="hidden lg:block">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Welcome Back
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-800">
                {user.name}
              </h2>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden md:block">
  <WalletBalance balance={walletBalance} />
</div>

              <Link
                href="/wallet"
                className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 sm:px-5"
              >
                + Add Money
              </Link>

              <Link
                href="/account"
                title="My Account"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:bg-slate-50"
              >
                👤
              </Link>

              <LogoutButton />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="px-4 py-7 sm:px-6 lg:px-8">
          {/* HEADING */}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                RY MULTI SERVICE
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                All Services
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Recharge, Banking, Utility, Travel और Wallet services एक ही
                dashboard पर।
              </p>
            </div>

            <div className="flex w-full max-w-sm items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="mr-3">🔍</span>

              <input
                type="text"
                placeholder="Search service..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>
          </div>

          {/* HERO */}
          <div className="relative mt-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10 lg:py-10">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 right-40 h-52 w-52 rounded-full bg-white/5" />

            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Services Available
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                  Everything You Need,
                  <br />
                  Right at Your Fingertips
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100">
                  Recharge, Utility, Banking, Travels, Wallet और account
                  services को एक professional platform से manage करें।
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/service1/mobile-prepaid"
                    className="rounded-xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
                  >
                    Start Recharge
                  </Link>

                  <Link
                    href="/history"
                    className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20"
                  >
                    View History
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  ["📱", "Recharge"],
                  ["🏦", "Banking"],
                  ["✈️", "Travel"],
                  ["💡", "Utility"],
                  ["👛", "Wallet"],
                  ["📊", "Reports"],
                ].map(([icon, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm sm:p-5"
                  >
                    <div className="text-3xl sm:text-4xl">{icon}</div>
                    <p className="mt-2 text-xs font-bold sm:text-sm">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QUICK ACCESS */}
          <div className="mt-9">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Quick Access
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Frequently used RY MULTI SERVICE features
                </p>
              </div>

              <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 sm:block">
                Active Services
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ServiceCard
                href="/service1/mobile-prepaid"
                icon="📱"
                title="Mobile Recharge"
                description="Prepaid mobile recharge और operator services।"
              />

              <ServiceCard
                href="/service1/electricity"
                icon="💡"
                title="Utility Bills"
                description="Electricity और postpaid bill payment services।"
              />

              <ServiceCard
                href="/service2/aeps/withdraw"
                icon="🏦"
                title="Banking"
                description="AEPS, Money Transfer और UPI Cash services।"
              />

              <ServiceCard
                href="/service2/flight"
                icon="✈️"
                title="Travel Booking"
                description="Train, Bus, Flight और Hotel booking services।"
              />

              <ServiceCard
                href="/wallet"
                icon="👛"
                title="Wallet"
                description="Wallet balance, Add Money और settlement।"
              />

              <ServiceCard
                href="/account"
                icon="👤"
                title="My Account"
                description="Profile और account information manage करें।"
              />

              <ServiceCard
                href="/kyc"
                icon="🪪"
                title="KYC"
                description="KYC status और verification details देखें।"
              />

              <ServiceCard
                href="/history"
                icon="📊"
                title="Reports"
                description="Transaction और booking history देखें।"
              />

              {user.role === "ADMIN" && (
                <ServiceCard
                  href="/admin"
                  icon="🛡️"
                  title="Admin Panel"
                  description="Users, FSE, wallets और platform management।"
                />
              )}
            </div>
          </div>

          {/* ACCOUNT STATUS */}
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Account Information
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-400">Account Holder</p>
                  <p className="mt-1 font-black text-slate-800">
                    {user.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">User ID</p>
                  <p className="mt-1 font-black text-slate-800">
                    {user.userCode || `RY-${user.id}`}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Account Type</p>
                  <p className="mt-1 font-black text-blue-700">
                    {user.role.replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                Account Status
              </p>

              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xl">
                  ✓
                </span>

                <div>
                  <p className="font-black text-emerald-900">Active</p>
                  <p className="text-xs text-emerald-700">
                    Account access available
                  </p>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} RY MULTI SERVICE
          </footer>
        </section>
      </div>
    </main>
  );
}