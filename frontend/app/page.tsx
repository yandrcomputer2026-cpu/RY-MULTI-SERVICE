import Image from "next/image";
import Link from "next/link";

const services = [
  {
    icon: "📱",
    title: "Mobile Recharge",
    description: "Prepaid और Postpaid mobile services.",
  },
  {
    icon: "📺",
    title: "DTH Recharge",
    description: "DTH recharge services एक ही platform पर.",
  },
  {
    icon: "💡",
    title: "Utility Bills",
    description: "Electricity और supported utility bill services.",
  },
  {
    icon: "🚗",
    title: "FASTag",
    description: "FASTag recharge और related services.",
  },
  {
    icon: "🏦",
    title: "AEPS",
    description: "Supported AEPS banking services.",
  },
  {
    icon: "💸",
    title: "Money Transfer",
    description: "Money transfer और cash deposit services.",
  },
  {
    icon: "📲",
    title: "UPI Cash",
    description: "Supported UPI based banking services.",
  },
  {
    icon: "✈️",
    title: "Travel Booking",
    description: "Train, Bus, Flight और Hotel booking.",
  },
];

const bankingServices = [
  {
    icon: "🪪",
    title: "AEPS",
    description: "Cash Withdrawal, Balance Enquiry और Mini Statement.",
  },
  {
    icon: "💸",
    title: "Money Transfer",
    description: "Supported money transfer service workflow.",
  },
  {
    icon: "💰",
    title: "Cash Deposit",
    description: "Provider based cash deposit services.",
  },
  {
    icon: "📲",
    title: "UPI Cash",
    description: "Supported UPI Cash service module.",
  },
];

