"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ======================================================
// TYPES
// ======================================================

type TransactionData = {
  id?: number;
  transactionId?: string;
  service?: string;
  category?: string;
  description?: string;
  amount?: string | number;
  status?: string;
  referenceId?: string;
  provider?: string;
  createdAt?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
};

type BookingData = {
  bookingType?: string;

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
    refundable?: boolean;
    maxGuests?: number;
  };

  stay?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    nights?: number;
  };

  guest?: {
    name?: string;
    age?: number;
    gender?: string;
    mobile?: string;
  };

  payment?: {
    pricePerNight?: number;
    roomFare?: number;
    convenienceFee?: number;
    totalAmount?: number;
    currency?: string;
  };

  provider?: {
    mode?: string;
    confirmationId?: string | null;
    bookingStatus?: string;
  };

  transactionId?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  transaction?: TransactionData;
};

// ======================================================
// HELPERS
// ======================================================

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
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

function formatMoney(
  value?: string | number
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
}

function parseBooking(
  description?: string
): BookingData | null {
  if (!description) {
    return null;
  }

  try {
    return JSON.parse(
      description
    ) as BookingData;
  } catch (error) {
    console.error(
      "BOOKING DESCRIPTION PARSE ERROR:",
      error
    );

    return null;
  }
}

// ======================================================
// PAGE
// ======================================================

