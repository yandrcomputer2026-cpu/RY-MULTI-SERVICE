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
  // MOBILE RECHARGE - NEW JSON
  // ===============================

  recharge?: {
    mobile?: string;
    operator?: string;
    circle?: string;
  };

  // MOBILE RECHARGE - OLD / FLAT SUPPORT
  mobile?: string;
  operator?: string;
  circle?: string;

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
    amount?: number;
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
// SAFE DESCRIPTION PARSER
// ===============================

function parseDescription(
  description: string | null
): ParsedDescription {
  if (!description) {
    return {};
  }

  const value = description.trim();

  // New structured JSON
  if (value.startsWith("{")) {
    try {
      return JSON.parse(value) as ParsedDescription;
    } catch {
      return {};
    }
  }

  // Old prepaid recharge description support:
  // "Mobile: 9876543210, Operator: jio, Circle: delhi"
  const mobileMatch =
    value.match(/Mobile:\s*([^,]+)/i);

  const operatorMatch =
    value.match(/Operator:\s*([^,]+)/i);

  const circleMatch =
    value.match(/Circle:\s*([^,]+)/i);

  if (
    mobileMatch ||
    operatorMatch ||
    circleMatch
  ) {
    return {
      mobile: mobileMatch?.[1]?.trim(),
      operator: operatorMatch?.[1]?.trim(),
      circle: circleMatch?.[1]?.trim(),
    };
  }

  return {};
}

// ===============================
// MOBILE RECHARGE HELPERS
// ===============================

function isMobilePrepaidService(
  service: string,
  category?: string | null
) {
  return (
    service === "MOBILE_PREPAID" ||
    service === "PREPAID_RECHARGE" ||
    service === "MOBILE_RECHARGE" ||
    category === "PREPAID_RECHARGE"
  );
}

function formatValue(value?: string) {
  if (!value) {
    return "-";
  }

  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

// ===============================
// TITLE
// ===============================

function getTitle(
  service: string,
  category: string | null,
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
    isMobilePrepaidService(
      service,
      category
    )
  ) {
    return "Mobile Prepaid Recharge";
  }

  return service.replaceAll("_", " ");
}

// ===============================
// ICON
// ===============================

function getIcon(
  service: string,
  category: string | null
) {
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
    isMobilePrepaidService(
      service,
      category
    )
  ) {
    return "📱";
  }

  return "💳";
}

// ===============================
// STATUS HELPERS
// ===============================

