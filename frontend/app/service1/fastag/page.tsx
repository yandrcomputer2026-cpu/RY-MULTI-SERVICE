"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function FastagRechargePage() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

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

    if (!provider) {
      setError("FASTag provider select करें।");
      return;
    }

    if (
      !Number.isFinite(rechargeAmount) ||
      rechargeAmount < 1
    ) {
      setError("Valid recharge amount भरें।");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/recharge/fastag",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicleNumber: cleanVehicleNumber,
            provider,
            amount: rechargeAmount,
          }),
        }
      );

      const data = await response.json();

      console.log("FASTAG API RESPONSE:", data);

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "FASTag transaction create नहीं हो पाया।"
        );

        setLoading(false);
        return;
      }

      if (!data.transactionId) {
        setError("Transaction ID प्राप्त नहीं हुई।");

        setLoading(false);
        return;
      }

      setMessage(
        `FASTag transaction successfully create हो गया। Transaction ID: ${data.transactionId}`
      );

      setVehicleNumber("");
      setProvider("");
      setAmount("");

      setLoading(false);
    } catch (error) {
      console.error("FASTAG FORM ERROR:", error);

      setError(
        "Server से संपर्क नहीं हो पाया। कृपया दोबारा प्रयास करें।"
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/utility"
              className="text-gray-600 hover:text-blue-600"
            >
              Utility
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            🚗 FASTag Recharge
          </h2>

          <p className="mt-2 text-gray-600">
            Vehicle FASTag recharge service.
          </p>
        </div>

        {/* SETUP NOTICE */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-800">
            FASTag Setup Mode
          </h3>

          <p className="mt-2 text-sm text-amber-700">
            अभी FASTag transaction create किया जा सकता है।
            Live recharge और payment completion के लिए
            authorized FASTag provider API integration अभी बाकी है।
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow"
        >
          <h3 className="mb-6 text-xl font-bold text-gray-900">
            Recharge Details
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                    event.target.value.toUpperCase()
                  )
                }
                disabled={loading}
                placeholder="UP65AB1234"
                maxLength={15}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* PROVIDER */}
            <div>
              <label
                htmlFor="provider"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                FASTag Provider
              </label>

              <select
                id="provider"
                value={provider}
                onChange={(event) =>
                  setProvider(event.target.value)
                }
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Provider</option>
                <option value="HDFC_BANK">
                  HDFC Bank
                </option>
                <option value="ICICI_BANK">
                  ICICI Bank
                </option>
                <option value="IDFC_FIRST_BANK">
                  IDFC FIRST Bank
                </option>
                <option value="AXIS_BANK">
                  Axis Bank
                </option>
                <option value="SBI">
                  State Bank of India
                </option>
                <option value="KOTAK_BANK">
                  Kotak Mahindra Bank
                </option>
                <option value="OTHER">
                  Other Provider
                </option>
              </select>
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
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  disabled={loading}
                  placeholder="500"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* MESSAGE */}
          {message && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading
              ? "Transaction बन रही है..."
              : "Create FASTag Transaction →"}
          </button>
        </form>

        {/* BACK */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white hover:bg-gray-900"
          >
            ← Dashboard पर वापस जाएँ
          </Link>
        </div>
      </div>
    </main>
  );
}