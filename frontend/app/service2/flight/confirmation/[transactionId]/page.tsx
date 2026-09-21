import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

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
    providerReference?: string | null;
    pnr?: string | null;
    bookingStatus?: string;
    provider?: string;
  };

  // Older stored data compatibility
  airline?: string;
  airlineName?: string;
  flightNo?: string;
  flightNumber?: string;
  from?: string;
  to?: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  journeyDate?: string;
  date?: string;
  travelClass?: string;
  cabinClass?: string;
  passengers?: number;

  passengerList?: Array<{
    name?: string;
    age?: string | number;
    gender?: string;
  }>;

  baseFare?: number;
  convenienceFee?: number;
  totalAmount?: number;
};

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

function money(value: number) {
  return value.toLocaleString("en-IN");
}

export default async function FlightConfirmationPage({
  params,
}: PageProps) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { transactionId } =
    await params;

  const transaction =
    await prisma.transaction.findFirst({
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
      );
    }
  } catch {
    details = {};
  }

  // ====================================================
  // NORMALIZED FLIGHT DATA
  // ====================================================

  const flight =
    details.flight;

  const journey =
    details.journey;

  const passenger =
    details.passenger;

  const payment =
    details.payment;

  const providerData =
    details.provider;

  const airline =
    flight?.airlineName ||
    details.airlineName ||
    details.airline ||
    "Flight Booking";

  const flightNo =
    flight?.flightNumber ||
    details.flightNumber ||
    details.flightNo ||
    "-";

  const from =
    flight?.from ||
    details.from ||
    "-";

  const to =
    flight?.to ||
    details.to ||
    "-";

  const departure =
    flight?.departureTime ||
    details.departure ||
    "-";

  const arrival =
    flight?.arrivalTime ||
    details.arrival ||
    "-";

  const duration =
    flight?.duration ||
    details.duration ||
    "-";

  const journeyDate =
    journey?.journeyDate ||
    details.journeyDate ||
    details.date ||
    "-";

  const travelClass =
    flight?.cabinClass ||
    details.travelClass ||
    details.cabinClass ||
    "-";

  // ====================================================
  // PAYMENT STATUS
  // ====================================================

  const paymentVerified =
    transaction.status === "SUCCESS" &&
    Boolean(
      transaction.razorpayPaymentId
    );

  // ====================================================
  // BOOKING STATUS
  // ====================================================
  //
  // Payment SUCCESS is NOT enough.
  // Provider-confirmed status + provider reference/PNR
  // are required before showing confirmed booking.
  // ====================================================

  const providerReference =
    providerData?.pnr ||
    providerData?.providerReference ||
    providerData?.confirmationId ||
    "";

  const bookingConfirmed =
    providerData?.bookingStatus ===
      "CONFIRMED" &&
    Boolean(providerReference);

  // ====================================================
  // PASSENGERS
  // ====================================================

  const passengerList =
    passenger?.name
      ? [
          {
            name:
              passenger.name,
            age:
              passenger.age,
            gender:
              passenger.gender,
          },
        ]
      : Array.isArray(
            details.passengerList
          )
        ? details.passengerList
        : [];

  const totalPassengers =
    journey?.totalPassengers ??
    details.passengers ??
    passengerList.length;

  // ====================================================
  // AMOUNT
  // ====================================================

  const totalAmount =
    payment?.totalAmount ??
    details.totalAmount ??
    Number(
      transaction.amount
    );

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            ✈️ Flight Booking Status
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Payment और provider booking
            confirmation अलग-अलग verify की जाती हैं।
          </p>
        </div>

        {/* BOOKING STATUS */}

        {bookingConfirmed ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <h2 className="text-xl font-bold text-green-800">
              Flight Booking Confirmed
            </h2>

            <p className="mt-2 text-sm text-green-700">
              Provider से verified booking
              reference प्राप्त हो गया है।
            </p>

            <div className="mt-4">
              <p className="text-xs text-green-700">
                Provider Reference / PNR
              </p>

              <p className="break-all font-bold text-green-900">
                {providerReference}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-xl font-bold text-amber-800">
              Flight Booking Not Confirmed
            </h2>

            <p className="mt-2 text-sm text-amber-800">
              Verified provider booking
              reference/PNR उपलब्ध नहीं है।
              इसलिए इस record को confirmed
              flight ticket नहीं माना जा रहा है।
            </p>
          </div>
        )}

        {/* PAYMENT STATUS */}

        <div
          className={`mt-6 rounded-2xl border p-6 ${
            paymentVerified
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2 className="text-xl font-bold text-gray-900">
            Payment Status
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                Payment
              </p>

              <p
                className={`font-bold ${
                  paymentVerified
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                {paymentVerified
                  ? "Verified"
                  : "Not Verified"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Payment ID
              </p>

              <p className="break-all font-bold text-gray-900">
                {transaction.razorpayPaymentId ||
                  "-"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Transaction ID
            </p>

            <p className="break-all font-bold text-gray-900">
              {transaction.transactionId}
            </p>
          </div>
        </div>

        {/* FLIGHT DETAILS */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Flight Details
          </h2>

          {!bookingConfirmed && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              ये stored booking details हैं।
              इन्हें live airline confirmation
              या valid ticket न मानें।
            </div>
          )}

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
            </div>

            <div>
              <p className="text-xs text-gray-500">
                To
              </p>

              <p className="font-semibold text-gray-900">
                {to}
              </p>
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

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-3">
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

          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500">
              Passengers
            </p>

            <p className="font-semibold text-gray-900">
              {totalPassengers || "-"}
            </p>
          </div>
        </div>

        {/* PASSENGERS */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Passenger Details
          </h2>

          {passengerList.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Passenger details उपलब्ध
              नहीं हैं।
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {passengerList.map(
                (
                  currentPassenger,
                  index
                ) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <p className="font-bold text-gray-900">
                      Passenger{" "}
                      {index + 1}:{" "}
                      {currentPassenger.name ||
                        "-"}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Age
                        </p>

                        <p className="font-medium text-gray-900">
                          {currentPassenger.age ??
                            "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Gender
                        </p>

                        <p className="font-medium text-gray-900">
                          {currentPassenger.gender ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* AMOUNT */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Payment Record
          </h2>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              Transaction Amount
            </span>

            <span className="text-3xl font-bold text-gray-900">
              ₹{money(totalAmount)}
            </span>
          </div>

          <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
            <p>
              Stored Provider:{" "}
              <span className="font-semibold text-gray-900">
                {transaction.provider ||
                  "-"}
              </span>
            </p>

            <p>
              Created On:{" "}
              <span className="font-semibold text-gray-900">
                {transaction.createdAt.toLocaleString(
                  "en-IN"
                )}
              </span>
            </p>
          </div>
        </div>

        {/* SAFETY NOTE */}

        {!bookingConfirmed && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-bold text-amber-800">
              Important
            </p>

            <p className="mt-1 text-sm text-amber-800">
              Payment record और flight
              booking confirmation अलग
              हैं। Verified provider
              reference/PNR मिलने के बाद
              ही booking को confirmed
              माना जाएगा।
            </p>
          </div>
        )}

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
            Flight Search →
          </Link>
        </div>
      </div>
    </main>
  );
}