const travelServices = [
  {
    icon: "🚆",
    title: "Train Booking",
    description: "Train related booking services.",
  },
  {
    icon: "🚌",
    title: "Bus Booking",
    description: "Bus search और booking services.",
  },
  {
    icon: "✈️",
    title: "Flight Booking",
    description: "Flight search और booking workflow.",
  },
  {
    icon: "🏨",
    title: "Hotel Booking",
    description: "Hotel search और booking services.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <div className="bg-[#020817] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 text-[11px] sm:px-6 sm:text-xs">
          <p className="font-medium text-slate-300">
            RY MULTI SERVICE • Digital Services Platform
          </p>

          <div className="hidden items-center gap-6 text-slate-300 sm:flex">
            <span>🔒 Secure Account Access</span>
            <span>⚡ Simple Digital Services</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6">
          {/* BRAND */}
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
              <Image
                src="/ry-logo.jpg"
                alt="RY MULTI SERVICE Logo"
                width={70}
                height={70}
                priority
                className="h-full w-full object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-xl font-black tracking-tight text-blue-700">
                RY MULTI SERVICE
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Digital Services Platform
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 lg:flex">
            <Link href="/" className="text-blue-600">
              Home
            </Link>

            <a
              href="#services"
              className="transition hover:text-blue-600"
            >
              Services
            </a>

            <a
              href="#banking"
              className="transition hover:text-blue-600"
            >
              Banking
            </a>

            <a
              href="#travel"
              className="transition hover:text-blue-600"
            >
              Travel
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-blue-600"
            >
              How It Works
            </a>
          </nav>

          {/* ACCOUNT BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl border-2 border-blue-600 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:px-5"
            >
              <span className="hidden sm:inline">Create Account</span>
              <span className="sm:hidden">Register</span>
            </Link>
          </div>
        </div>

        {/* MOBILE QUICK NAV */}
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-5 py-2.5 text-xs font-bold text-slate-600">
            <a href="#services" className="whitespace-nowrap">
              Services
            </a>
            <a href="#banking" className="whitespace-nowrap">
              Banking
            </a>
            <a href="#travel" className="whitespace-nowrap">
              Travel
            </a>
            <a href="#how-it-works" className="whitespace-nowrap">
              How It Works
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 md:py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
          {/* HERO LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Welcome to RY Multi Service
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.07] tracking-tight text-slate-950 sm:text-5xl lg:text-[58px]">
              One Platform for
              <span className="mt-1 block bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Digital Services
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Recharge, utility payments, banking और travel services को
              एक modern digital platform से access करें।
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
              >
                Create Account →
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-bold text-slate-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700"
              >
                Login to Dashboard
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Secure Access
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Multiple Services
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Easy Dashboard
              </span>
            </div>
          </div>

          {/* HERO RIGHT */}
          <div className="mx-auto w-full max-w-[470px]">
            <div className="rounded-[30px] border border-white/80 bg-white p-3 shadow-[0_25px_70px_-20px_rgba(37,99,235,0.28)]">
              {/* BLUE BRAND CARD */}
              <div className="rounded-[24px] bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-500 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg">
                    <Image
                      src="/ry-logo.jpg"
                      alt="RY MULTI SERVICE"
                      width={100}
                      height={100}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100">
                      Digital Platform
                    </p>

                    <h2 className="mt-1 text-xl font-black sm:text-2xl">
                      RY MULTI SERVICE
                    </h2>

                    <p className="mt-1 text-sm text-blue-100">
                      Your Digital Service Partner
                    </p>
                  </div>
                </div>
              </div>

              {/* SERVICE MINI CARDS */}
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                  Available Categories
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ["📱", "Recharge"],
                    ["🏦", "Banking"],
                    ["💡", "Utility"],
                    ["✈️", "Travel"],
                  ].map(([icon, title]) => (
                    <div
                      key={title}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="text-2xl">{icon}</div>
                      <p className="mt-2 text-sm font-black text-slate-900">
                        {title}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className="mt-4 block rounded-xl bg-slate-950 px-5 py-3.5 text-center text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Get Started with RY →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICE STRIP
      ===================================================== */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-6 lg:grid-cols-4">
          {[
            ["📲", "Recharge", "Mobile & DTH"],
            ["🏦", "Banking", "AEPS & Transfer"],
            ["💡", "Utility", "Bills & FASTag"],
            ["✈️", "Travel", "Train • Bus • Flight"],
          ].map(([icon, title, subtitle], index) => (
            <div
              key={title}
              className={`p-5 text-center ${
                index !== 3 ? "lg:border-r lg:border-slate-200" : ""
              }`}
            >
              <div className="text-2xl">{icon}</div>
              <p className="mt-2 font-black text-slate-900">
                {title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ===================================================== */}
      <section
        id="services"
        className="mx-auto max-w-7xl scroll-mt-28 px-5 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
            Our Services
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            One Platform, Multiple Services
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            RY MULTI SERVICE के माध्यम से अलग-अलग digital service
            categories को एक ही dashboard से access करें।
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-3xl transition duration-300 group-hover:scale-110">
                {service.icon}
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                {service.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          BANKING
      ===================================================== */}
      <section
        id="banking"
        className="scroll-mt-28 bg-[#07111f] text-white"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-cyan-300">
              Banking Solutions
            </div>

            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
              Banking Services Through
              <span className="block text-cyan-400">
                One Dashboard
              </span>
            </h2>

            <p className="mt-5 max-w-xl leading-8 text-slate-300">
              Supported provider configuration और authorization के अनुसार
              banking modules को RY MULTI SERVICE dashboard से access करें।
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-500"
            >
              Access Dashboard →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {bankingServices.map((service) => (
              <div
                key={service.title}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.1]"
              >
                <div className="text-3xl">{service.icon}</div>

                <h3 className="mt-4 text-lg font-black">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          TRAVEL
      ===================================================== */}
      <section
        id="travel"
        className="scroll-mt-28 bg-gradient-to-b from-white to-blue-50/70"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
              Travel Services
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Travel Services in One Place
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Train, bus, flight और hotel services के लिए dedicated travel
              modules.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {travelServices.map((service) => (
              <div
                key={service.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl transition group-hover:scale-110">
                  {service.icon}
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-900">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section
        id="how-it-works"
        className="scroll-mt-28 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
              Getting Started
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-200">
                01
              </div>

              <h3 className="mt-6 text-xl font-black">
                Create Account
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                RY MULTI SERVICE पर अपना account create करें।
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-xl font-black text-white shadow-lg shadow-cyan-200">
                02
              </div>

              <h3 className="mt-6 text-xl font-black">
                Complete Setup
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                आवश्यक account और service setup पूरा करें।
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white shadow-lg">
                03
              </div>

              <h3 className="mt-6 text-xl font-black">
                Access Services
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Login करके उपलब्ध services को dashboard से access करें।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="bg-slate-50 px-5 py-16 sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-500 px-6 py-14 text-center text-white shadow-2xl sm:px-10">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              RY MULTI SERVICE
            </p>

            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-4xl">
              Access Digital Services From One Platform
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
              अपना account create करें या existing account से login करके
              RY MULTI SERVICE dashboard access करें।
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-white px-7 py-3.5 font-black text-blue-700 shadow-lg transition hover:-translate-y-1"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-white/50 bg-white/10 px-7 py-3.5 font-black text-white transition hover:bg-white/20"
              >
                Login to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="bg-[#020817] text-slate-300">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* BRAND */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-white p-1">
                  <Image
                    src="/ry-logo.jpg"
                    alt="RY MULTI SERVICE Logo"
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-xl font-black text-white">
                    RY MULTI SERVICE
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Digital Services Platform
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                Recharge, utility, banking और travel related digital
                services के लिए integrated service platform.
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="font-black text-white">
                Quick Links
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
                <Link href="/" className="transition hover:text-cyan-400">
                  Home
                </Link>

                <a
                  href="#services"
                  className="transition hover:text-cyan-400"
                >
                  Services
                </a>

                <Link
                  href="/login"
                  className="transition hover:text-cyan-400"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="transition hover:text-cyan-400"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* SERVICES */}
            <div>
              <h3 className="font-black text-white">
                Our Services
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
                <span>Recharge & Bills</span>
                <span>Banking Services</span>
                <span>Travel Booking</span>
                <span>Wallet Services</span>
              </div>
            </div>
          </div>

          {/* FOOTER BOTTOM */}
          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} RY MULTI SERVICE. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-5">
              <span>Privacy Policy</span>
              <span>Terms & Conditions</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}