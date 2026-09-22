"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    console.log("LOGIN BUTTON CLICKED");

    if (loading) return;

    setMessage("");

    // User Code / Mobile Number
    const cleanIdentifier = identifier.trim().toUpperCase();
    const cleanPassword = password;

    // =========================================
    // VALIDATION
    // =========================================

    if (!cleanIdentifier) {
      setMessage(
        "User Code या Registered Mobile Number डालना जरूरी है।"
      );
      return;
    }

    // अगर number डाला है तो 10 digits होना चाहिए
    if (
      /^\d+$/.test(cleanIdentifier) &&
      !/^\d{10}$/.test(cleanIdentifier)
    ) {
      setMessage("सही 10 digit Registered Mobile Number डालें।");
      return;
    }

    if (!cleanPassword) {
      setMessage("Password डालना जरूरी है।");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending login request...");

      // =========================================
      // LOGIN API
      // =========================================

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password: cleanPassword,
        }),
      });

      console.log("Login status:", response.status);

      const text = await response.text();

      console.log("LOGIN API RESPONSE:", text);

      let data: {
        success?: boolean;
        message?: string;
        user?: {
          id: number;
          userCode?: string | null;
          name: string;
          mobile: string;
          email: string;
        };
      };

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON response:", error);

        setMessage(
          "Login API ने सही response नहीं दिया। Browser Console और Terminal check करें।"
        );

        return;
      }

      // =========================================
      // LOGIN FAILED
      // =========================================

      if (!response.ok) {
        setMessage(
          data.message ||
            "User Code / Mobile Number या Password गलत है।"
        );
        return;
      }

      // =========================================
      // LOGIN SUCCESS
      // =========================================

      console.log("LOGIN SUCCESS:", data);

      setMessage("Login successfully हो गया।");

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setMessage(
        "Server से connect नहीं हो पाया। Terminal में error check करें।"
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // ENTER KEY LOGIN
  // =========================================

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  }

  const isSuccess = message.includes("successfully");

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================= TOP BAR ================= */}

      <div className="bg-[#020817] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-[11px] sm:px-6 sm:text-xs">
          <p className="font-medium text-slate-300">
            RY MULTI SERVICE • Digital Services Platform
          </p>

          <div className="hidden items-center gap-5 text-slate-300 sm:flex">
            <span>🔒 Secure Account Access</span>
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

      {/* ================= LOGIN AREA ================= */}

      <section className="relative overflow-hidden">
        {/* Background Decoration */}

        <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-200/50 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-109px)] max-w-7xl items-center gap-12 px-5 py-10 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:py-14">
          {/* ================= LEFT SIDE ================= */}

          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Welcome Back
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-black leading-[1.08] tracking-tight text-slate-950">
              Access Your

              <span className="mt-1 block bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">
                Digital Dashboard
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              अपने RY MULTI SERVICE account में login करके उपलब्ध
              digital services और account features access करें।
            </p>

            {/* Feature Cards */}

            <div className="mt-9 grid max-w-xl grid-cols-2 gap-4">
              {/* Recharge */}

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  📱
                </div>

                <h3 className="mt-4 font-black text-slate-900">
                  Recharge & Bills
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Digital payment services
                </p>
              </div>

              {/* Banking */}

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                  🏦
                </div>

                <h3 className="mt-4 font-black text-slate-900">
                  Banking
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Supported banking modules
                </p>
              </div>

              {/* Travel */}

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-2xl">
                  ✈️
                </div>

                <h3 className="mt-4 font-black text-slate-900">
                  Travel
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Travel booking services
                </p>
              </div>

              {/* Wallet */}

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                  👛
                </div>

                <h3 className="mt-4 font-black text-slate-900">
                  Wallet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Wallet management
                </p>
              </div>
            </div>
          </div>

          {/* ================= LOGIN CARD ================= */}

          <div className="mx-auto w-full max-w-[470px]">
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
                      Account Login
                    </p>

                    <h2 className="mt-1 text-xl font-black sm:text-2xl">
                      RY MULTI SERVICE
                    </h2>

                    <p className="mt-1 text-xs text-blue-100">
                      Secure account access
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= FORM ================= */}

              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  User Code या registered mobile number से login करें।
                </p>

                {/* ================= IDENTIFIER ================= */}

                <div className="mt-7">
                  <label
                    htmlFor="identifier"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    User Code / Registered Mobile Number
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      👤
                    </span>

                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) =>
                        setIdentifier(e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="RY100001 or 10 digit mobile number"
                      autoComplete="username"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-4 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    अपना User Code या registered mobile number दर्ज करें।
                  </p>
                </div>

                {/* ================= PASSWORD ================= */}

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="text-sm font-bold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/change-password"
                      className="text-xs font-bold text-blue-600 transition hover:text-blue-800"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔒
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-blue-600 transition hover:text-blue-800 disabled:opacity-50"
                    >
                      {showPassword
                        ? "HIDE"
                        : "SHOW"}
                    </button>
                  </div>
                </div>

                {/* ================= MESSAGE ================= */}

                {message && (
                  <div
                    role="alert"
                    className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${
                      isSuccess
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span>
                        {isSuccess ? "✓" : "⚠️"}
                      </span>

                      <span>{message}</span>
                    </div>
                  </div>
                )}

                {/* ================= LOGIN BUTTON ================= */}

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="mt-7 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                      Logging in...
                    </span>
                  ) : (
                    "Login to Dashboard →"
                  )}
                </button>

                {/* ================= DIVIDER ================= */}

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    New User
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* ================= REGISTER ================= */}

                <Link
                  href="/register"
                  className="block w-full rounded-xl border-2 border-blue-100 bg-blue-50 px-5 py-3.5 text-center text-sm font-black text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                >
                  Create New Account
                </Link>

                {/* Security Note */}

                <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                  <span>🔒</span>

                  <span>
                    Secure account login
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Home */}

            <div className="mt-6 text-center lg:hidden">
              <Link
                href="/"
                className="text-sm font-bold text-slate-600 transition hover:text-blue-600"
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