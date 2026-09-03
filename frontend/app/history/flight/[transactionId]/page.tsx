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

  const totalAmount =
    Number(
      payment.totalAmount ??
        transaction.amount
    );

  const currency =
    payment.currency || "INR";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            ✈️ Flight Ticket
          </h1>

          <p className="mt-2 text-sm text-green-600">
            आपकी confirmed flight booking details
          </p>
        </div>

        {/* SUCCESS CARD */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-xl font-bold text-green-800">
            Booking {transaction.status} ✅
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs text-green-700">
                Booking ID
              </p>

              <p className="mt-1 break-all font-bold text-green-900">
                {transaction.transactionId}
              </p>
            </div>

            <div>
              <p className="text-xs text-green-700">
                Payment / Reference ID
              </p>

              <p className="mt-1 break-all font-bold text-green-900">
                {transaction.razorpayPaymentId ||
                  transaction.referenceId ||
                  "-"}
              </p>
            </div>
          </div>
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

        {/* JOURNEY / PASSENGER */}
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

        {/* FARE DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Fare Details
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
                Total Paid
              </span>

              <span className="text-3xl font-bold text-green-600">
                ₹{totalAmount}
              </span>
            </div>

            <p className="text-right text-xs text-gray-500">
              Currency: {currency}
            </p>
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900">
            Payment Information
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
                Booking Date
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
            Book Another Flight →
          </Link>
        </div>

      </div>
    </main>
  );
}