function getStatusClasses(status: string) {
  const normalizedStatus =
    status.toUpperCase();

  if (
    normalizedStatus === "SUCCESS" ||
    normalizedStatus === "RECHARGE_SUCCESS"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    normalizedStatus === "FAILED" ||
    normalizedStatus === "RECHARGE_FAILED"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-yellow-100 text-yellow-700";
}

function isSuccessStatus(status: string) {
  const normalizedStatus =
    status.toUpperCase();

  return (
    normalizedStatus === "SUCCESS" ||
    normalizedStatus === "RECHARGE_SUCCESS"
  );
}

function isPendingStatus(status: string) {
  const normalizedStatus =
    status.toUpperCase();

  return (
    normalizedStatus === "PENDING" ||
    normalizedStatus === "PAYMENT_PENDING"
  );
}

function isFailedStatus(status: string) {
  const normalizedStatus =
    status.toUpperCase();

  return (
    normalizedStatus === "FAILED" ||
    normalizedStatus === "RECHARGE_FAILED"
  );
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
                const details =
                  parseDescription(
                    transaction.description
                  );

                const mobileRecharge =
                  isMobilePrepaidService(
                    transaction.service,
                    transaction.category
                  );

                const title =
                  getTitle(
                    transaction.service,
                    transaction.category,
                    details
                  );

                const icon =
                  getIcon(
                    transaction.service,
                    transaction.category
                  );

                const status =
                  String(
                    transaction.status ||
                    "PENDING"
                  ).toUpperCase();

                const isSuccess =
                  isSuccessStatus(status);

                const isPending =
                  isPendingStatus(status);

                const isFailed =
                  isFailedStatus(status);

                const amount =
                  Number(
                    transaction.amount
                  );

                const rechargeMobile =
                  details.recharge?.mobile ||
                  details.mobile ||
                  transaction.referenceId ||
                  "-";

                const providerFallback =
                  transaction.provider &&
                  transaction.provider.toUpperCase() !==
                    "RAZORPAY"
                    ? transaction.provider
                    : "";

                const rechargeOperator =
                  details.recharge?.operator ||
                  details.operator ||
                  providerFallback ||
                  "-";

                const rechargeCircle =
                  details.recharge?.circle ||
                  details.circle ||
                  "-";

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
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              status
                            )}`}
                          >
                            {status}
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
                          {Number.isFinite(amount)
                            ? amount.toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                    </div>

                    {/* ================= STATUS NOTICE ================= */}

                    {isPending && (
                      <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                        <p className="font-semibold text-yellow-800">
                          ⏳ Payment Pending
                        </p>

                        <p className="mt-1 text-sm text-yellow-700">
                          यह transaction अभी complete नहीं हुआ है।
                          Payment successful होने के बाद final status दिखाई देगा।
                        </p>
                      </div>
                    )}

                    {isFailed && (
                      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="font-semibold text-red-700">
                          ❌ Payment / Booking Failed
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                          यह transaction सफल नहीं हुआ।
                        </p>
                      </div>
                    )}

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

                    {/* ================= MOBILE PREPAID DETAILS ================= */}

                    {mobileRecharge && (
                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-4">

                        <div>
                          <p className="text-xs text-gray-500">
                            Mobile Number
                          </p>

                          <p className="font-semibold text-gray-900">
                            {rechargeMobile}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Operator
                          </p>

                          <p className="font-semibold text-gray-900">
                            {formatValue(
                              rechargeOperator
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Circle
                          </p>

                          <p className="font-semibold text-gray-900">
                            {formatValue(
                              rechargeCircle
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Recharge Status
                          </p>

                          <p className="font-semibold text-gray-900">
                            {status}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Payment Provider
                          </p>

                          <p className="font-semibold text-gray-900">
                            {transaction.razorpayPaymentId
                              ? "RAZORPAY"
                              : transaction.provider ||
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

                        <div>
                          <p className="text-xs text-gray-500">
                            Order ID
                          </p>

                          <p className="break-all text-sm font-medium text-gray-900">
                            {transaction.razorpayOrderId ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Currency
                          </p>

                          <p className="font-semibold text-gray-900">
                            {details.payment
                              ?.currency ||
                              "INR"}
                          </p>
                        </div>
                      </div>
                    )}

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

                      {/* MOBILE PREPAID */}

                      {mobileRecharge &&
                        status ===
                          "RECHARGE_SUCCESS" && (
                        <Link
                          href={`/history/recharge/${transaction.transactionId}`}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          📱 View Recharge Receipt
                        </Link>
                      )}

                      {mobileRecharge &&
                        isPending && (
                        <Link
                          href={`/service1/mobile-prepaid/payment?transactionId=${encodeURIComponent(
                            transaction.transactionId
                          )}&amount=${encodeURIComponent(
                            Number.isFinite(amount)
                              ? String(amount)
                              : "0"
                          )}`}
                          className="rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-600"
                        >
                          💳 Complete Payment
                        </Link>
                      )}

                      {mobileRecharge &&
                        isFailed && (
                        <Link
                          href="/service1/mobile-prepaid"
                          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          ↻ Recharge Again
                        </Link>
                      )}

                      {/* TRAIN */}

                      {transaction.service ===
                        "TRAIN_BOOKING" &&
                        isSuccess && (
                        <Link
                          href={`/history/train/${transaction.transactionId}`}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          🎫 View Train Ticket
                        </Link>
                      )}

                      {/* FLIGHT */}

                      {transaction.service ===
                        "FLIGHT_BOOKING" &&
                        isSuccess && (
                        <Link
                          href={`/history/flight/${transaction.transactionId}`}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          ✈️ View Flight Ticket
                        </Link>
                      )}

                      {/* BUS SUCCESS */}

                      {transaction.service ===
                        "BUS_BOOKING" &&
                        isSuccess && (
                        <Link
                          href={`/history/bus/${transaction.transactionId}`}
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          🚌 View Bus Ticket
                        </Link>
                      )}

                      {/* BUS PENDING */}

                      {transaction.service ===
                        "BUS_BOOKING" &&
                        isPending && (
                        <>
                          <Link
                            href={`/service2/bus/payment?transactionId=${encodeURIComponent(
                              transaction.transactionId
                            )}&amount=${encodeURIComponent(
                              Number.isFinite(amount)
                                ? String(amount)
                                : "0"
                            )}`}
                            className="rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-600"
                          >
                            💳 Complete Payment
                          </Link>

                          <Link
                            href={`/history/bus/${transaction.transactionId}`}
                            className="rounded-lg border border-blue-300 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                          >
                            🚌 View Bus Details
                          </Link>
                        </>
                      )}

                      {/* BUS FAILED */}

                      {transaction.service ===
                        "BUS_BOOKING" &&
                        isFailed && (
                        <Link
                          href="/service2/bus"
                          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          ↻ Book Bus Again
                        </Link>
                      )}

                      {/* HOTEL */}

                      {transaction.service ===
                        "HOTEL_BOOKING" &&
                        isSuccess && (
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
