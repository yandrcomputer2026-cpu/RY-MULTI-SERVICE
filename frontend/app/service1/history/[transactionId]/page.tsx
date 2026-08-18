"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

// ======================================================
// TYPES
// ======================================================

type Transaction = {
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

type ApiResponse = {
  success?: boolean;

  message?: string;

  transaction?: Transaction;
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
};

// ======================================================
// HELPERS
// ======================================================

function formatMoney(
  value?: string | number
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "0";
  }

  return amount.toLocaleString(
    "en-IN"
  );
}

function formatDate(
  value?: string
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

function formatDateTime(
  value?: string
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
}

function parseDescription(
  description?: string
): BookingData | null {
  if (!description) {
    return null;
  }

  try {
    return JSON.parse(
      description
    );
  } catch (error) {
    console.error(
      "HISTORY DESCRIPTION PARSE ERROR:",
      error
    );

    return null;
  }
}

// ======================================================
// PAGE
// ======================================================

export default function TransactionDetailsPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const transactionId =
    decodeURIComponent(
      String(
        params?.transactionId ||
          ""
      )
    );

  // ==================================================
  // STATE
  // ==================================================

  const [
    transaction,
    setTransaction,
  ] =
    useState<Transaction | null>(
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

        const response =
          await fetch(
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
          "HISTORY TRANSACTION RESPONSE:",
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

        const bookingData =
          parseDescription(
            currentTransaction.description
          );

        setBooking(
          bookingData
        );
      } catch (error) {
        console.error(
          "HISTORY TRANSACTION ERROR:",
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
  }, [
    transactionId,
  ]);

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
            Transaction details load हो रही हैं...
          </p>

        </div>

      </main>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (
    error ||
    !transaction
  ) {
    return (
      <main className="min-h-screen bg-gray-100">

        <header className="bg-white shadow-sm px-6 py-4">

          <div className="max-w-5xl mx-auto flex items-center justify-between">

            <Link
              href="/"
              className="text-xl font-bold text-blue-700"
            >
              RY MULTI SERVICE
            </Link>

            <Link
              href="/service1/history"
              className="text-gray-600 hover:text-blue-600"
            >
              Payment History
            </Link>

          </div>

        </header>

        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="bg-white rounded-xl shadow p-10 text-center">

            <div className="text-5xl">
              ❌
            </div>

            <h1 className="text-2xl font-bold text-red-600 mt-4">
              Transaction Details नहीं मिलीं
            </h1>

            <p className="text-gray-600 mt-2">
              {error ||
                "Transaction उपलब्ध नहीं है।"}
            </p>

            <Link
              href="/service1/history"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              ← Payment History
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // COMMON DATA
  // ==================================================

  const status =
    String(
      transaction.status ||
        "SUCCESS"
    ).toUpperCase();

  const amount =
    Number(
      transaction.amount ||
        0
    );

  const isSuccess =
    status === "SUCCESS";

  const isHotelBooking =
    transaction.service ===
      "HOTEL_BOOKING" ||
    booking?.bookingType ===
      "HOTEL_BOOKING";

  // ==================================================
  // HOTEL DATA
  // ==================================================

  const hotel =
    booking?.hotel;

  const room =
    booking?.room;

  const stay =
    booking?.stay;

  const guest =
    booking?.guest;

  const payment =
    booking?.payment;

  const hotelRoomFare =
    payment?.roomFare ??
    0;

  const hotelConvenienceFee =
    payment?.convenienceFee ??
    0;

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ==================================================
          HEADER
          ================================================== */}

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
              href="/service1/history"
              className="text-gray-600 hover:text-blue-600"
            >
              Payment History
            </Link>

          </div>

        </div>

      </header>

      {/* ==================================================
          MAIN
          ================================================== */}

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ==================================================
            TITLE
            ================================================== */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            🧾 Transaction Details
          </h1>

          <p className="text-gray-600 mt-2">
            आपके payment की पूरी जानकारी
          </p>

        </div>

        {/* ==================================================
            STATUS + AMOUNT
            ================================================== */}

        <section className="bg-white rounded-xl shadow p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <p className="text-sm text-gray-500">
                Payment Status
              </p>

              <span
                className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold ${
                  isSuccess
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {status}
              </span>

            </div>

            <div className="md:text-right">

              <p className="text-sm text-gray-500">
                Amount
              </p>

              <p className="text-3xl font-bold text-gray-900">
                ₹
                {formatMoney(
                  amount
                )}
              </p>

            </div>

          </div>

        </section>

        {/* ==================================================
            HOTEL BOOKING DETAILS
            ================================================== */}

        {isHotelBooking &&
          booking && (
            <>

              <section className="bg-white rounded-xl shadow mt-6 overflow-hidden">

                <div className="px-6 py-5 border-b">

                  <h2 className="text-xl font-bold text-gray-900">
                    🏨 Hotel Booking Details
                  </h2>

                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

                  <div>
                    <p className="text-sm text-gray-500">
                      Hotel Name
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {hotel?.hotelName ||
                        "-"}
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
                      {hotel?.city ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Location
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {hotel?.location ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Room Type
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {room?.roomType ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Meal Plan
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {room?.mealPlan ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Rooms
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {stay?.rooms ??
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Guests
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {stay?.guests ??
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Nights
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {stay?.nights ??
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Refundable
                    </p>

                    <p
                      className={`font-bold mt-1 ${
                        room?.refundable
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {room?.refundable
                        ? "Yes"
                        : "No"}
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

              {/* GUEST */}

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
                      {guest?.name ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Age
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {guest?.age ??
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Gender
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {guest?.gender ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Mobile
                    </p>

                    <p className="font-bold text-gray-900 mt-1">
                      {guest?.mobile ||
                        "-"}
                    </p>
                  </div>

                </div>

              </section>

              {/* HOTEL PAYMENT */}

              <section className="bg-white rounded-xl shadow mt-6 overflow-hidden">

                <div className="px-6 py-5 border-b">

                  <h2 className="text-xl font-bold text-gray-900">
                    💳 Hotel Payment Details
                  </h2>

                </div>

                <div className="p-6">

                  <div className="space-y-4">

                    <div className="flex justify-between gap-6">

                      <span className="text-gray-600">
                        Room Fare
                      </span>

                      <span className="font-semibold">
                        ₹
                        {formatMoney(
                          hotelRoomFare
                        )}
                      </span>

                    </div>

                    <div className="flex justify-between gap-6">

                      <span className="text-gray-600">
                        Convenience Fee
                      </span>

                      <span className="font-semibold">
                        ₹
                        {formatMoney(
                          hotelConvenienceFee
                        )}
                      </span>

                    </div>

                    <div className="border-t pt-4 flex justify-between gap-6">

                      <span className="text-xl font-bold text-gray-900">
                        Total Amount
                      </span>

                      <span className="text-2xl font-bold text-blue-600">
                        ₹
                        {formatMoney(
                          amount
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </section>

            </>
          )}

        {/* ==================================================
            GENERIC TRANSACTION INFORMATION
            ================================================== */}

        <section className="bg-white rounded-xl shadow mt-6 overflow-hidden">

          <div className="px-6 py-5 border-b">

            <h2 className="text-xl font-bold text-gray-900">
              Transaction Information
            </h2>

          </div>

          <div className="p-6 space-y-5">

            <div>
              <p className="text-sm text-gray-500">
                Transaction ID
              </p>

              <p className="font-bold text-gray-900 mt-1 break-all">
                {transactionId}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Service
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {isHotelBooking
                  ? "Hotel Booking"
                  : transaction.service ||
                    "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Category
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {transaction.category ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Reference
              </p>

              <p className="font-bold text-gray-900 mt-1 break-all">
                {transaction.referenceId ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Provider / Operator
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {transaction.provider ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Date & Time
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {formatDateTime(
                  transaction.createdAt
                )}
              </p>
            </div>

          </div>

        </section>

        {/* ==================================================
            PAYMENT GATEWAY
            ================================================== */}

        {(transaction.razorpayOrderId ||
          transaction.razorpayPaymentId) && (
          <section className="bg-white rounded-xl shadow mt-6 overflow-hidden">

            <div className="px-6 py-5 border-b">

              <h2 className="text-xl font-bold text-gray-900">
                Payment Gateway Information
              </h2>

            </div>

            <div className="p-6 space-y-5">

              {transaction.razorpayOrderId && (
                <div>

                  <p className="text-sm text-gray-500">
                    Razorpay Order ID
                  </p>

                  <p className="font-bold text-gray-900 mt-1 break-all">
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

                  <p className="font-bold text-gray-900 mt-1 break-all">
                    {
                      transaction.razorpayPaymentId
                    }
                  </p>

                </div>
              )}

            </div>

          </section>
        )}

        {/* ==================================================
            SUCCESS MESSAGE
            ================================================== */}

        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl mt-6 p-5">

            <h3 className="font-bold text-green-700">
              ✅ Payment Successful
            </h3>

            <p className="text-green-700 mt-2">
              {isHotelBooking
                ? "आपका Hotel Booking payment successfully verify हो गया है और transaction record हो चुका है।"
                : "आपका payment successfully complete हो गया है।"}
            </p>

          </div>
        )}

        {/* ==================================================
            ACTIONS
            ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          <Link
            href="/service1/history"
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-center"
          >
            ← Payment History
          </Link>

          {isHotelBooking ? (
            <Link
              href={`/service2/hotel/confirmation/${encodeURIComponent(
                transactionId
              )}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-center"
            >
              🏨 Hotel Booking Details
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-center"
            >
              Dashboard
            </Link>
          )}

          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            🖨️ Print Details
          </button>

        </div>

      </div>

    </main>
  );
}