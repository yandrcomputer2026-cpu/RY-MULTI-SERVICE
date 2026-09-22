"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [registeredUserCode, setRegisteredUserCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "mobile"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setRegisteredUserCode("");

    const cleanName = form.name.trim();
    const cleanMobile = form.mobile.trim();
    const cleanEmail = form.email.trim().toLowerCase();

    if (!cleanName) {
      setMessage("Full Name डालना जरूरी है।");
      return;
    }

    if (!/^\d{10}$/.test(cleanMobile)) {
      setMessage("सही 10 digit Mobile Number डालें।");
      return;
    }

    if (!cleanEmail) {
      setMessage("Email Address डालना जरूरी है।");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password कम से कम 6 characters का होना चाहिए।");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Password और Confirm Password समान नहीं हैं।");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          mobile: cleanMobile,
          email: cleanEmail,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data: {
        message?: string;
        user?: {
          id: number;
          userCode: string | null;
          name: string;
          mobile: string;
          email: string;
        };
      } = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      if (!data.user?.userCode) {
        setMessage(
          "Account बन गया है, लेकिन RY User Code प्राप्त नहीं हुआ।"
        );
        return;
      }

      setRegisteredUserCode(data.user.userCode);
      setMessage("Account successfully create हो गया।");
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      setMessage("Server से connect नहीं हो पाया।");
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = Boolean(registeredUserCode);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================= TOP BAR ================= */}
      <div className="bg-[#020817] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-[11px] sm:px-6 sm:text-xs">
          <p className="font-medium text-slate-300">
            RY MULTI SERVICE • Digital Services Platform
          </p>

          <div className="hidden items-center gap-5 text-slate-300 sm:flex">
            <span>🔒 Secure Registration</span>
            <span>⚡ Digital Services Platform</span>
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-xl bg-white">
              <Image
                src="/ry-logo.jpg"
                alt="RY MULTI SERVICE Logo"
                width={70}
                height={70}
                priority
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-blue-700 sm:text-xl">
                RY MULTI SERVICE
              </p>

              <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:block">
                Digital Services Platform
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* ================= MAIN AREA ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-[450px] w-[450px] rounded-full bg-cyan-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-10 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:py-14">
          {/* ================= LEFT SIDE ================= */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Create Your Account
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-black leading-[1.08] tracking-tight text-slate-950">
              Start Your
              <span className="mt-1 block bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">
                Digital Journey
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              RY MULTI SERVICE पर अपना account बनाकर उपलब्ध digital
              services को एक ही platform से access करें।
            </p>

            <div className="mt-9 space-y-4">
              <div className="flex max-w-xl items-start gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  👤
                </div>

                <div>
                  <h3 className="font-black text-slate-900">One Account</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    एक account से dashboard और उपलब्ध services access करें।
                  </p>
                </div>
              </div>

              <div className="flex max-w-xl items-start gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  🔒
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Secure Account
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Password-protected account access और secure session.
                  </p>
                </div>
              </div>

              <div className="flex max-w-xl items-start gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-xl">
                  ⚡
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Multiple Services
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Recharge, utility, banking और travel modules एक जगह।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= REGISTER CARD ================= */}
          <div className="mx-auto w-full max-w-[540px]">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_25px_70px_-20px_rgba(37,99,235,0.25)]">
              {/* CARD HEADER */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-7 py-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-[70px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg">
                    <Image
                      src="/ry-logo.jpg"
                      alt="RY MULTI SERVICE"
                      width={90}
                      height={90}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                      {isSuccess ? "Registration Complete" : "New Account"}
                    </p>

                    <h2 className="mt-1 text-xl font-black sm:text-2xl">
                      RY MULTI SERVICE
                    </h2>

                    <p className="mt-1 text-xs text-blue-100">
                      {isSuccess
                        ? "Your account is ready"
                        : "Create your digital service account"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= CARD BODY ================= */}
              <div className="p-6 sm:p-8">
                {isSuccess ? (
                  /* =========================================
                     REGISTRATION SUCCESS SCREEN
                  ========================================= */
                  <div>
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-2xl font-black text-white">
                          ✓
                        </div>
                      </div>

                      <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                        Account Successfully Created
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        आपका RY MULTI SERVICE account सफलतापूर्वक बन गया है।
                      </p>
                    </div>

                    {/* USER CODE */}
                    <div className="mt-7 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 text-center">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                        Your RY User Code
                      </p>

                      <div className="mt-3 rounded-xl border border-blue-200 bg-white px-4 py-5 shadow-sm">
                        <p className="break-all text-3xl font-black tracking-[0.12em] text-blue-700 sm:text-4xl">
                          {registeredUserCode}
                        </p>
                      </div>

                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        यह आपका unique RY Login ID है।
                      </p>
                    </div>

                    {/* IMPORTANT NOTE */}
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">⚠️</span>

                        <div>
                          <p className="text-sm font-black text-amber-900">
                            इस User Code को सुरक्षित रखें
                          </p>

                          <p className="mt-1 text-sm leading-6 text-amber-800">
                            भविष्य में login करने के लिए आप अपने{" "}
                            <strong>RY User Code</strong> या{" "}
                            <strong>Registered Mobile Number</strong> का उपयोग
                            कर सकते हैं।
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* LOGIN BUTTON */}
                    <Link
                      href="/login"
                      className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      Continue to Login →
                    </Link>

                    <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                      Login के समय अपना RY User Code / Registered Mobile
                      Number और password दर्ज करें।
                    </p>
                  </div>
                ) : (
                  /* =========================================
                     REGISTRATION FORM
                  ========================================= */
                  <>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">
                      Create Account
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Registration के लिए अपनी सही details दर्ज करें।
                    </p>

                    <form onSubmit={handleSubmit}>
                      {/* NAME + MOBILE */}
                      <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-bold text-slate-700"
                          >
                            Full Name
                          </label>

                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                              👤
                            </span>

                            <input
                              id="name"
                              name="name"
                              type="text"
                              value={form.name}
                              onChange={handleChange}
                              placeholder="Full name"
                              autoComplete="name"
                              disabled={loading}
                              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="mobile"
                            className="mb-2 block text-sm font-bold text-slate-700"
                          >
                            Mobile Number
                          </label>

                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                              📱
                            </span>

                            <input
                              id="mobile"
                              name="mobile"
                              type="tel"
                              inputMode="numeric"
                              value={form.mobile}
                              onChange={handleChange}
                              placeholder="10 digit number"
                              maxLength={10}
                              autoComplete="tel"
                              disabled={loading}
                              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* EMAIL */}
                      <div className="mt-5">
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-bold text-slate-700"
                        >
                          Email Address
                        </label>

                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                            ✉️
                          </span>

                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            autoComplete="email"
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                            required
                          />
                        </div>
                      </div>

                      {/* PASSWORD */}
                      <div className="mt-5">
                        <label
                          htmlFor="password"
                          className="mb-2 block text-sm font-bold text-slate-700"
                        >
                          Password
                        </label>

                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                            🔒
                          </span>

                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
                            autoComplete="new-password"
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                            required
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((value) => !value)
                            }
                            disabled={loading}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {showPassword ? "HIDE" : "SHOW"}
                          </button>
                        </div>
                      </div>

                      {/* CONFIRM PASSWORD */}
                      <div className="mt-5">
                        <label
                          htmlFor="confirmPassword"
                          className="mb-2 block text-sm font-bold text-slate-700"
                        >
                          Confirm Password
                        </label>

                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                            🛡️
                          </span>

                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={
                              showConfirmPassword ? "text" : "password"
                            }
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Enter password again"
                            autoComplete="new-password"
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                            required
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((value) => !value)
                            }
                            disabled={loading}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {showConfirmPassword ? "HIDE" : "SHOW"}
                          </button>
                        </div>
                      </div>

                      {/* ERROR MESSAGE */}
                      {message && (
                        <div
                          role="alert"
                          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                        >
                          <div className="flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{message}</span>
                          </div>
                        </div>
                      )}

                      {/* SUBMIT */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-7 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {loading ? (
                          <span className="flex items-center gap-3">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Creating Account...
                          </span>
                        ) : (
                          "Create My Account →"
                        )}
                      </button>
                    </form>

                    {/* EXISTING USER */}
                    <div className="my-6 flex items-center gap-4">
                      <div className="h-px flex-1 bg-slate-200" />

                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Existing User
                      </span>

                      <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <Link
                      href="/login"
                      className="block w-full rounded-xl border-2 border-blue-100 bg-blue-50 px-5 py-3.5 text-center text-sm font-black text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                    >
                      Login to Existing Account
                    </Link>

                    <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                      <span>🔒</span>
                      <span>
                        Create your account using your own details.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 text-center lg:hidden">
              <Link
                href="/"
                className="text-sm font-bold text-slate-600 hover:text-blue-600"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} RY MULTI SERVICE. All rights reserved.
          </p>

          <p>Digital Services Platform</p>
        </div>
      </footer>
    </main>
  );
}