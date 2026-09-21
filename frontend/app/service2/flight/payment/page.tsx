"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

type TravelStatusResponse = {
  success?: boolean;
  message?: string;
  services?: {
    flight?: {
      success?: boolean;
      message?: string;
      data?: {
        configured?: boolean;
        available?: boolean;
        status?: string;
        message?: string;
      };
    };
  };
};

function FlightPaymentContent() {
  const searchParams = useSearchParams();

  // ====================================================
  // FLIGHT
  // ====================================================

  const flightId = searchParams.get("flightId") || "";
  const airlineName = searchParams.get("airlineName") || "";
  const airlineCode = searchParams.get("airlineCode") || "";
  const flightNumber = searchParams.get("flightNumber") || "";

  const from = searchParams.get("from") || "";
  const fromName = searchParams.get("fromName") || "";

  const to = searchParams.get("to") || "";
  const toName = searchParams.get("toName") || "";

  const departureTime =
    searchParams.get("departureTime") || "";

  const arrivalTime =
    searchParams.get("arrivalTime") || "";

  const duration =
    searchParams.get("duration") || "";

  const stops = Number(
    searchParams.get("stops") || "0"
  );

  const cabinClass =
    searchParams.get("cabinClass") || "ECONOMY";

  const refundable =
    searchParams.get("refundable") === "true";

  const journeyDate =
    searchParams.get("journeyDate") || "";

  // ====================================================
  // PASSENGERS
  // ====================================================

  const adults = Number(
    searchParams.get("adults") || "1"
  );

  const children = Number(
    searchParams.get("children") || "0"
  );

  const infants = Number(
    searchParams.get("infants") || "0"
  );

  const passengerName =
    searchParams.get("passengerName") || "";

  const passengerAge = Number(
    searchParams.get("passengerAge") || "0"
  );

  const passengerGender =
    searchParams.get("passengerGender") || "";

  const passengerMobile =
    searchParams.get("passengerMobile") || "";

  // ====================================================
  // DEMO FARE
  // ====================================================

  const requestedBaseFare = Number(
    searchParams.get("baseFare") || "0"
  );

  const requestedTaxes = Number(
    searchParams.get("taxes") || "0"
  );

  const requestedConvenienceFee = Number(
    searchParams.get("convenienceFee") || "0"
  );

  const requestedTotalAmount = Number(
    searchParams.get("totalAmount") || "0"
  );

  const currency =
    searchParams.get("currency") || "INR";

  // ====================================================
  // STATE
  // ====================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // HELPERS
  // ====================================================

  function money(value: number) {
    return value.toLocaleString("en-IN");
  }

  function formatDate(value: string) {
    if (!value) {
      return "-";
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  // ====================================================
  // PROVIDER CHECK
  // ====================================================

  async function handleContinue() {
    if (loading) {
      return;
    }

    setError("");

    if (
      !flightId ||
      !airlineName ||
      !flightNumber ||
      !from ||
      !to ||
      !journeyDate ||
      !passengerName ||
      !passengerMobile ||
      requestedTotalAmount <= 0
    ) {
      setError(
        "Flight booking details पूरी नहीं हैं।"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/internal/travel/status",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: TravelStatusResponse =
        await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Travel provider status check नहीं हो पाया।"
        );
        return;
      }

      const flightStatus =
        data.services?.flight?.data;

      const providerReady =
        flightStatus?.configured === true &&
        flightStatus?.available === true &&
        flightStatus?.status === "ACTIVE";

      if (!providerReady) {
        setError(
          "Flight booking provider अभी active नहीं है। इसलिए transaction और payment शुरू नहीं किया गया है।"
        );
        return;
      }

      // IMPORTANT:
      // Provider registry ACTIVE होना अकेले पर्याप्त नहीं है.
      // वास्तविक authorized booking workflow implement और verify
      // होने तक transaction/payment शुरू नहीं करना है.

      setError(
        "Flight provider active है, लेकिन live flight booking workflow अभी implement नहीं हुआ है। इसलिए transaction और payment शुरू नहीं किया गया है।"
      );
    } catch (error) {
      console.error(
        "FLIGHT PROVIDER STATUS ERROR:",
        error
      );

      setError(
        "Flight provider status check नहीं हो पाया। इसलिए transaction और payment शुरू नहीं किया गया है।"
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // INVALID DATA
  // ====================================================

  if (
    !flightId ||
    !airlineName ||
    !flightNumber ||
    !from ||
    !to ||
    !journeyDate ||
    !passengerName ||
    requestedTotalAmount <= 0
  ) {
    return (
      <main className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-blue-700"
            >
              RY MULTI SERVICE
            </Link>

            <Link
              href="/service2/flight"
              className="text-gray-600 hover:text-blue-600"
            >
              Flight Search
            </Link>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <div className="text-5xl">
              ❌
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              Flight Review Details नहीं मिलीं
            </h2>

            <p className="text-gray-600 mt-2">
              कृपया पहले demo flight select करके passenger details पूरी करें।
            </p>

            <Link
              href="/service2/flight"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              ← Flight Search पर जाएँ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-blue-700"
          >
            RY MULTI SERVICE
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/service2/flight"
              className="text-gray-600 hover:text-blue-600"
            >
              Flight Search
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            ✈️ Flight Booking Review
          </h1>

          <p className="text-gray-600 mt-2">
            Demo flight और passenger details review करें।
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-bold text-amber-800">
              Demo / Setup Mode
            </p>

            <p className="text-sm text-amber-800 mt-1">
              यह live airline booking या live fare नहीं है।
              Authorized flight provider और verified booking workflow
              उपलब्ध होने तक कोई transaction या payment शुरू नहीं होगा।
            </p>
          </div>

          {/* FLIGHT DETAILS */}

          <section className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {airlineName}
                </h2>

                <p className="text-gray-500 mt-1">
                  {airlineCode}
                  {" • "}
                  {flightNumber}
                </p>
              </div>

              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                {cabinClass}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {departureTime}
                </p>

                <p className="text-sm text-gray-500">
                  {from}
                  {" • "}
                  {fromName}
                </p>
              </div>

              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500">
                  {duration}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <div className="h-px bg-gray-300 flex-1" />

                  <span className="text-blue-600">
                    ✈️
                  </span>

                  <div className="h-px bg-gray-300 flex-1" />
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {stops === 0
                    ? "Non-stop"
                    : `${stops} stop`}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {arrivalTime}
                </p>

                <p className="text-sm text-gray-500">
                  {to}
                  {" • "}
                  {toName}
                </p>
              </div>
            </div>

            <div className="border-t mt-6 pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  Journey Date
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {formatDate(journeyDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Passengers
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {adults + children + infants}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Demo Booking Type
                </p>

                <p className="font-semibold mt-1">
                  <span
                    className={
                      refundable
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {refundable
                      ? "Demo: Refundable"
                      : "Demo: Non-refundable"}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* PASSENGER */}

          <section className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900">
              👤 Primary Passenger
            </h2>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-gray-500">
                  Name
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {passengerName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Age
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {passengerAge}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Gender
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {passengerGender}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Mobile
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {passengerMobile}
                </p>
              </div>
            </div>
          </section>

          {/* DEMO FARE */}

          <section className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900">
              💳 Demo Fare Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-5">
                <span className="text-gray-600">
                  Demo Base Fare
                </span>

                <span className="font-semibold">
                  ₹{money(requestedBaseFare)}
                </span>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-gray-600">
                  Demo Taxes
                </span>

                <span className="font-semibold">
                  ₹{money(requestedTaxes)}
                </span>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-gray-600">
                  Demo Convenience Fee
                </span>

                <span className="font-semibold">
                  ₹{money(requestedConvenienceFee)}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between gap-5">
                <span className="text-xl font-bold text-gray-900">
                  Demo Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹{money(requestedTotalAmount)}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                <p className="font-semibold">
                  Booking Status
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
                ? "Checking Provider..."
                : "Check Provider & Continue"}
            </button>

            <Link
              href={`/service2/flight/details?${new URLSearchParams(
                {
                  flightId,
                  airlineCode,
                  airlineName,
                  flightNumber,
                  from,
                  fromName,
                  to,
                  toName,
                  departureTime,
                  arrivalTime,
                  duration,
                  stops: String(stops),
                  cabinClass,
                  refundable: String(refundable),
                  journeyDate,
                  adults: String(adults),
                  children: String(children),
                  infants: String(infants),
                  passengerName,
                  passengerAge: String(
                    passengerAge
                  ),
                  passengerGender,
                  passengerMobile,
                  baseFare: String(
                    requestedBaseFare
                  ),
                  taxes: String(
                    requestedTaxes
                  ),
                  convenienceFee: String(
                    requestedConvenienceFee
                  ),
                  totalAmount: String(
                    requestedTotalAmount
                  ),
                  currency,
                }
              ).toString()}`}
              className="block w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg text-center"
            >
              ← Change Passenger Details
            </Link>

            <p className="text-center text-xs text-gray-500 mt-6">
              No payment will be started until an authorized
              flight provider workflow is implemented and verified.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function FlightPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-600">
            Flight review page load हो रहा है...
          </p>
        </main>
      }
    >
      <FlightPaymentContent />
    </Suspense>
  );
}