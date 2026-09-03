import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type ParsedDescription = {
  // ===============================
  // TRAIN
  // ===============================

  trainName?: string;
  trainNo?: string;
  from?: string;
  to?: string;

  // ===============================
  // COMMON
  // ===============================

  bookingType?: string;

  // ===============================
  // MOBILE RECHARGE
  // ===============================

  mobile?: string;
  operator?: string;

  // ===============================
  // OLD / FLAT FLIGHT SUPPORT
  // ===============================

  airline?: string;
  flightNo?: string;

  // ===============================
  // BUS
  // ===============================

  bus?: {
    busId?: string;
    operator?: string;
    busType?: string;
    from?: string;
    to?: string;
    journeyDate?: string;
    departure?: string;
    arrival?: string;
    duration?: string;
  };

  passenger?: {
    name?: string;
    age?: number;
    gender?: string;
    mobile?: string;
    seatNumber?: string;
  };

  payment?: {
    totalAmount?: number;
    currency?: string;
  };

  // ===============================
  // HOTEL
  // ===============================

  hotel?: {
    hotelId?: string;
    hotelName?: string;
    city?: string;
    location?: string;
  };

  room?: {
    roomId?: string;
    roomType?: string;
    mealPlan?: string;
  };

  stay?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    nights?: number;
  };

  // ===============================
  // FLIGHT
  // ===============================

  flight?: {
    airlineName?: string;
    airlineCode?: string;
    flightNumber?: string;
    from?: string;
    to?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    cabinClass?: string;
  };

  journey?: {
    journeyDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    totalPassengers?: number;
  };
};

// ===============================
// TITLE
// ===============================

function getTitle(
  service: string,
  description: ParsedDescription
) {
  if (service === "TRAIN_BOOKING") {
    return description.trainName || "Train Booking";
  }

  if (service === "FLIGHT_BOOKING") {
    const airlineName =
      description.flight?.airlineName ||
      description.airline;

    return airlineName
      ? `${airlineName} Flight`
      : "Flight Booking";
  }

  if (service === "BUS_BOOKING") {
    return description.bus?.operator
      ? `${description.bus.operator} Bus`
      : "Bus Booking";
  }

  if (service === "HOTEL_BOOKING") {
    return (
      description.hotel?.hotelName ||
      "Hotel Booking"
    );
  }

  if (
    service === "PREPAID_RECHARGE" ||
    service === "MOBILE_RECHARGE"
  ) {
    return "Mobile Recharge";
  }

  return service.replaceAll("_", " ");
}

// ===============================
// ICON
// ===============================

function getIcon(service: string) {
  if (service === "TRAIN_BOOKING") {
    return "🚆";
  }

  if (service === "FLIGHT_BOOKING") {
    return "✈️";
  }

  if (service === "BUS_BOOKING") {
    return "🚌";
  }

  if (service === "HOTEL_BOOKING") {
    return "🏨";
  }

  if (
    service === "PREPAID_RECHARGE" ||
    service === "MOBILE_RECHARGE"
  ) {
    return "📱";
  }

  return "💳";
}

// ===============================
// PAGE
// ===============================

