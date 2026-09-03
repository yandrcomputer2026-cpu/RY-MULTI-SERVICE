import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Passenger = {
  name?: string;
  age?: string;
  gender?: string;
  berthPreference?: string;
};

type TrainDescription = {
  trainNo?: string;
  trainName?: string;
  from?: string;
  to?: string;
  journeyDate?: string;
  travelClass?: string;
  passengerList?: Passenger[];
  baseFare?: number;
  convenienceFee?: number;
  totalAmount?: number;
  departure?: string;
  arrival?: string;
  duration?: string;
};

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

export default async function TrainTicketPage({
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
      service: "TRAIN_BOOKING",
    },
  });

  if (!transaction) {
    notFound();
  }

  let details: TrainDescription = {};

  try {
    if (transaction.description) {
      details = JSON.parse(transaction.description);
    }
  } catch {
    details = {};
  }

  const passengerList = Array.isArray(details.passengerList)
    ? details.passengerList
    : [];

  const totalAmount =
    details.totalAmount ?? Number(transaction.amount);

  const baseFare =
    details.baseFare ?? Number(transaction.amount);

  const convenienceFee =
    details.convenienceFee ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            🎫 Train Ticket
          </h1>

          <p className="mt-2 text-sm text-green-600">
            आपकी confirmed train booking details
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-xl font-bold text-green-800">
            Booking {transaction.status} ✅
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-green-700">
                Booking ID
              </p>

              <p className="font-bold text-green-900">
                {transaction.transactionId}
              </p>
            </div>

            <div>
              <p className="text-xs text-green-700">
                Payment ID
              </p>

              <p className="break-all font-bold text-green-900">
                {transaction.razorpayPaymentId || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Train Details
          </h2>

          <div className="mt-5 border-b border-gray-200 pb-5">
            <p className="text-lg font-bold text-gray-900">
              {details.trainName || "Train Booking"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Train No: {details.trainNo || "-"}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">From</p>
              <p className="font-semibold text-gray-900">
                {details.from || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">To</p>
              <p className="font-semibold text-gray-900">
                {details.to || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Journey Date
              </p>
              <p className="font-semibold text-gray-900">
                {details.journeyDate || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Class</p>
              <p className="font-semibold text-gray-900">
                {details.travelClass || "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">
                Departure
              </p>
              <p className="font-semibold text-gray-900">
                {details.departure || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Arrival
              </p>
              <p className="font-semibold text-gray-900">
                {details.arrival || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Duration
              </p>
              <p className="font-semibold text-gray-900">
                {details.duration || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Passenger Details
          </h2>

          {passengerList.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Passenger details उपलब्ध नहीं हैं।
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {passengerList.map((passenger, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <p className="font-bold text-gray-900">
                    Passenger {index + 1}: {passenger.name || "-"}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        Age
                      </p>
                      <p className="font-medium text-gray-900">
                        {passenger.age || "-"}
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
                        Berth Preference
                      </p>
                      <p className="font-medium text-gray-900">
                        {passenger.berthPreference || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/history"
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← My History
          </Link>

          <Link
            href="/service2/train"
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            Book Another Train →
          </Link>
        </div>

      </div>
    </main>
  );
}