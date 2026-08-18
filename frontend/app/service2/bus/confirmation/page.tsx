"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

type ParsedBooking = {
  from: string;
  to: string;
  journeyDate: string;
  passengerName: string;
  seatNumber: string;
};

export default function BusConfirmationPage() {
  const params = useParams();
  const router = useRouter();

  const transactionId =
    params.transactionId as string;

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [booking, setBooking] =
    useState<ParsedBooking | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadTransaction() {
      try {
        setLoading(true);
        setError("");

        if (!transactionId) {
          setError(
            "Transaction ID उपलब्ध नहीं है।"
          );
          return;
        }

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

        const tx =
          data.transaction as Transaction;

        setTransaction(tx);

        // ==========================================
        // PARSE BUS DESCRIPTION
        // ==========================================

        const parsed =
          parseBusDescription(
            tx.description
          );

        setBooking(parsed);
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

    loadTransaction();
  }, [transactionId]);

  // ==================================================
  // PARSE DESCRIPTION
  // ==================================================

  function parseBusDescription(
    description: string | null
  ): ParsedBooking | null {
    if (!description) {
      return null;
    }

    /*
      Expected format:

      Bus Booking | lalitpur → bhopal | 2026-08-01 |
      Passenger: ajay | Seat: 1
    */

    const parts =
      description
        .split("|")
        .map((part) => part.trim());

    if (parts.length < 5) {
      return null;
    }

    const route =
      parts[1] || "";

    const routeParts =
      route.split("→").map(
        (part) => part.trim()
      );

    const from =
      routeParts[0] || "";

    const to =
      routeParts[1] || "";

    const journeyDate =
      parts[2] || "";

    const passengerText =
      parts[3] || "";

    const seatText =
      parts[4] || "";

    const passengerName =
      passengerText
        .replace(
          /^Passenger:\s*/i,
          ""
        )
        .trim();

    const seatNumber =
      seatText
        .replace(
          /^Seat:\s*/i,
          ""
        )
        .trim();

    return {
      from,
      to,
      journeyDate,
      passengerName,
      seatNumber,
    };
  }

  // ==================================================
  // FORMAT DATE
  // ==================================================

  function formatDate(
    dateString: string
  ) {
    if (!dateString) {
      return "-";
    }

    const date =
      new Date(
        `${dateString}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateString;
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

  // ==================================================
  // PRINT
  // ==================================================

  function printTicket() {
    window.print();
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">

        <header className="bg-white shadow-sm px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <div className="text-5xl">
              ⏳
            </div>

            <p className="text-gray-600 mt-4">
              Booking confirmation load हो रही है...
            </p>
          </div>
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
          <div className="max-w-6xl mx-auto">

            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>

          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-8 text-center">

            <div className="text-5xl">
              ❌
            </div>

            <h2 className="text-2xl font-bold mt-4">
              Booking Details नहीं मिलीं
            </h2>

            <p className="mt-2">
              {error ||
                "Booking information उपलब्ध नहीं है।"}
            </p>

            <Link
              href="/service2"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Service 2 पर जाएँ
            </Link>

          </div>

        </div>

      </main>
    );
  }

  const paymentSuccess =
    transaction.status ===
    "SUCCESS";

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm px-6 py-4 print:hidden">

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

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* SUCCESS HEADER */}

        <div className="bg-green-600 text-white rounded-xl shadow p-8 text-center">

          <div className="text-5xl">
            ✅
          </div>

          <h2 className="text-3xl font-bold mt-4">
            Bus Booking Confirmed
          </h2>

          <p className="mt-2 text-green-100">
            आपका Bus Booking payment सफलतापूर्वक पूरा हो गया है।
          </p>

        </div>

        {/* TICKET */}

        <div
          id="bus-ticket"
          className="bg-white rounded-xl shadow mt-6 overflow-hidden"
        >

          {/* TICKET HEADER */}

          <div className="border-b border-gray-200 p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  Booking ID
                </p>

                <p className="text-xl font-bold text-blue-700 break-all">
                  {transaction.transactionId}
                </p>
              </div>

              <div className="text-left md:text-right">

                <p className="text-sm text-gray-500">
                  Payment Status
                </p>

                <span className="inline-block mt-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                  {transaction.status}
                </span>

              </div>

            </div>

          </div>

          {/* ROUTE */}

          <div className="p-6">

            <h3 className="text-xl font-bold text-gray-900 mb-5">
              🚌 Journey Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">
                  From
                </p>

                <p className="text-lg font-bold text-gray-900 mt-1">
                  {booking?.from || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  To
                </p>

                <p className="text-lg font-bold text-gray-900 mt-1">
                  {booking?.to || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Journey Date
                </p>

                <p className="font-bold text-gray-900 mt-1">
                  {formatDate(
                    booking?.journeyDate || ""
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Bus ID
                </p>

                <p className="font-bold text-gray-900 mt-1">
                  {transaction.referenceId ||
                    "-"}
                </p>
              </div>

            </div>

          </div>

          {/* PASSENGER */}

          <div className="border-t border-gray-200 p-6">

            <h3 className="text-xl font-bold text-gray-900 mb-5">
              👤 Passenger Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">
                  Passenger Name
                </p>

                <p className="font-bold text-gray-900 mt-1">
                  {booking?.passengerName ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Seat Number
                </p>

                <p className="font-bold text-blue-700 mt-1">
                  {booking?.seatNumber ||
                    "-"}
                </p>
              </div>

            </div>

          </div>

          {/* PAYMENT */}

          <div className="border-t border-gray-200 p-6">

            <h3 className="text-xl font-bold text-gray-900 mb-5">
              💳 Payment Details
            </h3>

            <div className="space-y-4">

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Booking Amount
                </span>

                <span className="font-bold text-gray-900">
                  ₹
                  {Number(
                    transaction.amount
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Transaction ID
                </span>

                <span className="font-semibold text-gray-900 break-all text-right">
                  {transaction.transactionId}
                </span>
              </div>

              {transaction.razorpayPaymentId && (
                <div className="flex flex-col md:flex-row md:justify-between gap-2">

                  <span className="text-gray-500">
                    Razorpay Payment ID
                  </span>

                  <span className="font-semibold text-gray-900 break-all md:text-right">
                    {transaction.razorpayPaymentId}
                  </span>

                </div>
              )}

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Booking Status
                </span>

                <span className="font-bold text-green-600">
                  {paymentSuccess
                    ? "CONFIRMED"
                    : transaction.status}
                </span>
              </div>

            </div>

          </div>

          {/* IMPORTANT NOTE */}

          <div className="border-t border-gray-200 bg-yellow-50 p-5">

            <p className="font-bold text-yellow-800">
              Important
            </p>

            <p className="text-yellow-700 text-sm mt-1">
              यह booking confirmation आपके payment transaction पर आधारित है।
              वास्तविक bus operator PNR / ticket number provider API जुड़ने के बाद generate होगा।
            </p>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">

          <button
            type="button"
            onClick={printTicket}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700"
          >
            🖨️ Print Ticket
          </button>

          <Link
            href="/service2"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 text-center"
          >
            Service 2 पर जाएँ
          </Link>

          <Link
            href={`/service1/history/${encodeURIComponent(
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