export default async function HistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const transactions =
    await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              RY MULTI SERVICE
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              📋 My History
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              आपकी सभी bookings और transactions एक ही जगह।
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg bg-gray-800 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-900"
          >
            ← Dashboard
          </Link>
        </div>

        {/* ================= EMPTY ================= */}

        {transactions.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">
              📭
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              अभी कोई transaction नहीं है
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              आपकी booking और payment history यहाँ दिखाई देगी।
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {transactions.map(
              (transaction) => {
                let details: ParsedDescription =
                  {};

                try {
                  if (
                    transaction.description
                  ) {
                    details =
                      JSON.parse(
                        transaction.description
                      );
                  }
                } catch {
                  details = {};
                }

                const title =
                  getTitle(
                    transaction.service,
                    details
                  );

                const icon =
                  getIcon(
                    transaction.service
                  );

                return (
                  <div
                    key={transaction.id}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >

                    {/* ================= TOP ================= */}

                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      {/* LEFT */}

                      <div>
                        <div className="flex flex-wrap items-center gap-3">

                          <span className="text-3xl">
                            {icon}
                          </span>

                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              {title}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                              {
                                transaction.service
                              }
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              transaction.status ===
                              "SUCCESS"
                                ? "bg-green-100 text-green-700"
                                : transaction.status ===
                                  "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {
                              transaction.status
                            }
                          </span>
                        </div>

                        <p className="mt-4 text-sm text-gray-500">
                          Transaction ID:{" "}
                          <span className="font-medium text-gray-700">
                            {
                              transaction.transactionId
                            }
                          </span>
                        </p>

                        {transaction.referenceId && (
                          <p className="mt-1 text-sm text-gray-500">
                            Reference ID:{" "}
                            <span className="font-medium text-gray-700">
                              {
                                transaction.referenceId
                              }
                            </span>
                          </p>
                        )}
                      </div>

                      {/* RIGHT */}

                      <div className="md:text-right">
                        <p className="text-xs text-gray-500">
                          Amount
                        </p>

                        <p className="text-2xl font-bold text-blue-600">
                          ₹
                          {Number(
                            transaction.amount
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* ================= COMMON DETAILS ================= */}

                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 md:grid-cols-3">

                      <div>
                        <p className="text-xs text-gray-500">
                          Provider
                        </p>

                        <p className="font-semibold text-gray-900">
                          {transaction.provider ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Category
                        </p>

                        <p className="font-semibold text-gray-900">
                          {transaction.category ||
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Date
                        </p>

                        <p className="font-semibold text-gray-900">
                          {transaction.createdAt.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* ================= TRAIN DETAILS ================= */}

                    {transaction.service ===
                      "TRAIN_BOOKING" && (
                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-4">

                        <div>
                          <p className="text-xs text-gray-500">
                            Train No
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.trainNo ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            From
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.from ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            To
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.to ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Payment ID
                          </p>

                          <p className="break-all text-sm font-medium text-gray-900">
                            {transaction.razorpayPaymentId ||
                              "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ================= FLIGHT DETAILS ================= */}

                    {transaction.service ===
                      "FLIGHT_BOOKING" && (
                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-4">

                        <div>
                          <p className="text-xs text-gray-500">
                            Flight No
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.flight
                              ?.flightNumber ||
                              details.flightNo ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            From
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.flight
                              ?.from || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            To
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.flight
                              ?.to || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Journey Date
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.journey
                              ?.journeyDate ||
                              "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ================= BUS DETAILS ================= */}

                    {transaction.service ===
                      "BUS_BOOKING" && (
                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-4">

                        <div>
                          <p className="text-xs text-gray-500">
                            Bus Type
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.bus
                              ?.busType || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            From
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.bus
                              ?.from || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            To
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.bus
                              ?.to || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Journey Date
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.bus
                              ?.journeyDate || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Departure
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.bus
                              ?.departure || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Arrival
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.bus
                              ?.arrival || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Seat No
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.passenger
                              ?.seatNumber || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Payment ID
                          </p>

                          <p className="break-all text-sm font-medium text-gray-900">
                            {transaction.razorpayPaymentId ||
                              "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ================= HOTEL DETAILS ================= */}

                    {transaction.service ===
                      "HOTEL_BOOKING" && (
                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-4">

                        <div>
                          <p className="text-xs text-gray-500">
                            City
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.hotel
                              ?.city || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Room Type
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.room
                              ?.roomType || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Check-in
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.stay
                              ?.checkIn || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Check-out
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.stay
                              ?.checkOut || "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ================= ACTIONS ================= */}

                    <div className="mt-5 flex flex-wrap gap-3">

                      {/* TRAIN */}

                      {transaction.service ===
                        "TRAIN_BOOKING" && (
                        <Link
                          href={`/history/train/${transaction.transactionId}`}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          🎫 View Train Ticket
                        </Link>
                      )}

                      {/* FLIGHT */}

                      {transaction.service ===
                        "FLIGHT_BOOKING" && (
                        <Link
                          href={`/history/flight/${transaction.transactionId}`}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          ✈️ View Flight Ticket
                        </Link>
                      )}

                      {/* BUS */}

                      {transaction.service ===
                        "BUS_BOOKING" && (
                        <Link
                          href={`/history/bus/${transaction.transactionId}`}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          🚌 View Bus Ticket
                        </Link>
                      )}

                      {/* HOTEL */}

                      {transaction.service ===
                        "HOTEL_BOOKING" && (
                        <Link
                          href={`/history/hotel/${transaction.transactionId}`}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          🏨 View Hotel Booking
                        </Link>
                      )}

                      {/* DASHBOARD */}

                      <Link
                        href="/dashboard"
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>

                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}
