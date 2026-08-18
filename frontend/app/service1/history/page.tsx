"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ======================================================
// TYPES
// ======================================================

type Transaction = {
  id: number;
  transactionId: string;
  service: string;
  category: string | null;
  description: string | null;
  amount: string;
  status: string;
  referenceId: string | null;
  provider: string | null;
  createdAt: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
};

type HotelBookingData = {
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

function getStatusClass(
  status: string
) {
  switch (
    status.toUpperCase()
  ) {
    case "SUCCESS":
    case "RECHARGE_SUCCESS":
      return "bg-green-100 text-green-700";

    case "FAILED":
    case "RECHARGE_FAILED":
      return "bg-red-100 text-red-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ======================================================
// SERVICE NAME
// ======================================================

function getServiceName(
  service: string
) {
  switch (service) {
    case "MOBILE_PREPAID":
      return "Mobile Prepaid Recharge";

    case "MOBILE_POSTPAID":
      return "Mobile Postpaid";

    case "DTH":
      return "DTH Recharge";

    case "ELECTRICITY":
    case "ELECTRICITY_BILL":
      return "Electricity Bill";

    case "HOTEL_BOOKING":
      return "Hotel Booking";

    case "BUS_BOOKING":
      return "Bus Booking";

    default:
      return service;
  }
}

// ======================================================
// PARSE HOTEL BOOKING
// ======================================================

function parseHotelBooking(
  description: string | null
): HotelBookingData | null {
  if (!description) {
    return null;
  }

  try {
    const data =
      JSON.parse(
        description
      ) as HotelBookingData;

    if (
      data.bookingType !==
        "HOTEL_BOOKING" &&
      !data.hotel &&
      !data.stay &&
      !data.room
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

// ======================================================
// DATE FORMAT
// ======================================================

function formatShortDate(
  value?: string
) {
  if (!value) {
    return "";
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
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );
}

// ======================================================
// HOTEL SUMMARY
// ======================================================

function getHotelSummary(
  booking: HotelBookingData
) {
  const hotelName =
    booking.hotel?.hotelName ||
    "Hotel";

  const city =
    booking.hotel?.city ||
    "";

  const checkIn =
    formatShortDate(
      booking.stay?.checkIn
    );

  const checkOut =
    formatShortDate(
      booking.stay?.checkOut
    );

  const guestName =
    booking.guest?.name ||
    "-";

  const rooms =
    booking.stay?.rooms ??
    0;

  const location =
    booking.hotel?.location ||
    "";

  const dates =
    checkIn && checkOut
      ? `${checkIn} → ${checkOut}`
      : "";

  const place =
    city
      ? city
      : location;

  const parts = [
    hotelName,
    place,
    dates,
    `Guest: ${guestName}`,
    `Rooms: ${rooms}`,
  ].filter(Boolean);

  return parts.join(
    " | "
  );
}

// ======================================================
// GENERIC DESCRIPTION
// ======================================================

function getDisplayDescription(
  transaction: Transaction
) {
  if (
    transaction.service ===
    "HOTEL_BOOKING"
  ) {
    const hotelBooking =
      parseHotelBooking(
        transaction.description
      );

    if (hotelBooking) {
      return getHotelSummary(
        hotelBooking
      );
    }
  }

  return (
    transaction.description ||
    ""
  );
}

// ======================================================
// PAGE
// ======================================================

export default function PaymentHistoryPage() {
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==================================================
  // FILTER STATE
  // ==================================================

  const [
    serviceFilter,
    setServiceFilter,
  ] = useState("ALL");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  // ==================================================
  // LOAD HISTORY
  // ==================================================

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/payment/history",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          setError(
            data.message ||
              "Payment history load नहीं हो सकी।"
          );

          return;
        }

        setTransactions(
          data.transactions ||
            []
        );
      } catch (error) {
        console.error(
          "HISTORY LOAD ERROR:",
          error
        );

        setError(
          "Server से connection नहीं हो पाया।"
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  // ==================================================
  // FILTERED TRANSACTIONS
  // ==================================================

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          const serviceMatch =
            serviceFilter ===
              "ALL" ||
            transaction.service ===
              serviceFilter;

          const normalizedStatus =
            transaction.status.toUpperCase();

          const statusMatch =
            statusFilter ===
              "ALL" ||
            normalizedStatus ===
              statusFilter ||
            (statusFilter ===
              "SUCCESS" &&
              normalizedStatus ===
                "RECHARGE_SUCCESS") ||
            (statusFilter ===
              "FAILED" &&
              normalizedStatus ===
                "RECHARGE_FAILED");

          return (
            serviceMatch &&
            statusMatch
          );
        }
      );
    }, [
      transactions,
      serviceFilter,
      statusFilter,
    ]);

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ==================================================
          HEADER
          ================================================== */}

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
              href="/service1"
              className="text-gray-600 hover:text-blue-600"
            >
              Online Payments
            </Link>

          </div>

        </div>

      </header>

      {/* ==================================================
          MAIN
          ================================================== */}

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ==================================================
            PAGE HEADING
            ================================================== */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            📊 Payment History
          </h2>

          <p className="text-gray-600 mt-2">
            आपके सभी payment, recharge और booking की जानकारी।
          </p>

        </div>

        {/* ==================================================
            LOADING
            ================================================== */}

        {loading && (
          <div className="bg-white rounded-xl shadow p-8 text-center">

            <p className="text-gray-600">
              Payment history loading...
            </p>

          </div>
        )}

        {/* ==================================================
            ERROR
            ================================================== */}

        {!loading &&
          error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
              {error}
            </div>
          )}

        {/* ==================================================
            CONTENT
            ================================================== */}

        {!loading &&
          !error && (
            <>

              {/* ==================================================
                  FILTER BOX
                  ================================================== */}

              <div className="bg-white rounded-xl shadow p-6 mb-6">

                <div className="flex flex-col md:flex-row gap-5">

                  {/* SERVICE */}

                  <div className="flex-1">

                    <label
                      htmlFor="serviceFilter"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Service
                    </label>

                    <select
                      id="serviceFilter"
                      value={
                        serviceFilter
                      }
                      onChange={(
                        event
                      ) =>
                        setServiceFilter(
                          event.target
                            .value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      <option value="ALL">
                        All Services
                      </option>

                      <option value="MOBILE_PREPAID">
                        Mobile Prepaid
                      </option>

                      <option value="MOBILE_POSTPAID">
                        Mobile Postpaid
                      </option>

                      <option value="DTH">
                        DTH Recharge
                      </option>

                      <option value="ELECTRICITY">
                        Electricity Bill
                      </option>

                      <option value="HOTEL_BOOKING">
                        Hotel Booking
                      </option>

                      <option value="BUS_BOOKING">
                        Bus Booking
                      </option>

                    </select>

                  </div>

                  {/* STATUS */}

                  <div className="flex-1">

                    <label
                      htmlFor="statusFilter"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Status
                    </label>

                    <select
                      id="statusFilter"
                      value={
                        statusFilter
                      }
                      onChange={(
                        event
                      ) =>
                        setStatusFilter(
                          event.target
                            .value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      <option value="ALL">
                        All Status
                      </option>

                      <option value="SUCCESS">
                        Success
                      </option>

                      <option value="PENDING">
                        Pending
                      </option>

                      <option value="FAILED">
                        Failed
                      </option>

                    </select>

                  </div>

                  {/* RESET */}

                  <div className="flex items-end">

                    <button
                      type="button"
                      onClick={() => {
                        setServiceFilter(
                          "ALL"
                        );

                        setStatusFilter(
                          "ALL"
                        );
                      }}
                      className="w-full md:w-auto bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900"
                    >
                      Reset Filter
                    </button>

                  </div>

                </div>

                {/* COUNT */}

                <div className="mt-5 pt-4 border-t border-gray-200">

                  <p className="text-sm text-gray-600">

                    कुल transactions:{" "}

                    <span className="font-bold text-gray-900">
                      {
                        filteredTransactions.length
                      }
                    </span>

                  </p>

                </div>

              </div>

              {/* ==================================================
                  NO TRANSACTIONS
                  ================================================== */}

              {transactions.length ===
                0 && (
                <div className="bg-white rounded-xl shadow p-10 text-center">

                  <div className="text-5xl">
                    📭
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mt-4">
                    No Transactions Yet
                  </h3>

                  <p className="text-gray-500 mt-2">
                    अभी तक कोई payment, recharge या booking नहीं किया गया है।
                  </p>

                  <Link
                    href="/service1/mobile-prepaid"
                    className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Mobile Recharge करें →
                  </Link>

                </div>
              )}

              {/* ==================================================
                  FILTERED EMPTY
                  ================================================== */}

              {transactions.length >
                0 &&
                filteredTransactions.length ===
                  0 && (
                <div className="bg-white rounded-xl shadow p-10 text-center">

                  <div className="text-5xl">
                    🔍
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mt-4">
                    कोई Transaction नहीं मिला
                  </h3>

                  <p className="text-gray-500 mt-2">
                    चुने गए Service और Status के अनुसार कोई transaction उपलब्ध नहीं है।
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setServiceFilter(
                        "ALL"
                      );

                      setStatusFilter(
                        "ALL"
                      );
                    }}
                    className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Filters Reset करें
                  </button>

                </div>
              )}

              {/* ==================================================
                  TRANSACTIONS
                  ================================================== */}

              {filteredTransactions.length >
                0 && (
                <div className="space-y-5">

                  {filteredTransactions.map(
                    (
                      transaction
                    ) => {

                      const isHotelBooking =
                        transaction.service ===
                        "HOTEL_BOOKING";

                      const hotelBooking =
                        isHotelBooking
                          ? parseHotelBooking(
                              transaction.description
                            )
                          : null;

                      const displayDescription =
                        getDisplayDescription(
                          transaction
                        );

                      return (
                        <div
                          key={
                            transaction.id
                          }
                          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
                        >

                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                            {/* ==================================================
                                LEFT
                                ================================================== */}

                            <div className="flex-1">

                              <h3 className="text-xl font-bold text-gray-900">
                                {
                                  getServiceName(
                                    transaction.service
                                  )
                                }
                              </h3>

                              {/* ==================================================
                                  HOTEL SUMMARY
                                  ================================================== */}

                              {isHotelBooking &&
                                hotelBooking ? (
                                <div className="mt-2">

                                  <p className="text-sm text-gray-500">
                                    {
                                      displayDescription
                                    }
                                  </p>

                                  {hotelBooking
                                    .room
                                    ?.roomType && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      Room:{" "}
                                      <span className="font-semibold text-gray-700">
                                        {
                                          hotelBooking
                                            .room
                                            .roomType
                                        }
                                      </span>

                                      {hotelBooking
                                        .room
                                        .mealPlan && (
                                        <>
                                          {" "}
                                          | Meal Plan:{" "}
                                          <span className="font-semibold text-gray-700">
                                            {
                                              hotelBooking
                                                .room
                                                .mealPlan
                                            }
                                          </span>
                                        </>
                                      )}
                                    </p>
                                  )}

                                </div>
                              ) : (
                                transaction.description && (
                                  <p className="text-sm text-gray-500 mt-2 break-words">
                                    {
                                      transaction.description
                                    }
                                  </p>
                                )
                              )}

                              {/* ==================================================
                                  TRANSACTION META
                                  ================================================== */}

                              <div className="mt-4 space-y-2 text-sm">

                                <p>
                                  <span className="font-semibold">
                                    Transaction ID:
                                  </span>{" "}
                                  {
                                    transaction.transactionId
                                  }
                                </p>

                                {transaction.provider && (
                                  <p>
                                    <span className="font-semibold">
                                      {isHotelBooking
                                        ? "Operator / Hotel:"
                                        : "Operator:"}
                                    </span>{" "}
                                    {isHotelBooking &&
                                    hotelBooking
                                      ?.hotel
                                      ?.hotelName
                                      ? hotelBooking
                                          .hotel
                                          .hotelName
                                      : transaction.provider.toUpperCase()}
                                  </p>
                                )}

                                {transaction.referenceId && (
                                  <p>
                                    <span className="font-semibold">
                                      Reference:
                                    </span>{" "}
                                    {
                                      transaction.referenceId
                                    }
                                  </p>
                                )}

                                <p>
                                  <span className="font-semibold">
                                    Date:
                                  </span>{" "}
                                  {new Date(
                                    transaction.createdAt
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                              </div>

                              {/* ==================================================
                                  VIEW DETAILS
                                  ================================================== */}

                              <div className="mt-5">

                                <Link
                                  href={`/service1/history/${encodeURIComponent(
                                    transaction.transactionId
                                  )}`}
                                  className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                  View Details →
                                </Link>

                              </div>

                            </div>

                            {/* ==================================================
                                RIGHT
                                ================================================== */}

                            <div className="md:text-right">

                              <p className="text-2xl font-bold text-gray-900">

                                ₹
                                {
                                  transaction.amount
                                }

                              </p>

                              <span
                                className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                                  transaction.status
                                )}`}
                              >
                                {
                                  transaction.status
                                }
                              </span>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </>
          )}

        {/* ==================================================
            BACK
            ================================================== */}

        <div className="mt-10">

          <Link
            href="/service1"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900"
          >
            ← Online Payments पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}