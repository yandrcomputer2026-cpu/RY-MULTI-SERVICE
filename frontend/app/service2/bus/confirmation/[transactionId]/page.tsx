"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  updatedAt: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
};

type BookingDetails = {
  operator: string;
  busType: string;
  from: string;
  to: string;
  journeyDate: string;
  departure: string;
  arrival: string;
  duration: string;
  passengerName: string;
  passengerAge: string;
  passengerGender: string;
  passengerMobile: string;
  seatNumber: string;
  bookingStatus: string;
  providerReference: string;
};

export default function BusConfirmationPage() {
  const params = useParams();

  const transactionId =
    params.transactionId as string;

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [booking, setBooking] =
    useState<BookingDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setError("");

        if (!transactionId) {
          setError(
            "Transaction ID उपलब्ध नहीं है।"
          );
          return;
        }

        const response = await fetch(
          `/api/payment/transaction/${encodeURIComponent(
            transactionId
          )}`,
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
              "Booking details load नहीं हो सकीं।"
          );
          return;
        }

        const transactionData =
          data.transaction as Transaction;

        setTransaction(
          transactionData
        );

        setBooking(
          parseBookingDescription(
            transactionData.description,
            transactionData.provider
          )
        );
      } catch (error) {
        console.error(
          "BUS CONFIRMATION ERROR:",
          error
        );

        setError(
          "Booking details load करते समय server error आया।"
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [transactionId]);

  function parseBookingDescription(
    description: string | null,
    provider: string | null
  ): BookingDetails | null {
    if (!description) {
      return null;
    }

    try {
      const data =
        JSON.parse(description);

      if (
        data?.bookingType ===
        "BUS_BOOKING"
      ) {
        return {
          operator:
            data?.bus?.operator || "",

          busType:
            data?.bus?.busType || "",

          from:
            data?.bus?.from || "",

          to:
            data?.bus?.to || "",

          journeyDate:
            data?.bus?.journeyDate || "",

          departure:
            data?.bus?.departure || "",

          arrival:
            data?.bus?.arrival || "",

          duration:
            data?.bus?.duration || "",

          passengerName:
            data?.passenger?.name || "",

          passengerAge:
            data?.passenger?.age !== undefined
              ? String(data.passenger.age)
              : "",

          passengerGender:
            data?.passenger?.gender || "",

          passengerMobile:
            data?.passenger?.mobile || "",

          seatNumber:
            data?.passenger?.seatNumber !== undefined
              ? String(
                  data.passenger.seatNumber
                )
              : "",

          bookingStatus:
            data?.providerBooking?.status ||
            data?.bookingStatus ||
            "NOT_CONFIRMED",

          providerReference:
            data?.providerBooking
              ?.providerReference ||
            data?.providerReference ||
            "",
        };
      }
    } catch {
      console.log(
        "OLD BUS BOOKING FORMAT DETECTED"
      );
    }

    const parts =
      description
        .split("|")
        .map((item) =>
          item.trim()
        );

    if (parts.length < 5) {
      return {
        operator:
          provider || "",
        busType: "Bus",
        from: "",
        to: "",
        journeyDate: "",
        departure: "",
        arrival: "",
        duration: "",
        passengerName: "",
        passengerAge: "",
        passengerGender: "",
        passengerMobile: "",
        seatNumber: "",
        bookingStatus:
          "NOT_CONFIRMED",
        providerReference: "",
      };
    }

    const route =
      parts[1] || "";

    const routeParts =
      route
        .split("→")
        .map((item) =>
          item.trim()
        );

    return {
      operator:
        provider || "",

      busType: "Bus",

      from:
        routeParts[0] || "",

      to:
        routeParts[1] || "",

      journeyDate:
        parts[2] || "",

      departure: "",
      arrival: "",
      duration: "",

      passengerName:
        (parts[3] || "")
          .replace(
            /^Passenger:\s*/i,
            ""
          )
          .trim(),

      passengerAge: "",
      passengerGender: "",
      passengerMobile: "",

      seatNumber:
        (parts[4] || "")
          .replace(
            /^Seat:\s*/i,
            ""
          )
          .trim(),

      bookingStatus:
        "NOT_CONFIRMED",

      providerReference: "",
    };
  }

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <div className="text-5xl">
              ⏳
            </div>

            <p className="text-gray-600 mt-4">
              Bus booking details load हो रही हैं...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (
    error ||
    !transaction
  ) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-8 text-center">
            <div className="text-5xl">
              ❌
            </div>

            <h2 className="text-2xl font-bold mt-4">
              Bus Booking Details नहीं मिलीं
            </h2>

            <p className="mt-2">
              {error ||
                "Booking information उपलब्ध नहीं है।"}
            </p>

            <Link
              href="/service2/bus"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              ← Bus Search पर वापस जाएँ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Payment और booking अलग-अलग facts हैं.
  const paymentVerified =
    transaction.status === "SUCCESS" &&
    Boolean(
      transaction.razorpayPaymentId
    );

  const bookingConfirmed =
    booking?.bookingStatus ===
      "CONFIRMED" &&
    Boolean(
      booking.providerReference
    );

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

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div
          className={`rounded-xl border p-6 ${
            bookingConfirmed
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <h2
            className={`text-2xl font-bold ${
              bookingConfirmed
                ? "text-green-800"
                : "text-amber-800"
            }`}
          >
            {bookingConfirmed
              ? "Bus Booking Confirmed"
              : "Bus Booking Not Confirmed"}
          </h2>

          <p
            className={`mt-2 ${
              bookingConfirmed
                ? "text-green-700"
                : "text-amber-800"
            }`}
          >
            {bookingConfirmed
              ? "Authorized Bus provider से booking confirmation प्राप्त हुआ है।"
              : "Authorized Bus provider से verified booking confirmation / PNR उपलब्ध नहीं है।"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow mt-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm text-gray-500">
              Internal Transaction ID
            </p>

            <p className="font-bold text-xl text-blue-700 mt-1 break-all">
              {transaction.transactionId}
            </p>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              🚌 Bus Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Detail
                label="Operator"
                value={booking?.operator}
              />

              <Detail
                label="Bus Type"
                value={booking?.busType}
              />

              <Detail
                label="From"
                value={booking?.from}
              />

              <Detail
                label="To"
                value={booking?.to}
              />

              <Detail
                label="Journey Date"
                value={formatDate(
                  booking?.journeyDate ||
                    ""
                )}
              />

              <Detail
                label="Departure"
                value={booking?.departure}
              />

              <Detail
                label="Arrival"
                value={booking?.arrival}
              />

              <Detail
                label="Duration"
                value={booking?.duration}
              />

              <Detail
                label="Seat Number"
                value={booking?.seatNumber}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              👤 Passenger Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Detail
                label="Passenger Name"
                value={
                  booking?.passengerName
                }
              />

              <Detail
                label="Age"
                value={
                  booking?.passengerAge
                }
              />

              <Detail
                label="Gender"
                value={
                  booking?.passengerGender
                }
              />

              <Detail
                label="Mobile"
                value={
                  booking?.passengerMobile
                }
              />
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              💳 Payment & Booking Status
            </h3>

            <div className="space-y-4">
              <StatusRow
                label="Payment Status"
                value={
                  paymentVerified
                    ? "VERIFIED"
                    : transaction.status
                }
                success={
                  paymentVerified
                }
              />

              <StatusRow
                label="Booking Status"
                value={
                  bookingConfirmed
                    ? "CONFIRMED"
                    : "NOT CONFIRMED"
                }
                success={
                  bookingConfirmed
                }
              />

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Amount
                </span>

                <span className="font-bold text-gray-900">
                  ₹
                  {Number(
                    transaction.amount
                  ).toFixed(2)}
                </span>
              </div>

              {transaction.razorpayPaymentId && (
                <Detail
                  label="Razorpay Payment ID"
                  value={
                    transaction.razorpayPaymentId
                  }
                />
              )}

              {booking?.providerReference && (
                <Detail
                  label="Provider Booking Reference / PNR"
                  value={
                    booking.providerReference
                  }
                />
              )}
            </div>
          </div>

          {!bookingConfirmed && (
            <div className="border-t border-amber-200 bg-amber-50 p-5">
              <p className="font-bold text-amber-800">
                Demo / Setup Mode
              </p>

              <p className="text-sm text-amber-800 mt-1">
                Payment record और Bus booking confirmation अलग हैं।
                Authorized Bus provider से verified booking response
                और provider reference / PNR मिलने तक इसे confirmed
                ticket नहीं माना जाएगा।
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/service2/bus"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 text-center"
          >
            ← Bus Search
          </Link>

          <Link
            href={`/history/bus/${encodeURIComponent(
              transaction.transactionId
            )}`}
            className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-900 text-center"
          >
            Transaction Details
          </Link>
        </div>
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="font-bold text-gray-900 mt-1 break-all">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  success,
}: {
  label: string;
  value: string;
  success: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-500">
        {label}
      </span>

      <span
        className={`font-bold ${
          success
            ? "text-green-600"
            : "text-amber-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
}