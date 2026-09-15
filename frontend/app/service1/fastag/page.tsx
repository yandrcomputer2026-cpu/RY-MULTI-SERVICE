"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type FastagProviderStatus =
  | "NOT_CONFIGURED"
  | "TEST_MODE"
  | "ACTIVE"
  | "INACTIVE"
  | "ERROR";

interface FastagStatusResponse {
  success: boolean;
  message: string;
  provider?: string;
  data?: {
    configured: boolean;
    available: boolean;
    status: FastagProviderStatus;
    message: string;
  };
  errorCode?: string;
}

export default function FastagRechargePage() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [amount, setAmount] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [providerLoading, setProviderLoading] = useState(true);
  const [providerError, setProviderError] = useState("");
  const [providerName, setProviderName] = useState(
    "FASTag Provider",
  );
  const [providerStatus, setProviderStatus] =
    useState<FastagProviderStatus>("NOT_CONFIGURED");
  const [providerConfigured, setProviderConfigured] =
    useState(false);
  const [providerAvailable, setProviderAvailable] =
    useState(false);

  // ======================================================
  // LOAD INTERNAL FASTAG PROVIDER STATUS
  // ======================================================
  useEffect(() => {
    let active = true;

    async function loadProviderStatus() {
      try {
        setProviderLoading(true);
        setProviderError("");

        const response = await fetch(
          "/api/internal/fastag/status",
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as FastagStatusResponse;

        if (!active) {
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          setProviderStatus("ERROR");
          setProviderConfigured(false);
          setProviderAvailable(false);

          setProviderError(
            result.message ||
              "FASTag provider status load नहीं हो सका.",
          );

          return;
        }

        setProviderName(
          result.provider || "FASTag Provider",
        );

        setProviderStatus(result.data.status);
        setProviderConfigured(result.data.configured);
        setProviderAvailable(result.data.available);
      } catch (statusError) {
        console.error(
          "FASTAG PROVIDER STATUS LOAD ERROR:",
          statusError,
        );

        if (!active) {
          return;
        }

        setProviderStatus("ERROR");
        setProviderConfigured(false);
        setProviderAvailable(false);

        setProviderError(
          "FASTag provider status check failed.",
        );
      } finally {
        if (active) {
          setProviderLoading(false);
        }
      }
    }

    loadProviderStatus();

    return () => {
      active = false;
    };
  }, []);

  // ======================================================
  // FORM VALIDATION
  // ======================================================
  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanVehicleNumber = vehicleNumber
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    const rechargeAmount = Number(amount);

    if (!cleanVehicleNumber) {
      setError("Vehicle number भरना जरूरी है।");
      return;
    }

    if (cleanVehicleNumber.length < 6) {
      setError("Valid vehicle number भरें।");
      return;
    }

    if (
      !Number.isFinite(rechargeAmount) ||
      rechargeAmount < 1
    ) {
      setError("Valid recharge amount भरें।");
      return;
    }

    if (providerLoading) {
      setMessage(
        "FASTag provider status अभी check हो रहा है। कृपया कुछ समय बाद दोबारा प्रयास करें।",
      );
      return;
    }

    if (
      !providerConfigured ||
      !providerAvailable ||
      providerStatus !== "ACTIVE"
    ) {
      setMessage(
        "FASTag provider API अभी active नहीं है। कोई recharge, payment या transaction process नहीं किया गया है।",
      );
      return;
    }

    /*
     * IMPORTANT:
     *
     * Provider ACTIVE होने पर भी यहाँ सीधे payment/recharge
     * शुरू नहीं किया गया है।
     *
     * अगले integration चरण में:
     * 1. Vehicle lookup
     * 2. FASTag issuer/provider validation
     * 3. Recharge quote/request
     * 4. Payment
     * 5. Provider transaction verification
     *
     * server-side internal APIs के माध्यम से जोड़े जाएंगे।
     */

    setMessage(
      "FASTag provider available है, लेकिन live recharge workflow अभी enable नहीं किया गया है। कोई payment या transaction process नहीं किया गया है।",
    );
  }

  // ======================================================
  // DISPLAY VALUES
  // ======================================================
  const providerStatusText = providerLoading
    ? "Checking..."
    : providerStatus === "ACTIVE"
      ? "Active"
      : providerStatus === "TEST_MODE"
        ? "Test Mode"
        : providerStatus === "INACTIVE"
          ? "Inactive"
          : providerStatus === "ERROR"
            ? "Status Error"
            : "Pending";

  const providerStatusClass =
    providerStatus === "ACTIVE"
      ? "text-emerald-600"
      : providerStatus === "ERROR"
        ? "text-red-600"
        : "text-amber-600";

  const liveRechargeEnabled =
    !providerLoading &&
    providerConfigured &&
    providerAvailable &&
    providerStatus === "ACTIVE";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-extrabold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <p className="text-xs font-medium text-gray-400">
              Utility Services
            </p>
          </div>

          <Link
            href="/utility"
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Utility
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* ================= HERO ================= */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 p-7 text-white shadow">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
            RY MULTI SERVICE
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            🚗 FASTag Recharge
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
            FASTag recharge service के लिए provider-ready
            setup। Authorized provider activation के बाद
            live vehicle lookup, recharge और transaction
            verification enable किया जाएगा।
          </p>
        </div>

        {/* ================= SETUP NOTICE ================= */}
        {!liveRechargeEnabled && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>

              <div>
                <h3 className="font-bold text-amber-900">
                  FASTag Provider Setup Required
                </h3>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Authorized FASTag provider API अभी active
                  नहीं है। Provider activation और live
                  workflow integration complete होने तक कोई
                  real FASTag recharge, payment या transaction
                  process नहीं किया जाएगा।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= STATUS API ERROR ================= */}
        {providerError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            Provider Status: {providerError}
          </div>
        )}

        {/* ================= STATUS ================= */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Provider
            </p>

            <p
              className={`mt-2 font-bold ${providerStatusClass}`}
            >
              {providerStatusText}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {providerName}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Vehicle Lookup
            </p>

            <p className="mt-2 font-bold text-amber-600">
              {liveRechargeEnabled
                ? "Integration Pending"
                : "Pending"}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Live Recharge
            </p>

            <p
              className={`mt-2 font-bold ${
                liveRechargeEnabled
                  ? "text-amber-600"
                  : "text-amber-600"
              }`}
            >
              {liveRechargeEnabled
                ? "Workflow Pending"
                : "Disabled"}
            </p>
          </div>
        </div>

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Recharge Details
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Details केवल setup validation के लिए हैं।
              </p>
            </div>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              SETUP MODE
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* VEHICLE NUMBER */}
            <div>
              <label
                htmlFor="vehicleNumber"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Vehicle Number
              </label>

              <input
                id="vehicleNumber"
                type="text"
                value={vehicleNumber}
                onChange={(event) =>
                  setVehicleNumber(
                    event.target.value.toUpperCase(),
                  )
                }
                placeholder="UP65AB1234"
                maxLength={15}
                autoComplete="off"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* AMOUNT */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Recharge Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">
                  ₹
                </span>

                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="500"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* ================= PROVIDER INFO ================= */}
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h4 className="text-sm font-bold text-blue-900">
              Provider Selection
            </h4>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              FASTag issuer/provider list को hard-code नहीं
              किया गया है। Authorized provider API मिलने के
              बाद supported issuer और vehicle lookup data
              server-side provider adapter से load किए जाएंगे।
            </p>
          </div>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* ================= MESSAGE ================= */}
          {message && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-800">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={providerLoading}
            className="mt-6 rounded-lg bg-slate-800 px-7 py-3 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {providerLoading
              ? "Checking Provider..."
              : "Check Setup →"}
          </button>
        </form>

        {/* ================= PRIVACY / SAFETY ================= */}
        <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">
            Transaction Safety
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Provider integration और complete live workflow
            verification से पहले इस page से कोई payment collect
            नहीं किया जाएगा और कोई successful FASTag recharge
            status generate नहीं किया जाएगा।
          </p>
        </div>

        {/* ================= BACK ================= */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/utility"
            className="inline-flex rounded-lg border bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Utility Services
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-900"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}