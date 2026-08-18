"use client";

import Link from "next/link";
import {
  useSearchParams,
} from "next/navigation";
import {
  Suspense,
  useMemo,
  useState,
} from "react";

// ======================================================
// FLIGHT DETAILS CONTENT
// ======================================================

function FlightDetailsContent() {
  const searchParams =
    useSearchParams();

  // ====================================================
  // FLIGHT DATA
  // ====================================================

  const flightId =
    searchParams.get(
      "flightId"
    ) || "";

  const airlineCode =
    searchParams.get(
      "airlineCode"
    ) || "";

  const airlineName =
    searchParams.get(
      "airlineName"
    ) || "";

  const flightNumber =
    searchParams.get(
      "flightNumber"
    ) || "";

  const from =
    searchParams.get(
      "from"
    ) || "";

  const fromName =
    searchParams.get(
      "fromName"
    ) || "";

  const to =
    searchParams.get(
      "to"
    ) || "";

  const toName =
    searchParams.get(
      "toName"
    ) || "";

  const departureTime =
    searchParams.get(
      "departureTime"
    ) || "";

  const arrivalTime =
    searchParams.get(
      "arrivalTime"
    ) || "";

  const duration =
    searchParams.get(
      "duration"
    ) || "";

  const stops =
    Number(
      searchParams.get(
        "stops"
      ) || "0"
    );

  const cabinClass =
    searchParams.get(
      "cabinClass"
    ) || "ECONOMY";

  const refundable =
    searchParams.get(
      "refundable"
    ) === "true";

  const price =
    Number(
      searchParams.get(
        "price"
      ) || "0"
    );

  const currency =
    searchParams.get(
      "currency"
    ) || "INR";

  const seatsAvailable =
    Number(
      searchParams.get(
        "seatsAvailable"
      ) || "0"
    );

  const journeyDate =
    searchParams.get(
      "journeyDate"
    ) || "";

  // ====================================================
  // PASSENGERS
  // ====================================================

  const adults =
    Number(
      searchParams.get(
        "adults"
      ) || "1"
    );

  const children =
    Number(
      searchParams.get(
        "children"
      ) || "0"
    );

  const infants =
    Number(
      searchParams.get(
        "infants"
      ) || "0"
    );

  // ====================================================
  // FORM STATE
  // ====================================================

  const [passengerName, setPassengerName] =
    useState("");

  const [passengerAge, setPassengerAge] =
    useState("");

  const [passengerGender, setPassengerGender] =
    useState("MALE");

  const [passengerMobile, setPassengerMobile] =
    useState("");

  const [error, setError] =
    useState("");

  // ====================================================
  // TOTAL PASSENGERS
  // ====================================================

  const totalPassengers =
    adults +
    children +
    infants;

  // ====================================================
  // FARE
  // ====================================================

  const fare = useMemo(() => {
    const baseFare =
      price *
      totalPassengers;

    const taxes =
      Math.round(
        baseFare * 0.12
      );

    const convenienceFee =
      50;

    const totalAmount =
      baseFare +
      taxes +
      convenienceFee;

    return {
      baseFare,
      taxes,
      convenienceFee,
      totalAmount,
    };
  }, [
    price,
    totalPassengers,
  ]);

  // ====================================================
  // FORMAT MONEY
  // ====================================================

  function formatMoney(
    value: number
  ) {
    return value.toLocaleString(
      "en-IN"
    );
  }

  // ====================================================
  // DATE
  // ====================================================

  function formatDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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
  // VALIDATION
  // ====================================================

  function validatePassenger() {
    setError("");

    if (!passengerName.trim()) {
      setError(
        "Passenger name डालना जरूरी है।"
      );
      return false;
    }

    const age =
      Number(
        passengerAge
      );

    if (
      !Number.isFinite(
        age
      ) ||
      age < 1 ||
      age > 120
    ) {
      setError(
        "Valid passenger age डालें।"
      );
      return false;
    }

    if (!passengerGender) {
      setError(
        "Passenger gender select करें।"
      );
      return false;
    }

    if (
      !/^[0-9]{10}$/.test(
        passengerMobile.trim()
      )
    ) {
      setError(
        "Valid 10-digit mobile number डालें।"
      );
      return false;
    }

    return true;
  }

  // ====================================================
  // CONTINUE
  // ====================================================

  function continueToPayment() {
    if (
      !validatePassenger()
    ) {
      return;
    }

    const params =
      new URLSearchParams({
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

        stops:
          String(
            stops
          ),

        cabinClass,

        refundable:
          String(
            refundable
          ),

        price:
          String(
            price
          ),

        currency,

        seatsAvailable:
          String(
            seatsAvailable
          ),

        journeyDate,

        adults:
          String(
            adults
          ),

        children:
          String(
            children
          ),

        infants:
          String(
            infants
          ),

        passengerName:
          passengerName.trim(),

        passengerAge:
          String(
            Number(
              passengerAge
            )
          ),

        passengerGender,

        passengerMobile:
          passengerMobile.trim(),

        baseFare:
          String(
            fare.baseFare
          ),

        taxes:
          String(
            fare.taxes
          ),

        convenienceFee:
          String(
            fare.convenienceFee
          ),

        totalAmount:
          String(
            fare.totalAmount
          ),
      });

    window.location.href =
      `/service2/flight/payment?${params.toString()}`;
  }

  // ====================================================
  // INVALID FLIGHT
  // ====================================================

  if (
    !flightId ||
    !from ||
    !to ||
    !journeyDate
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
              Flight Details नहीं मिलीं
            </h2>

            <p className="text-gray-600 mt-2">
              कृपया पहले flight search करके flight select करें।
            </p>

            <Link
              href="/service2/flight"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              ← Flight Search
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ==================================================
          HEADER
          ================================================== */}

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

      {/* ==================================================
          MAIN
          ================================================== */}

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            ✈️ Flight Details
          </h1>

          <p className="text-gray-600 mt-2">
            Flight select करें और passenger details भरें।
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ==================================================
              LEFT
              ================================================== */}

          <div className="lg:col-span-2">

            {/* FLIGHT CARD */}

            <section className="bg-white rounded-xl shadow p-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                {/* AIRLINE */}

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    {airlineName}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {airlineCode}
                    {" • "}
                    {flightNumber}
                  </p>

                </div>

                {/* BADGES */}

                <div className="flex flex-wrap gap-2">

                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {cabinClass}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      refundable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {refundable
                      ? "Refundable"
                      : "Non-refundable"}
                  </span>

                </div>

              </div>

              {/* ROUTE */}

              <div className="mt-8 flex items-center gap-5">

                <div>

                  <p className="text-3xl font-bold text-gray-900">
                    {departureTime}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {from}
                    {" • "}
                    {fromName}
                  </p>

                </div>

                <div className="flex-1 text-center">

                  <p className="text-sm text-gray-500">
                    {duration}
                  </p>

                  <div className="flex items-center gap-2 mt-2">

                    <div className="h-px bg-gray-300 flex-1" />

                    <span className="text-blue-600 text-xl">
                      ✈️
                    </span>

                    <div className="h-px bg-gray-300 flex-1" />

                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {stops ===
                    0
                      ? "Non-stop"
                      : `${stops} stop`}
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-3xl font-bold text-gray-900">
                    {arrivalTime}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {to}
                    {" • "}
                    {toName}
                  </p>

                </div>

              </div>

              {/* JOURNEY */}

              <div className="border-t mt-8 pt-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                <div>

                  <p className="text-sm text-gray-500">
                    Journey Date
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {formatDate(
                      journeyDate
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Seats Available
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {seatsAvailable}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Passengers
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {totalPassengers}
                  </p>

                </div>

              </div>

            </section>

            {/* PASSENGER DETAILS */}

            <section className="bg-white rounded-xl shadow p-6 mt-6">

              <h2 className="text-xl font-bold text-gray-900">
                👤 Passenger Details
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Primary passenger की जानकारी भरें।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                {/* NAME */}

                <div>

                  <label
                    htmlFor="passenger-name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Passenger Name
                  </label>

                  <input
                    id="passenger-name"
                    type="text"
                    value={
                      passengerName
                    }
                    onChange={(
                      event
                    ) =>
                      setPassengerName(
                        event.target
                          .value
                      )
                    }
                    placeholder="Enter passenger name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                {/* AGE */}

                <div>

                  <label
                    htmlFor="passenger-age"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Age
                  </label>

                  <input
                    id="passenger-age"
                    type="number"
                    min="1"
                    max="120"
                    value={
                      passengerAge
                    }
                    onChange={(
                      event
                    ) =>
                      setPassengerAge(
                        event.target
                          .value
                      )
                    }
                    placeholder="Age"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                {/* GENDER */}

                <div>

                  <label
                    htmlFor="passenger-gender"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Gender
                  </label>

                  <select
                    id="passenger-gender"
                    value={
                      passengerGender
                    }
                    onChange={(
                      event
                    ) =>
                      setPassengerGender(
                        event.target
                          .value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="MALE">
                      Male
                    </option>

                    <option value="FEMALE">
                      Female
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>

                {/* MOBILE */}

                <div>

                  <label
                    htmlFor="passenger-mobile"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Mobile Number
                  </label>

                  <input
                    id="passenger-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={
                      passengerMobile
                    }
                    onChange={(
                      event
                    ) =>
                      setPassengerMobile(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="10-digit mobile"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-4">
                  {error}
                </div>
              )}

            </section>

          </div>

          {/* ==================================================
              RIGHT SUMMARY
              ================================================== */}

          <div>

            <section className="bg-white rounded-xl shadow p-6 lg:sticky lg:top-6">

              <h2 className="text-xl font-bold text-gray-900">
                💳 Fare Summary
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between gap-5">

                  <span className="text-gray-600">
                    Base Fare
                  </span>

                  <span className="font-semibold">
                    ₹
                    {formatMoney(
                      fare.baseFare
                    )}
                  </span>

                </div>

                <div className="flex justify-between gap-5">

                  <span className="text-gray-600">
                    Taxes
                  </span>

                  <span className="font-semibold">
                    ₹
                    {formatMoney(
                      fare.taxes
                    )}
                  </span>

                </div>

                <div className="flex justify-between gap-5">

                  <span className="text-gray-600">
                    Convenience Fee
                  </span>

                  <span className="font-semibold">
                    ₹
                    {formatMoney(
                      fare.convenienceFee
                    )}
                  </span>

                </div>

                <div className="border-t pt-4 flex justify-between gap-5">

                  <span className="text-xl font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    ₹
                    {formatMoney(
                      fare.totalAmount
                    )}
                  </span>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  continueToPayment
                }
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"
              >
                Continue to Payment →
              </button>

              <Link
                href="/service2/flight"
                className="block w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold text-center"
              >
                ← Change Flight
              </Link>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}

// ======================================================
// PAGE WRAPPER
// ======================================================

export default function FlightDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">

          <p className="text-gray-600">
            Flight details load हो रही हैं...
          </p>

        </main>
      }
    >
      <FlightDetailsContent />
    </Suspense>
  );
}