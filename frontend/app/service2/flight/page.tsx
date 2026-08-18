"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

// ======================================================
// TYPES
// ======================================================

type Flight = {
  flightId: string;

  airlineCode: string;
  airlineName: string;

  flightNumber: string;

  from: string;
  fromName: string;

  to: string;
  toName: string;

  departureTime: string;
  arrivalTime: string;

  duration: string;
  stops: number;

  cabinClass: string;

  refundable: boolean;

  price: number;
  currency: string;

  seatsAvailable: number;
};

type SearchResponse = {
  success: boolean;

  message?: string;

  count?: number;

  flights?: Flight[];
};

// ======================================================
// HELPERS
// ======================================================

function formatMoney(
  value: number
) {
  return value.toLocaleString(
    "en-IN"
  );
}

function getToday() {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ======================================================
// PAGE
// ======================================================

export default function FlightPage() {
  // ====================================================
  // SEARCH STATE
  // ====================================================

  const [from, setFrom] =
    useState("DEL");

  const [to, setTo] =
    useState("LKO");

  const [journeyDate, setJourneyDate] =
    useState(
      getToday()
    );

  const [returnDate, setReturnDate] =
    useState("");

  const [tripType, setTripType] =
    useState<
      "ONE_WAY" |
      "ROUND_TRIP" |
      "MULTI_CITY"
    >("ONE_WAY");

  const [adults, setAdults] =
    useState(1);

  const [children, setChildren] =
    useState(0);

  const [infants, setInfants] =
    useState(0);

  const [cabinClass, setCabinClass] =
    useState(
      "ECONOMY"
    );

  // ====================================================
  // RESULT STATE
  // ====================================================

  const [flights, setFlights] =
    useState<Flight[]>(
      []
    );

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // SWAP AIRPORTS
  // ====================================================

  function swapAirports() {
    setFrom(to);
    setTo(from);
  }

  // ====================================================
  // SEARCH
  // ====================================================

  async function handleSearch(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setFlights([]);
    setSearched(false);

    // ----------------------------------------------
    // Validation
    // ----------------------------------------------

    if (!from.trim()) {
      setError(
        "From airport/city भरना जरूरी है।"
      );
      return;
    }

    if (!to.trim()) {
      setError(
        "To airport/city भरना जरूरी है।"
      );
      return;
    }

    if (
      from.trim().toUpperCase() ===
      to.trim().toUpperCase()
    ) {
      setError(
        "From और To अलग होने चाहिए।"
      );
      return;
    }

    if (!journeyDate) {
      setError(
        "Journey date select करें।"
      );
      return;
    }

    if (
      tripType ===
        "ROUND_TRIP" &&
      !returnDate
    ) {
      setError(
        "Round trip के लिए return date select करें।"
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/flight/search",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              from:
                from
                  .trim()
                  .toUpperCase(),

              to:
                to
                  .trim()
                  .toUpperCase(),

              journeyDate,

              returnDate:
                returnDate ||
                undefined,

              tripType,

              adults,

              children,

              infants,

              cabinClass,
            }),
          }
        );

      const data: SearchResponse =
        await response.json();

      console.log(
        "FLIGHT SEARCH RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Flight search नहीं हो सकी।"
        );
        return;
      }

      setFlights(
        data.flights ||
          []
      );

      setSearched(true);
    } catch (error) {
      console.error(
        "FLIGHT SEARCH ERROR:",
        error
      );

      setError(
        "Flight search service से connection नहीं हो पाया।"
      );
    } finally {
      setLoading(false);
    }
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
              href="/service2"
              className="text-gray-600 hover:text-blue-600"
            >
              Service 2
            </Link>

          </div>

        </div>

      </header>

      {/* ==================================================
          MAIN
          ================================================== */}

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ==================================================
            TITLE
            ================================================== */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            ✈️ Flight Booking
          </h1>

          <p className="text-gray-600 mt-2">
            Flight search करें और अपनी journey booking शुरू करें।
          </p>

        </div>

        {/* ==================================================
            SEARCH BOX
            ================================================== */}

        <form
          onSubmit={
            handleSearch
          }
          className="bg-white rounded-xl shadow p-6"
        >

          {/* TRIP TYPE */}

          <div className="flex flex-wrap gap-3 mb-6">

            <button
              type="button"
              onClick={() =>
                setTripType(
                  "ONE_WAY"
                )
              }
              className={`px-5 py-2.5 rounded-lg font-semibold ${
                tripType ===
                "ONE_WAY"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              One Way
            </button>

            <button
              type="button"
              onClick={() =>
                setTripType(
                  "ROUND_TRIP"
                )
              }
              className={`px-5 py-2.5 rounded-lg font-semibold ${
                tripType ===
                "ROUND_TRIP"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Round Trip
            </button>

            <button
              type="button"
              onClick={() =>
                setTripType(
                  "MULTI_CITY"
                )
              }
              className={`px-5 py-2.5 rounded-lg font-semibold ${
                tripType ===
                "MULTI_CITY"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Multi City
            </button>

          </div>

          {/* FROM / TO */}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">

            {/* FROM */}

            <div>

              <label
                htmlFor="from"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                From
              </label>

              <input
                id="from"
                type="text"
                value={from}
                onChange={(
                  event
                ) =>
                  setFrom(
                    event.target
                      .value
                  )
                }
                placeholder="DEL"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500 mt-1">
                Example: DEL, LKO, BOM
              </p>

            </div>

            {/* SWAP */}

            <button
              type="button"
              onClick={
                swapAirports
              }
              className="h-12 w-12 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-xl"
              title="Swap"
            >
              ⇄
            </button>

            {/* TO */}

            <div>

              <label
                htmlFor="to"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                To
              </label>

              <input
                id="to"
                type="text"
                value={to}
                onChange={(
                  event
                ) =>
                  setTo(
                    event.target
                      .value
                  )
                }
                placeholder="LKO"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500 mt-1">
                Example: DEL, LKO, BOM
              </p>

            </div>

          </div>

          {/* DATE / PASSENGERS */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

            {/* JOURNEY DATE */}

            <div>

              <label
                htmlFor="journeyDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Journey Date
              </label>

              <input
                id="journeyDate"
                type="date"
                min={getToday()}
                value={
                  journeyDate
                }
                onChange={(
                  event
                ) =>
                  setJourneyDate(
                    event.target
                      .value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* RETURN DATE */}

            <div>

              <label
                htmlFor="returnDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Return Date
              </label>

              <input
                id="returnDate"
                type="date"
                min={
                  journeyDate ||
                  getToday()
                }
                disabled={
                  tripType !==
                  "ROUND_TRIP"
                }
                value={
                  returnDate
                }
                onChange={(
                  event
                ) =>
                  setReturnDate(
                    event.target
                      .value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

            </div>

            {/* ADULTS */}

            <div>

              <label
                htmlFor="adults"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Adults
              </label>

              <select
                id="adults"
                value={adults}
                onChange={(
                  event
                ) =>
                  setAdults(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                {Array.from(
                  {
                    length: 9,
                  },
                  (
                    _,
                    index
                  ) => (
                    <option
                      key={
                        index + 1
                      }
                      value={
                        index + 1
                      }
                    >
                      {index + 1}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* CABIN */}

            <div>

              <label
                htmlFor="cabin"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Cabin Class
              </label>

              <select
                id="cabin"
                value={
                  cabinClass
                }
                onChange={(
                  event
                ) =>
                  setCabinClass(
                    event.target
                      .value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="ECONOMY">
                  Economy
                </option>

                <option value="PREMIUM_ECONOMY">
                  Premium Economy
                </option>

                <option value="BUSINESS">
                  Business
                </option>

                <option value="FIRST">
                  First Class
                </option>

              </select>

            </div>

          </div>

          {/* CHILDREN / INFANTS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 md:w-1/2">

            <div>

              <label
                htmlFor="children"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Children
              </label>

              <select
                id="children"
                value={
                  children
                }
                onChange={(
                  event
                ) =>
                  setChildren(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                {Array.from(
                  {
                    length: 9,
                  },
                  (
                    _,
                    index
                  ) => (
                    <option
                      key={
                        index
                      }
                      value={
                        index
                      }
                    >
                      {index}
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label
                htmlFor="infants"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Infants
              </label>

              <select
                id="infants"
                value={
                  infants
                }
                onChange={(
                  event
                ) =>
                  setInfants(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                {Array.from(
                  {
                    length: 5,
                  },
                  (
                    _,
                    index
                  ) => (
                    <option
                      key={
                        index
                      }
                      value={
                        index
                      }
                    >
                      {index}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-4">
              {error}
            </div>
          )}

          {/* SEARCH BUTTON */}

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full md:w-auto mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold"
          >
            {loading
              ? "Searching Flights..."
              : "🔎 Search Flights"}
          </button>

        </form>

        {/* ==================================================
            RESULTS
            ================================================== */}

        <div className="mt-10">

          {loading && (
            <div className="bg-white rounded-xl shadow p-10 text-center">

              <div className="text-4xl">
                ✈️
              </div>

              <p className="text-gray-600 mt-4">
                Flights search हो रही हैं...
              </p>

            </div>
          )}

          {!loading &&
            searched &&
            flights.length ===
              0 && (
              <div className="bg-white rounded-xl shadow p-10 text-center">

                <div className="text-5xl">
                  😕
                </div>

                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  कोई flight नहीं मिली
                </h2>

                <p className="text-gray-500 mt-2">
                  दूसरे airport या date से search करके देखें।
                </p>

              </div>
            )}

          {!loading &&
            flights.length >
              0 && (
              <>

                {/* RESULT HEADER */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Available Flights
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {from.toUpperCase()}
                      {" → "}
                      {to.toUpperCase()}
                      {" • "}
                      {flights.length}
                      {" flights found"}
                    </p>

                  </div>

                </div>

                {/* FLIGHTS */}

                <div className="space-y-5">

                  {flights.map(
                    (
                      flight
                    ) => (
                      <div
                        key={
                          flight.flightId
                        }
                        className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                          {/* AIRLINE */}

                          <div className="min-w-[180px]">

                            <h3 className="text-lg font-bold text-gray-900">
                              {
                                flight.airlineName
                              }
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                              {
                                flight.airlineCode
                              }
                              {" • "}
                              {
                                flight.flightNumber
                              }
                            </p>

                          </div>

                          {/* TIME */}

                          <div className="flex-1">

                            <div className="flex items-center justify-between gap-5">

                              <div>

                                <p className="text-2xl font-bold text-gray-900">
                                  {
                                    flight.departureTime
                                  }
                                </p>

                                <p className="text-sm text-gray-500">
                                  {flight.from}
                                  {" • "}
                                  {
                                    flight.fromName
                                  }
                                </p>

                              </div>

                              <div className="flex-1 text-center">

                                <p className="text-xs text-gray-500">
                                  {
                                    flight.duration
                                  }
                                </p>

                                <div className="flex items-center gap-2 mt-2">

                                  <div className="h-px bg-gray-300 flex-1" />

                                  <span className="text-blue-600">
                                    ✈
                                  </span>

                                  <div className="h-px bg-gray-300 flex-1" />

                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                  {flight.stops ===
                                  0
                                    ? "Non-stop"
                                    : `${flight.stops} stop`}
                                </p>

                              </div>

                              <div className="text-right">

                                <p className="text-2xl font-bold text-gray-900">
                                  {
                                    flight.arrivalTime
                                  }
                                </p>

                                <p className="text-sm text-gray-500">
                                  {flight.to}
                                  {" • "}
                                  {
                                    flight.toName
                                  }
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* PRICE */}

                          <div className="lg:text-right min-w-[150px]">

                            <p className="text-sm text-gray-500">
                              Starting from
                            </p>

                            <p className="text-2xl font-bold text-gray-900">
                              ₹
                              {formatMoney(
                                flight.price
                              )}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              per passenger
                            </p>

                            <button
                              type="button"
                              className="w-full lg:w-auto mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
onClick={() => {
  const params =
    new URLSearchParams({
      flightId:
        flight.flightId,

      airlineCode:
        flight.airlineCode,

      airlineName:
        flight.airlineName,

      flightNumber:
        flight.flightNumber,

      from:
        flight.from,

      fromName:
        flight.fromName,

      to:
        flight.to,

      toName:
        flight.toName,

      departureTime:
        flight.departureTime,

      arrivalTime:
        flight.arrivalTime,

      duration:
        flight.duration,

      stops:
        String(
          flight.stops
        ),

      cabinClass:
        flight.cabinClass,

      refundable:
        String(
          flight.refundable
        ),

      price:
        String(
          flight.price
        ),

      currency:
        flight.currency,

      seatsAvailable:
        String(
          flight.seatsAvailable
        ),

      journeyDate,

      adults:
        String(adults),

      children:
        String(children),

      infants:
        String(infants),
    });

  window.location.href =
    `/service2/flight/details?${params.toString()}`;
}}                            >
                              Select Flight →
                            </button>

                          </div>

                        </div>

                        {/* META */}

                        <div className="border-t mt-5 pt-4 flex flex-wrap gap-4 text-sm">

                          <span className="text-gray-600">
                            💺{" "}
                            {
                              flight.seatsAvailable
                            }{" "}
                            seats left
                          </span>

                          <span
                            className={
                              flight.refundable
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {flight.refundable
                              ? "✓ Refundable"
                              : "✕ Non-refundable"}
                          </span>

                          <span className="text-gray-600">
                            🧳 Cabin:{" "}
                            {
                              flight.cabinClass
                            }
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </>
            )}

        </div>

      </div>

    </main>
  );
}