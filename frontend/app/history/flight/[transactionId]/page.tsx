import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type FlightDescription = {
  bookingType?: string;

  flight?: {
    flightId?: string;
    airlineCode?: string;
    airlineName?: string;
    flightNumber?: string;
    from?: string;
    fromName?: string;
    to?: string;
    toName?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    stops?: number;
    cabinClass?: string;
    refundable?: boolean;
    seatsAvailable?: number;
  };

  journey?: {
    journeyDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    totalPassengers?: number;
  };

  passenger?: {
    name?: string;
    age?: number;
    gender?: string;
    mobile?: string;
  };

  payment?: {
    baseFare?: number;
    taxes?: number;
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

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTransactionStatusClasses(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "SUCCESS") {
    return {
      wrapper: "border-green-200 bg-green-50",
      heading: "text-green-800",
      text: "text-green-700",
      value: "text-green-900",
    };
  }

  if (
    normalizedStatus === "FAILED" ||
    normalizedStatus === "CANCELLED"
  ) {
    return {
      wrapper: "border-red-200 bg-red-50",
      heading: "text-red-800",
      text: "text-red-700",
      value: "text-red-900",
    };
  }

  return {
    wrapper: "border-yellow-200 bg-yellow-50",
    heading: "text-yellow-800",
    text: "text-yellow-700",
    value: "text-yellow-900",
  };
}

export default async function FlightTicketPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { transactionId } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: {
      transactionId,
      userId: user.id,
      service: "FLIGHT_BOOKING",
    },
  });

  if (!transaction) {
    notFound();
  }

  let details: FlightDescription = {};

  try {
    if (transaction.description) {
      details = JSON.parse(
        transaction.description
      ) as FlightDescription;
    }
  } catch (error) {
    console.error(
      "FLIGHT DESCRIPTION PARSE ERROR:",
      error
    );
  }

  const flight = details.flight ?? {};
  const journey = details.journey ?? {};
  const passenger = details.passenger ?? {};
  const payment = details.payment ?? {};

  const airline =
    flight.airlineName || "Flight Booking";

  const flightNo =
    flight.flightNumber || "-";

  const from =
    flight.from || "-";

  const to =
    flight.to || "-";

  const journeyDate =
    journey.journeyDate || "-";

  const travelClass =
    flight.cabinClass || "-";

  const departure =
    flight.departureTime || "-";

  const arrival =
    flight.arrivalTime || "-";

  const duration =
    flight.duration || "-";

  const baseFare =
    Number(payment.baseFare ?? 0);

  const taxes =
    Number(payment.taxes ?? 0);

  const convenienceFee =
    Number(payment.convenienceFee ?? 0);

  const transactionAmount =
    Number(transaction.amount);

  const totalAmount =
    Number(
      payment.totalAmount ??
        (Number.isFinite(transactionAmount)
          ? transactionAmount
          : 0)
    );

  const currency =
    payment.currency || "INR";

  const status = String(
    transaction.status || "PENDING"
  ).toUpperCase();

  const statusClasses =
    getTransactionStatusClasses(status);

  const paymentReference =
    transaction.razorpayPaymentId ||
    transaction.referenceId ||
    "-";

  const hasPaymentReference =
    paymentReference !== "-";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            ✈️ Flight Booking Details
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Transaction और journey details
          </p>
        </div>

        {/* TRANSACTION STATUS */}
        <div
          className={`rounded-2xl border p-6 ${statusClasses.wrapper}`}
        >
          <h2
            className={`text-xl font-bold ${statusClasses.heading}`}
          >
            Transaction Status:{" "}
            {formatStatus(status)}
          </h2>

          <p
            className={`mt-2 text-sm ${statusClasses.text}`}
          >
            यह status transaction record को
            दर्शाता है। इसे confirmed flight
            booking या issued ticket का प्रमाण
            न मानें।
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p
                className={`text-xs ${statusClasses.text}`}
              >
                Transaction ID
              </p>

              <p
                className={`mt-1 break-all font-bold ${statusClasses.value}`}
              >
                {transaction.transactionId}
              </p>
            </div>

            <div>
              <p
                className={`text-xs ${statusClasses.text}`}
              >
                Payment / Reference ID
              </p>

              <p
                className={`mt-1 break-all font-bold ${statusClasses.value}`}
              >
                {paymentReference}
              </p>
            </div>
          </div>
        </div>

        {/* BOOKING CONFIRMATION */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-800">
            ⚠️ Booking Confirmation
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            इस record में verified airline /
            travel-provider booking confirmation
            उपलब्ध नहीं है। इसलिए यह page केवल
            booking request / transaction details
            दिखाता है, confirmed flight ticket
            नहीं।
          </p>
        </div>

        {/* FLIGHT DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Flight Details
          </h2>

          <div className="mt-5 border-b border-gray-200 pb-5">
            <p className="text-lg font-bold text-gray-900">
              {airline}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Flight No: {flightNo}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">
                From
              </p>

              <p className="font-semibold text-gray-900">
                {from}
              </p>

              {flight.fromName && (
                <p className="mt-1 text-xs text-gray-500">
                  {flight.fromName}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500">
                To
              </p>

              <p className="font-semibold text-gray-900">
                {to}
              </p>

              {flight.toName && (
                <p className="mt-1 text-xs text-gray-500">
                  {flight.toName}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Journey Date
              </p>

              <p className="font-semibold text-gray-900">
                {journeyDate}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Class
              </p>

              <p className="font-semibold text-gray-900">
                {travelClass}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">
                Departure
              </p>

              <p className="font-semibold text-gray-900">
                {departure}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Arrival
              </p>

              <p className="font-semibold text-gray-900">
                {arrival}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Duration
              </p>

              <p className="font-semibold text-gray-900">
                {duration}
              </p>
            </div>
          </div>
        </div>

        {/* PASSENGER DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Passenger Details
          </h2>

          {passenger.name ? (
            <div className="mt-5 rounded-xl border border-gray-200 p-4">
              <p className="font-bold text-gray-900">
                Passenger 1: {passenger.name}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Age
                  </p>

                  <p className="font-medium text-gray-900">
                    {passenger.age ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Gender
                  </p>

                  <p className="font-medium text-gray-900">
                    {passenger.gender || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Mobile
                  </p>

                  <p className="font-medium text-gray-900">
                    {passenger.mobile || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Total Passengers
                  </p>

                  <p className="font-medium text-gray-900">
                    {journey.totalPassengers ?? 1}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Passenger details उपलब्ध नहीं हैं।
            </p>
          )}
        </div>

        {/* AMOUNT DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Amount Details
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Base Fare
              </span>

              <span className="font-semibold text-gray-900">
                ₹{baseFare}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Taxes
              </span>

              <span className="font-semibold text-gray-900">
                ₹{taxes}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Convenience Fee
              </span>

              <span className="font-semibold text-gray-900">
                ₹{convenienceFee}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-bold text-gray-900">
                Transaction Amount
              </span>

              <span className="text-3xl font-bold text-blue-600">
                ₹{totalAmount}
              </span>
            </div>

            <p className="text-right text-xs text-gray-500">
              Currency: {currency}
            </p>

            <p className="text-xs leading-5 text-gray-500">
              {hasPaymentReference
                ? "Payment/reference information इस transaction में मौजूद है, लेकिन flight booking confirmation अलग provider verification पर निर्भर करती है।"
                : "Payment/reference ID उपलब्ध नहीं है। यह amount केवल transaction record में दर्ज amount है।"}
            </p>
          </div>
        </div>

        {/* TRANSACTION INFORMATION */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900">
            Transaction Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                Provider
              </p>

              <p className="font-semibold text-gray-900">
                {transaction.provider || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Transaction Date
              </p>

              <p className="font-semibold text-gray-900">
                {transaction.createdAt.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/history"
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← My History
          </Link>

          <Link
            href="/service2/flight"
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            Search Flights →
          </Link>
        </div>
      </div>
    </main>
  );
}