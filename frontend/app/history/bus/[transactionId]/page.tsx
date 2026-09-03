import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

type BusBookingDescription = {
  bookingType?: string;

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
};

// ==================================================
// HELPERS
// ==================================================

function formatMoney(value?: string | number | null) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return amount.toLocaleString("en-IN");
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value?: Date | string) {
  if (!value) {
    return "-";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseDescription(
  description?: string | null
): BusBookingDescription {
  if (!description) {
    return {};
  }

  const value = description.trim();

  // पुराने Bus transactions में plain-text description हो सकता है.
  // इसलिए केवल JSON object दिखने पर ही parse करेंगे.
  if (!value.startsWith("{")) {
    return {};
  }

  try {
    return JSON.parse(value) as BusBookingDescription;
  } catch {
    return {};
  }
}

// ==================================================
// PAGE
// ==================================================

export default async function BusHistoryTicketPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const {
    transactionId: rawTransactionId,
  } = await params;

  const transactionId =
    decodeURIComponent(
      String(rawTransactionId || "")
    );

  const transaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,
        userId: user.id,
        service: "BUS_BOOKING",
      },
    });

  // ==================================================
  // NOT FOUND
  // ==================================================

  if (!transaction) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <div className="text-5xl">
              ❌
            </div>

            <h1 className="mt-4 text-2xl font-bold text-red-600">
              Bus Booking नहीं मिली
            </h1>

            <p className="mt-2 text-gray-600">
              यह booking उपलब्ध नहीं है या आपके account से संबंधित नहीं है।
            </p>

            <Link
              href="/history"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              ← My History
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==================================================
  // DESCRIPTION
  // ==================================================

  const details =
    parseDescription(
      transaction.description
    );

  const bus =
    details.bus;

  const passenger =
    details.passenger;

  const payment =
    details.payment;

  // ==================================================
  // STATUS
  // ==================================================

  const status =
    String(
      transaction.status || "PENDING"
    ).toUpperCase();

  const isSuccess =
    status === "SUCCESS";

  const isFailed =
    status === "FAILED";

  // ==================================================
  // AMOUNT
  // ==================================================

  const totalAmount =
    payment?.totalAmount ??
    Number(
      transaction.amount || 0
    );

  // ==================================================
  // OLD DATA CHECK
  // ==================================================

  const hasBusDetails =
    Boolean(
      bus?.busId ||
      bus?.operator ||
      bus?.busType ||
      bus?.from ||
      bus?.to ||
      bus?.journeyDate ||
      bus?.departure ||
      bus?.arrival ||
      bus?.duration
    );

  const hasPassengerDetails =
    Boolean(
      passenger?.name ||
      passenger?.age ||
      passenger?.gender ||
      passenger?.mobile ||
      passenger?.seatNumber
    );

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}

      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/dashboard"
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
              href="/history"
              className="text-gray-600 hover:text-blue-600"
            >
              My History
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* ================= TITLE ================= */}

        <div className="mb-6 text-center">
          <p className="text-sm font-bold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            🚌 Bus Booking
          </h1>

          <p className="mt-2 text-gray-500">
            आपकी bus booking details
          </p>
        </div>

        {/* ================= STATUS ================= */}

        <div
          className={`rounded-xl border p-6 ${
            isSuccess
              ? "border-green-200 bg-green-50"
              : isFailed
              ? "border-red-200 bg-red-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2
                className={`text-xl font-bold ${
                  isSuccess
                    ? "text-green-700"
                    : isFailed
                    ? "text-red-700"
                    : "text-yellow-700"
                }`}
              >
                Booking {status}{" "}
                {isSuccess
                  ? "✅"
                  : isFailed
                  ? "❌"
                  : "⏳"}
              </h2>

              <p className="mt-4 text-sm text-gray-500">
                Booking ID
              </p>

              <p className="mt-1 break-all font-bold text-gray-900">
                {
                  transaction.transactionId
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Reference ID
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  transaction.referenceId ||
                  bus?.busId ||
                  "-"
                }
              </p>
            </div>
          </div>
        </div>

        {/* ================= OLD DATA NOTE ================= */}

        {!hasBusDetails &&
          !hasPassengerDetails && (
            <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="font-semibold text-yellow-800">
                पुराने Bus transaction की detailed booking information उपलब्ध नहीं है।
              </p>

              <p className="mt-2 text-sm text-yellow-700">
                इस transaction में description पुराने plain-text format में save हुआ था।
                नई Bus bookings में पूरी Bus और Passenger details दिखाई देंगी।
              </p>
            </div>
          )}

        {/* ================= BUS DETAILS ================= */}

        <section className="mt-6 overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">
              🚌 Bus Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-6 p-6 md:grid-cols-2 lg:grid-cols-3">

            <div>
              <p className="text-sm text-gray-500">
                Operator
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  bus?.operator ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Bus ID
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  bus?.busId ||
                  transaction.referenceId ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Bus Type
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  bus?.busType ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                From
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  bus?.from ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                To
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  bus?.to ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Journey Date
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  formatDate(
                    bus?.journeyDate
                  )
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Departure
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  bus?.departure ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Arrival
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  bus?.arrival ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Duration
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  bus?.duration ||
                  "-"
                }
              </p>
            </div>
          </div>
        </section>

        {/* ================= PASSENGER DETAILS ================= */}

        <section className="mt-6 overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">
              👤 Passenger Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-6 p-6 md:grid-cols-2 lg:grid-cols-3">

            <div>
              <p className="text-sm text-gray-500">
                Passenger Name
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  passenger?.name ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Age
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  passenger?.age ??
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Gender
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  passenger?.gender ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Mobile
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {
                  passenger?.mobile ||
                  "-"
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Seat Number
              </p>

              <p className="mt-1 font-bold text-blue-700">
                {
                  passenger?.seatNumber ||
                  "-"
                }
              </p>
            </div>
          </div>
        </section>

        {/* ================= FARE DETAILS ================= */}

        <section className="mt-6 overflow-hidden rounded-xl bg-white shadow">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">
              💳 Fare Details
            </h2>
          </div>

          <div className="p-6">

            <div className="flex justify-between gap-6">
              <span className="text-xl font-bold text-gray-900">
                Total Paid
              </span>

              <span className="text-2xl font-bold text-blue-600">
                ₹
                {
                  formatMoney(
                    totalAmount
                  )
                }
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2">

              <div>
                <p className="text-sm text-gray-500">
                  Currency
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {
                    payment?.currency ||
                    "INR"
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Payment Provider
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {
                    transaction.provider ||
                    "-"
                  }
                </p>
              </div>

              {transaction.razorpayOrderId && (
                <div>
                  <p className="text-sm text-gray-500">
                    Razorpay Order ID
                  </p>

                  <p className="mt-1 break-all font-semibold text-gray-900">
                    {
                      transaction.razorpayOrderId
                    }
                  </p>
                </div>
              )}

              {transaction.razorpayPaymentId && (
                <div>
                  <p className="text-sm text-gray-500">
                    Razorpay Payment ID
                  </p>

                  <p className="mt-1 break-all font-semibold text-gray-900">
                    {
                      transaction.razorpayPaymentId
                    }
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">
                  Booking Date
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {
                    formatDateTime(
                      transaction.createdAt
                    )
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACTIONS ================= */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <Link
            href="/history"
            className="rounded-lg bg-gray-800 px-6 py-3 text-center font-bold text-white hover:bg-gray-900"
          >
            ← My History
          </Link>

          <Link
            href="/service2/bus"
            className="rounded-lg bg-blue-600 px-6 py-3 text-center font-bold text-white hover:bg-blue-700"
          >
            🚌 Book Another Bus
          </Link>
        </div>
      </div>
    </main>
  );
}
