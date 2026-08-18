"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type BusDetails = {
  busId: string;
  operator: string;
  busType: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
};

type Passenger = {
  name: string;
  age: string;
  gender: string;
  mobile: string;
};

const TOTAL_SEATS = 30;
const MAX_PASSENGERS = 6;

export default function BusBookingPage() {
  const [bus, setBus] =
    useState<BusDetails | null>(null);

  const [selectedSeats, setSelectedSeats] =
    useState<number[]>([]);

  const [passengers, setPassengers] =
    useState<Record<number, Passenger>>({});

  const [error, setError] =
    useState("");

  const [bookingStep, setBookingStep] =
    useState<"seat" | "details" | "review">(
      "seat"
    );

  // ==================================================
  // LOAD BUS DATA
  // ==================================================

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const price =
      Number(
        params.get("price") || 0
      );

    setBus({
      busId:
        params.get("busId") || "",

      operator:
        params.get("operator") || "",

      busType:
        params.get("busType") || "",

      from:
        params.get("from") || "",

      to:
        params.get("to") || "",

      date:
        params.get("date") || "",

      departure:
        params.get("departure") || "",

      arrival:
        params.get("arrival") || "",

      duration:
        params.get("duration") || "",

      price,
    });
  }, []);

  // ==================================================
  // SEATS
  // ==================================================

  const seatNumbers =
    useMemo(
      () =>
        Array.from(
          {
            length: TOTAL_SEATS,
          },
          (_, index) =>
            index + 1
        ),
      []
    );

  // ==================================================
  // SELECT / DESELECT SEAT
  // ==================================================

  function toggleSeat(
    seatNumber: number
  ) {
    setError("");

    if (
      selectedSeats.includes(
        seatNumber
      )
    ) {
      setSelectedSeats(
        (current) =>
          current.filter(
            (seat) =>
              seat !== seatNumber
          )
      );

      setPassengers(
        (current) => {
          const updated = {
            ...current,
          };

          delete updated[
            seatNumber
          ];

          return updated;
        }
      );

      return;
    }

    if (
      selectedSeats.length >=
      MAX_PASSENGERS
    ) {
      setError(
        `एक booking में अधिकतम ${MAX_PASSENGERS} passengers select कर सकते हैं।`
      );
      return;
    }

    setSelectedSeats(
      (current) => [
        ...current,
        seatNumber,
      ]
    );

    setPassengers(
      (current) => ({
        ...current,

        [seatNumber]: {
          name: "",
          age: "",
          gender: "",
          mobile: "",
        },
      })
    );
  }

  // ==================================================
  // UPDATE PASSENGER
  // ==================================================

  function updatePassenger(
    seatNumber: number,
    field: keyof Passenger,
    value: string
  ) {
    setPassengers(
      (current) => ({
        ...current,

        [seatNumber]: {
          ...(current[
            seatNumber
          ] || {
            name: "",
            age: "",
            gender: "",
            mobile: "",
          }),

          [field]: value,
        },
      })
    );
  }

  // ==================================================
  // CONTINUE TO DETAILS
  // ==================================================

  function continueToDetails() {
    setError("");

    if (
      selectedSeats.length === 0
    ) {
      setError(
        "कृपया कम से कम एक seat select करें।"
      );
      return;
    }

    setBookingStep(
      "details"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==================================================
  // CONTINUE TO REVIEW
  // ==================================================

  function continueToReview() {
    setError("");

    for (const seat of selectedSeats) {
      const passenger =
        passengers[seat];

      if (
        !passenger?.name.trim()
      ) {
        setError(
          `Seat ${seat} के passenger का नाम दर्ज करें।`
        );
        return;
      }

      if (!passenger.age) {
        setError(
          `Seat ${seat} के passenger की age दर्ज करें।`
        );
        return;
      }

      const age =
        Number(
          passenger.age
        );

      if (
        age < 1 ||
        age > 120
      ) {
        setError(
          `Seat ${seat} की age 1 से 120 के बीच होनी चाहिए।`
        );
        return;
      }

      if (
        !passenger.gender
      ) {
        setError(
          `Seat ${seat} के passenger का gender select करें।`
        );
        return;
      }

      if (
        !/^[0-9]{10}$/.test(
          passenger.mobile.trim()
        )
      ) {
        setError(
          `Seat ${seat} के passenger का valid 10-digit mobile number दर्ज करें।`
        );
        return;
      }
    }

    setBookingStep(
      "review"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==================================================
  // BACK
  // ==================================================

  function goBackToSeats() {
    setError("");

    setBookingStep(
      "seat"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goBackToDetails() {
    setError("");

    setBookingStep(
      "details"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==================================================
  // DATE FORMAT
  // ==================================================

  function formatDate(
    date: string
  ) {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(
        `${date}T00:00:00`
      );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  // ==================================================
  // CONFIRM BOOKING
  // ==================================================

  async function confirmBooking() {
    setError("");

    if (!bus) {
      setError(
        "Bus details नहीं मिलीं।"
      );
      return;
    }

    if (
      selectedSeats.length === 0
    ) {
      setError(
        "कृपया कम से कम एक seat select करें।"
      );
      return;
    }

    try {
      setError("");

      const firstSeat =
        selectedSeats[0];

      const passenger =
        passengers[firstSeat];

      if (!passenger) {
        setError(
          "Passenger details नहीं मिलीं।"
        );
        return;
      }

      const baseFare =
        bus.price *
        selectedSeats.length;

      const convenienceFee =
        selectedSeats.length > 0
          ? 20
          : 0;

      const totalAmount =
        baseFare +
        convenienceFee;

      const response =
        await fetch(
          "/api/bus/booking/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              busId:
                bus.busId,

              operator:
                bus.operator,

              busType:
                bus.busType,

              from:
                bus.from,

              to:
                bus.to,

              journeyDate:
                bus.date,

              departure:
                bus.departure,

              arrival:
                bus.arrival,

              duration:
                bus.duration,

              price:
                totalAmount,

              passengerName:
                passenger.name,

              passengerAge:
                Number(
                  passenger.age
                ),

              passengerGender:
                passenger.gender,

              passengerMobile:
                passenger.mobile.trim(),

              seatNumber:
                String(
                  firstSeat
                ),
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "BUS BOOKING CREATE RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Bus booking transaction create नहीं हो सकी।"
        );

        return;
      }

      // ==========================================
      // TRANSACTION CREATED
      // ==========================================

      const transactionId =
        data.transaction
          .transactionId;

      const amount =
        data.transaction
          .amount;

      console.log(
        "BUS TRANSACTION CREATED:",
        transactionId
      );

      // ==========================================
      // NEXT STEP = PAYMENT PAGE
      // ==========================================

      window.location.href =
        `/service2/bus/payment?transactionId=${encodeURIComponent(
          transactionId
        )}&amount=${encodeURIComponent(
          amount
        )}`;
    } catch (error) {
      console.error(
        "BUS BOOKING CREATE ERROR:",
        error
      );

      setError(
        "Bus booking create करते समय server error आया।"
      );
    }
  }

  // ==================================================
  // BUS NOT FOUND
  // ==================================================

  if (!bus) {
    return (
      <main className="min-h-screen bg-gray-100">

        <header className="bg-white shadow-sm px-6 py-4">

          <div className="max-w-6xl mx-auto flex items-center justify-between">

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

        <div className="max-w-4xl mx-auto px-6 py-16 text-center">

          <div className="bg-white rounded-xl shadow p-10">

            <div className="text-5xl mb-4">
              🚌
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Bus details नहीं मिलीं
            </h2>

            <p className="text-gray-600 mt-2">
              कृपया पहले Bus Search करके कोई bus select करें।
            </p>

            <Link
              href="/service2/bus"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              ← Bus Search पर जाएँ
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // FARE
  // ==================================================

  const baseFare =
    bus.price *
    selectedSeats.length;

  const convenienceFee =
    selectedSeats.length > 0
      ? 20
      : 0;

  const totalAmount =
    baseFare +
    convenienceFee;

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm px-6 py-4">

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
              href="/service2"
              className="text-gray-600 hover:text-blue-600"
            >
              Service 2
            </Link>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            🚌 Bus Booking
          </h2>

          <p className="text-gray-600 mt-2">
            Bus select करें, seat चुनें और passenger details भरें।
          </p>

        </div>

        {/* BUS SUMMARY */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <h3 className="text-xl font-bold text-gray-900">
                {bus.operator}
              </h3>

              <p className="text-gray-500 mt-1">
                {bus.busType}
              </p>

              <p className="text-lg font-semibold text-gray-900 mt-4">
                {bus.from} → {bus.to}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Journey Date:{" "}
                {formatDate(
                  bus.date
                )}
              </p>

            </div>

            <div className="lg:text-right">

              <p className="text-sm text-gray-500">
                Departure
              </p>

              <p className="font-bold text-gray-900">
                {bus.departure}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Arrival
              </p>

              <p className="font-bold text-gray-900">
                {bus.arrival}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Duration:{" "}
                {bus.duration}
              </p>

            </div>

          </div>

        </div>

        {/* STEP INDICATOR */}

        <div className="bg-white rounded-xl shadow p-5 mb-6">

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8">

            <div
              className={`font-semibold ${
                bookingStep ===
                "seat"
                  ? "text-blue-600"
                  : "text-green-600"
              }`}
            >
              1. Seat Selection
            </div>

            <div className="hidden md:block text-gray-300">
              →
            </div>

            <div
              className={`font-semibold ${
                bookingStep ===
                "details"
                  ? "text-blue-600"
                  : bookingStep ===
                    "review"
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              2. Passenger Details
            </div>

            <div className="hidden md:block text-gray-300">
              →
            </div>

            <div
              className={`font-semibold ${
                bookingStep ===
                "review"
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              3. Review Booking
            </div>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-4">
            {error}
          </div>
        )}

        {/* ==================================================
            STEP 1: SEAT
            ================================================== */}

        {bookingStep ===
          "seat" && (
          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">

              <div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Select Your Seats
                </h3>

                <p className="text-gray-500 mt-1">
                  अधिकतम{" "}
                  {MAX_PASSENGERS}{" "}
                  passengers select कर सकते हैं।
                </p>

              </div>

              <div className="text-right">

                <p className="text-sm text-gray-500">
                  Selected Seats
                </p>

                <p className="text-xl font-bold text-blue-600">
                  {selectedSeats.length}
                </p>

              </div>

            </div>

            {/* LEGEND */}

            <div className="flex flex-wrap gap-5 mb-8 text-sm">

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-gray-100 border border-gray-300" />
                Available
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-600" />
                Selected
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-gray-300" />
                Driver
              </div>

            </div>

            {/* BUS LAYOUT */}

            <div className="max-w-2xl mx-auto">

              <div className="border-2 border-gray-200 rounded-2xl p-5 bg-gray-50">

                <div className="flex justify-end mb-6">

                  <div className="bg-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700">
                    🚌 Driver
                  </div>

                </div>

                <div className="grid grid-cols-4 gap-4">

                  {seatNumbers.map(
                    (seat) => {
                      const selected =
                        selectedSeats.includes(
                          seat
                        );

                      return (
                        <button
                          key={seat}
                          type="button"
                          onClick={() =>
                            toggleSeat(
                              seat
                            )
                          }
                          className={`h-14 rounded-lg border-2 font-bold transition ${
                            selected
                              ? "bg-blue-600 border-blue-700 text-white"
                              : "bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                          }`}
                        >
                          {selected
                            ? "✓ "
                            : ""}
                          {seat}
                        </button>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

            {/* FARE */}

            {selectedSeats.length >
              0 && (
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <p className="text-sm text-gray-600">
                      Selected Seats
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {selectedSeats
                        .slice()
                        .sort(
                          (a, b) =>
                            a - b
                        )
                        .map(
                          (seat) =>
                            `Seat ${seat}`
                        )
                        .join(
                          ", "
                        )}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-600">
                      Base Fare
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      ₹{baseFare}
                    </p>

                  </div>

                </div>

              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-4">

              <Link
                href="/service2/bus"
                className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 text-center"
              >
                ← Change Bus
              </Link>

              <button
                type="button"
                onClick={
                  continueToDetails
                }
                className="bg-blue-600 text-white px-7 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Continue to Passenger Details →
              </button>

            </div>

          </div>
        )}

        {/* ==================================================
            STEP 2: PASSENGER DETAILS
            ================================================== */}

        {bookingStep ===
          "details" && (
          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="text-2xl font-bold text-gray-900">
              Passenger Details
            </h3>

            <p className="text-gray-500 mt-1 mb-6">
              प्रत्येक selected seat के लिए passenger details भरें।
            </p>

            <div className="space-y-6">

              {selectedSeats
                .slice()
                .sort(
                  (a, b) =>
                    a - b
                )
                .map((seat) => {
                  const passenger =
                    passengers[
                      seat
                    ] || {
                      name: "",
                      age: "",
                      gender: "",
                      mobile: "",
                    };

                  return (
                    <div
                      key={seat}
                      className="border border-gray-200 rounded-xl p-5"
                    >

                      <div className="flex items-center justify-between mb-5">

                        <h4 className="text-lg font-bold text-gray-900">
                          Passenger — Seat{" "}
                          {seat}
                        </h4>

                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Seat {seat}
                        </span>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* NAME */}

                        <div>

                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                          </label>

                          <input
                            type="text"
                            value={
                              passenger.name
                            }
                            onChange={(
                              e
                            ) =>
                              updatePassenger(
                                seat,
                                "name",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Passenger name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          />

                        </div>

                        {/* AGE */}

                        <div>

                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Age
                          </label>

                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={
                              passenger.age
                            }
                            onChange={(
                              e
                            ) =>
                              updatePassenger(
                                seat,
                                "age",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Age"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          />

                        </div>

                        {/* GENDER */}

                        <div>

                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender
                          </label>

                          <select
                            value={
                              passenger.gender
                            }
                            onChange={(
                              e
                            ) =>
                              updatePassenger(
                                seat,
                                "gender",
                                e.target
                                  .value
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          >

                            <option value="">
                              Select Gender
                            </option>

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

                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mobile Number
                          </label>

                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={
                              passenger.mobile
                            }
                            onChange={(
                              e
                            ) =>
                              updatePassenger(
                                seat,
                                "mobile",
                                e.target.value.replace(
                                  /\D/g,
                                  ""
                                )
                              )
                            }
                            placeholder="10-digit mobile number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          />

                        </div>

                      </div>

                    </div>
                  );
                })}

            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">

              <button
                type="button"
                onClick={
                  goBackToSeats
                }
                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900"
              >
                ← Back to Seats
              </button>

              <button
                type="button"
                onClick={
                  continueToReview
                }
                className="bg-blue-600 text-white px-7 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Review Booking →
              </button>

            </div>

          </div>
        )}

        {/* ==================================================
            STEP 3: REVIEW
            ================================================== */}

        {bookingStep ===
          "review" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}

            <div className="lg:col-span-2 space-y-6">

              {/* BUS */}

              <div className="bg-white rounded-xl shadow p-6">

                <h3 className="text-2xl font-bold text-gray-900 mb-5">
                  Review Booking
                </h3>

                <div className="border border-gray-200 rounded-xl p-5">

                  <h4 className="text-lg font-bold text-gray-900">
                    🚌 {bus.operator}
                  </h4>

                  <p className="text-gray-500 mt-1">
                    {bus.busType}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                    <div>
                      <p className="text-sm text-gray-500">
                        Route
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        {bus.from} →
                        {" "}
                        {bus.to}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Journey Date
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        {formatDate(
                          bus.date
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Departure
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        {bus.departure}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Arrival
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        {bus.arrival}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Duration
                      </p>

                      <p className="font-bold text-gray-900 mt-1">
                        {bus.duration}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              {/* PASSENGERS */}

              <div className="bg-white rounded-xl shadow p-6">

                <h3 className="text-xl font-bold text-gray-900 mb-5">
                  Passenger Details
                </h3>

                <div className="space-y-4">

                  {selectedSeats
                    .slice()
                    .sort(
                      (a, b) =>
                        a - b
                    )
                    .map((seat) => {
                      const passenger =
                        passengers[
                          seat
                        ];

                      return (
                        <div
                          key={seat}
                          className="border border-gray-200 rounded-lg p-4"
                        >

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                            <div>

                              <p className="font-bold text-gray-900">
                                Seat {seat} —
                                {" "}
                                {
                                  passenger.name
                                }
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Age:{" "}
                                {
                                  passenger.age
                                }
                                {" | "}
                                Gender:{" "}
                                {
                                  passenger.gender
                                }
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Mobile:{" "}
                                {
                                  passenger.mobile
                                }
                              </p>

                            </div>

                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                              Confirmed Selection
                            </span>

                          </div>

                        </div>
                      );
                    })}

                </div>

              </div>

            </div>

            {/* RIGHT FARE */}

            <div>

              <div className="bg-white rounded-xl shadow p-6 sticky top-6">

                <h3 className="text-xl font-bold text-gray-900 mb-5">
                  Fare Summary
                </h3>

                <div className="space-y-4 text-sm">

                  <div className="flex justify-between">

                    <span className="text-gray-600">
                      Bus Fare
                    </span>

                    <span className="font-semibold text-gray-900">
                      ₹{baseFare}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-600">
                      Convenience Fee
                    </span>

                    <span className="font-semibold text-gray-900">
                      ₹{convenienceFee}
                    </span>

                  </div>

                  <div className="border-t pt-4 flex justify-between">

                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-blue-600">
                      ₹{totalAmount}
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    confirmBooking
                  }
                  className="w-full mt-6 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                  Confirm Booking →
                </button>

                <button
                  type="button"
                  onClick={
                    goBackToDetails
                  }
                  className="w-full mt-3 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
                >
                  ← Edit Passenger Details
                </button>

              </div>

            </div>

          </div>
        )}

        {/* BACK */}

        <div className="mt-10">

          <Link
            href="/service2/bus"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900"
          >
            ← Bus Search पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}