export default function HotelConfirmationPage() {
  const params = useParams();
  const router = useRouter();

  const transactionId =
    decodeURIComponent(
      String(
        params?.transactionId || ""
      )
    );

  const [
    transaction,
    setTransaction,
  ] =
    useState<TransactionData | null>(
      null
    );

  const [booking, setBooking] =
    useState<BookingData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==================================================
  // LOAD TRANSACTION
  // ==================================================

  useEffect(() => {
    async function loadTransaction() {
      if (!transactionId) {
        setError(
          "Transaction ID नहीं मिला।"
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/payment/transaction/${encodeURIComponent(
            transactionId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: ApiResponse =
          await response.json();

        console.log(
          "HOTEL TRANSACTION DETAILS:",
          data
        );

        if (
          !response.ok ||
          !data.success ||
          !data.transaction
        ) {
          setError(
            data.message ||
              "Transaction details नहीं मिलीं।"
          );

          return;
        }

        const currentTransaction =
          data.transaction;

        setTransaction(
          currentTransaction
        );

        setBooking(
          parseBooking(
            currentTransaction.description
          )
        );
      } catch (error) {
        console.error(
          "HOTEL TRANSACTION LOAD ERROR:",
          error
        );

        setError(
          "Transaction details load नहीं हो सकीं।"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransaction();
  }, [transactionId]);

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <div className="text-5xl">
            ⏳
          </div>

          <p className="text-gray-600 mt-4">
            Hotel transaction details load हो रही हैं...
          </p>
        </div>
      </main>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error || !transaction) {
    return (
      <main className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <div className="flex gap-5">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <Link
                href="/travels"
                className="text-gray-600 hover:text-blue-600"
              >
                Travels
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <div className="text-5xl">
              ❌
            </div>

            <h2 className="text-2xl font-bold text-red-600 mt-4">
              Transaction Details नहीं मिलीं
            </h2>

            <p className="text-gray-600 mt-2">
              {error ||
                "Transaction details उपलब्ध नहीं हैं।"}
            </p>

            <Link
              href="/history"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              ← Transaction History
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==================================================
  // DATA
  // ==================================================

  const hotel = booking?.hotel;
  const room = booking?.room;
  const stay = booking?.stay;
  const guest = booking?.guest;
  const payment = booking?.payment;
  const provider = booking?.provider;

  const amount =
    payment?.totalAmount ??
    Number(transaction.amount || 0);

  const roomFare =
    payment?.roomFare ??
    Math.max(
      Number(amount) -
        Number(
          payment?.convenienceFee || 0
        ),
      0
    );

  const convenienceFee =
    payment?.convenienceFee ?? 0;

  // ==================================================
  // PAYMENT STATUS
  // ==================================================

  const paymentStatus = String(
    transaction.status || "PENDING"
  ).toUpperCase();

  const paymentVerified =
    paymentStatus === "SUCCESS";

  // ==================================================
  // ACTUAL HOTEL BOOKING STATUS
  //
  // Payment success alone must NEVER confirm booking.
  // ==================================================

  const providerBookingStatus =
    String(
      provider?.bookingStatus ||
        "PENDING"
    ).toUpperCase();

  const providerConfirmationId =
    provider?.confirmationId || null;

  const bookingConfirmed =
    providerBookingStatus ===
      "CONFIRMED" &&
    Boolean(
      providerConfirmationId
    );

  const razorpayOrderId =
    transaction.razorpayOrderId ||
    null;

  const razorpayPaymentId =
    transaction.razorpayPaymentId ||
    null;

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}

      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
              href="/travels"
              className="text-gray-600 hover:text-blue-600"
            >
              Travels
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* MAIN STATUS */}

        {bookingConfirmed ? (
          <div className="bg-green-600 text-white rounded-xl p-8 text-center shadow">
            <div className="text-5xl">
              ✅
            </div>

            <h1 className="text-3xl font-bold mt-4">
              Hotel Booking Confirmed
            </h1>

            <p className="mt-2">
              Hotel provider ने booking confirm कर दी है।
            </p>

            <p className="mt-3 text-sm break-all">
              Provider Confirmation ID:{" "}
              {providerConfirmationId}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-8 text-center shadow-sm">
            <div className="text-5xl">
              ⚠️
            </div>

            <h1 className="text-3xl font-bold text-amber-800 mt-4">
              Hotel Booking Not Confirmed
            </h1>

            <p className="text-amber-800 mt-2">
              इस transaction के लिए verified
              Hotel provider confirmation उपलब्ध
              नहीं है।
            </p>

            {paymentVerified && (
              <p className="text-amber-800 mt-3 font-semibold">
                Payment record SUCCESS है, लेकिन
                इसे Hotel booking confirmation नहीं
                माना गया है।
              </p>
            )}
          </div>
        )}

        {/* IMPORTANT NOTICE */}

        {!bookingConfirmed && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl mt-6 p-5">
            <h3 className="font-bold text-blue-800">
              Payment और Booking अलग हैं
            </h3>

            <p className="text-blue-700 mt-2 text-sm leading-6">
              Payment verification केवल payment
              status बताती है। Hotel booking तभी
              confirmed मानी जाएगी जब authorized
              Hotel provider से confirmed booking
              status और provider confirmation ID
              दोनों मिलें।
            </p>
          </div>
        )}

        {/* TRANSACTION HEADER */}

        <div className="bg-white rounded-xl shadow mt-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-sm text-gray-500">
                Transaction ID
              </p>

              <p className="text-xl font-bold text-blue-700 break-all mt-1">
                {transactionId}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Payment Status
              </p>

              <span
                className={`inline-block mt-1 px-4 py-2 rounded-full text-sm font-bold ${
                  paymentVerified
                    ? "bg-green-100 text-green-700"
                    : paymentStatus ===
                        "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {paymentStatus}
              </span>
            </div>
          </div>

          <div className="border-t mt-5 pt-5">
            <p className="text-sm text-gray-500">
              Hotel Booking Status
            </p>

            <span
              className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold ${
                bookingConfirmed
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {bookingConfirmed
                ? "CONFIRMED"
                : "NOT CONFIRMED"}
            </span>
          </div>
        </div>

        {/* HOTEL DETAILS */}

        <section className="bg-white rounded-xl shadow mt-6 overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              🏨 Hotel Details
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <p className="text-sm text-gray-500">
                Hotel Name
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {hotel?.hotelName || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Hotel ID
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {hotel?.hotelId ||
                  transaction.referenceId ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                City
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {hotel?.city || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Location
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {hotel?.location || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Room Type
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {room?.roomType || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Meal Plan
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {room?.mealPlan || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Rooms
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {stay?.rooms ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Guests
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {stay?.guests ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Nights
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {stay?.nights ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Refundable
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {typeof room?.refundable ===
                "boolean"
                  ? room.refundable
                    ? "Yes"
                    : "No"
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Check-in
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {formatDate(
                  stay?.checkIn
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Check-out
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {formatDate(
                  stay?.checkOut
                )}
              </p>
            </div>
          </div>
        </section>

        {/* GUEST DETAILS */}

        <section className="bg-white rounded-xl shadow mt-6 overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              👤 Guest Details
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <p className="text-sm text-gray-500">
                Guest Name
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {guest?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Age
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {guest?.age ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Gender
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {guest?.gender || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Mobile
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {guest?.mobile || "-"}
              </p>
            </div>
          </div>
        </section>

        {/* PAYMENT DETAILS */}

        <section className="bg-white rounded-xl shadow mt-6 overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              💳 Payment Record
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between gap-6">
                <span className="text-gray-600">
                  Room Fare
                </span>

                <span className="font-semibold text-gray-900">
                  ₹{formatMoney(roomFare)}
                </span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-gray-600">
                  Convenience Fee
                </span>

                <span className="font-semibold text-gray-900">
                  ₹
                  {formatMoney(
                    convenienceFee
                  )}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between gap-6">
                <span className="text-xl font-bold text-gray-900">
                  Total Amount
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹{formatMoney(amount)}
                </span>
              </div>
            </div>

            <div className="border-t mt-6 pt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Transaction ID
                </p>

                <p className="font-semibold text-gray-900 break-all mt-1">
                  {transactionId}
                </p>
              </div>

              {razorpayOrderId && (
                <div>
                  <p className="text-sm text-gray-500">
                    Razorpay Order ID
                  </p>

                  <p className="font-semibold text-gray-900 break-all mt-1">
                    {razorpayOrderId}
                  </p>
                </div>
              )}

              {razorpayPaymentId && (
                <div>
                  <p className="text-sm text-gray-500">
                    Razorpay Payment ID
                  </p>

                  <p className="font-semibold text-gray-900 break-all mt-1">
                    {razorpayPaymentId}
                  </p>
                </div>
              )}

              {providerConfirmationId && (
                <div>
                  <p className="text-sm text-gray-500">
                    Provider Confirmation ID
                  </p>

                  <p className="font-semibold text-gray-900 break-all mt-1">
                    {providerConfirmationId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOOKING STATUS */}

        {bookingConfirmed ? (
          <div className="bg-green-50 border border-green-200 rounded-xl mt-6 p-5">
            <h3 className="font-bold text-green-700">
              ✅ Provider Booking Confirmed
            </h3>

            <p className="text-green-700 mt-2">
              Authorized provider confirmation
              उपलब्ध है।
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl mt-6 p-5">
            <h3 className="font-bold text-amber-800">
              ⚠️ Hotel Booking Not Confirmed
            </h3>

            <p className="text-amber-800 mt-2">
              Verified provider booking
              confirmation उपलब्ध नहीं है। इसलिए
              यह page Hotel booking ticket या
              confirmed voucher नहीं है।
            </p>
          </div>
        )}

        {/* ACTIONS */}

        <div
          className={`grid grid-cols-1 ${
            bookingConfirmed
              ? "md:grid-cols-3"
              : "md:grid-cols-2"
          } gap-4 mt-6`}
        >
          {bookingConfirmed && (
            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              🖨️ Print Confirmed Booking
            </button>
          )}

          <Link
            href="/service2/hotel"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-center"
          >
            🏨 New Hotel Search
          </Link>

          <button
            type="button"
            onClick={() =>
              router.push("/history")
            }
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-bold"
          >
            Transaction History
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Transaction created:{" "}
          {formatDateTime(
            transaction.createdAt
          )}
        </p>
      </div>
    </main>
  );
}