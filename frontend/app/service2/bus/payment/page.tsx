"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type TravelHealth = {
  configured?: boolean;
  available?: boolean;
  status?: string;
  message?: string;
};

type TravelStatusResponse = {
  success?: boolean;
  message?: string;
  services?: {
    bus?: TravelHealth;
  };
};

function BusPaymentContent() {
  const searchParams = useSearchParams();

  const transactionId =
    searchParams.get("transactionId");

  const amount =
    searchParams.get("amount");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleContinue() {
    if (!transactionId || !amount || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // ==========================================
      // CHECK BUS PROVIDER BEFORE PAYMENT
      // ==========================================

      const statusResponse = await fetch(
        "/api/internal/travel/status",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const statusData: TravelStatusResponse =
        await statusResponse.json();

      if (
        !statusResponse.ok ||
        !statusData.success
      ) {
        setError(
          statusData.message ||
            "Bus provider status check नहीं हो सका।"
        );
        return;
      }

      const busStatus =
        statusData.services?.bus;

      if (
        !busStatus ||
        busStatus.configured !== true ||
        busStatus.available !== true ||
        busStatus.status !== "ACTIVE"
      ) {
        setError(
          "Bus booking provider अभी active नहीं है। इसलिए payment शुरू नहीं किया गया है।"
        );
        return;
      }

      // ==========================================
      // LIVE WORKFLOW NOT IMPLEMENTED
      // ==========================================

      setError(
        "Bus provider active है, लेकिन live bus booking workflow अभी implement नहीं हुआ है। इसलिए payment शुरू नहीं किया गया है।"
      );
    } catch (error) {
      console.error(
        "BUS PROVIDER CHECK ERROR:",
        error
      );

      setError(
        "Bus provider status check में समस्या हुई। Payment शुरू नहीं किया गया है।"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!transactionId || !amount) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="text-5xl">
            ❌
          </div>

          <h1 className="text-2xl font-bold text-red-600 mt-4">
            Invalid Bus Booking
          </h1>

          <p className="text-gray-600 mt-3">
            Bus booking/payment details उपलब्ध नहीं हैं।
          </p>

          <Link
            href="/service2/bus"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            ← Bus Search पर वापस जाएँ
          </Link>
        </div>
      </main>
    );
  }

  const displayAmount = Number(amount);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <Link
            href="/service2/bus"
            className="text-gray-600 hover:text-blue-600"
          >
            Bus Search
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            🚌 Bus Booking Review
          </h2>

          <p className="text-gray-500 text-center mt-2">
            Demo booking amount देखें। Payment केवल
            authorized Bus provider और complete live
            booking workflow उपलब्ध होने के बाद शुरू होगा।
          </p>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                Demo Booking Amount
              </span>

              <span className="text-2xl font-bold text-gray-900">
                ₹
                {Number.isFinite(displayAmount)
                  ? displayAmount.toFixed(2)
                  : "0.00"}
              </span>
            </div>

            <div className="border-t border-blue-200 mt-5 pt-5">
              <p className="text-sm text-gray-600">
                Internal Transaction ID
              </p>

              <p className="font-semibold text-blue-700 mt-1 break-all">
                {transactionId}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-800">
              Demo / Setup Mode
            </p>

            <p className="mt-1 text-sm text-amber-800">
              दिखाई गई bus, seat और fare live provider
              inventory नहीं माने जाएँगे। Actual seat
              availability और fare provider से verify किए
              बिना payment या confirmed booking जारी नहीं
              की जाएगी।
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-semibold">
                Bus Booking
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg"
          >
            {loading
              ? "Provider Check हो रहा है..."
              : "Check Provider & Continue"}
          </button>

          <Link
            href="/service2/bus"
            className="block w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg text-center"
          >
            ← Bus Search पर वापस जाएँ
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BusPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-gray-600">
            Bus booking details load हो रही हैं...
          </div>
        </main>
      }
    >
      <BusPaymentContent />
    </Suspense>
  );
}