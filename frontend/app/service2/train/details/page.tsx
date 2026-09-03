"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TrainDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const passengers = searchParams.get("passengers") || "1";
  const travelClass = searchParams.get("class") || "SL";

  const trainNo = searchParams.get("trainNo") || "";
  const trainName = searchParams.get("trainName") || "";
  const departure = searchParams.get("departure") || "";
  const arrival = searchParams.get("arrival") || "";
  const duration = searchParams.get("duration") || "";
  const fare = Number(searchParams.get("fare") || "0");

  const passengerCount = Number(passengers);
  const totalFare = fare * passengerCount;

  function handleContinue() {
    const params = new URLSearchParams({
      from,
      to,
      date,
      passengers,
      class: travelClass,
      trainNo,
      trainName,
      departure,
      arrival,
      duration,
      fare: String(fare),
      totalFare: String(totalFare),
    });

    router.push(`/service2/train/passengers?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            🚆 Train Details
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            चयनित ट्रेन की जानकारी जांचें।
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="border-b border-gray-200 pb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              {trainName}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Train No: {trainNo}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Departure</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {departure}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {from}
              </p>
            </div>

            <div className="text-left md:text-center">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {duration}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Journey Date: {date}
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-sm text-gray-500">Arrival</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {arrival}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {to}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Booking Summary
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">Travel Class</span>
              <span className="font-semibold text-gray-900">
                {travelClass}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">Passengers</span>
              <span className="font-semibold text-gray-900">
                {passengers}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">Fare per passenger</span>
              <span className="font-semibold text-gray-900">
                ₹{fare}
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <span className="text-lg font-bold text-gray-900">
                Total Fare
              </span>

              <span className="text-2xl font-bold text-blue-600">
                ₹{totalFare}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Availability: AVAILABLE
          </p>

          <p className="mt-1 text-sm text-green-700">
            Demo booking flow के लिए सीट उपलब्ध मानी जा रही है।
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            onClick={handleContinue}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Continue to Passenger Details →
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TrainDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-gray-600">
            Train details load हो रही हैं...
          </p>
        </main>
      }
    >
      <TrainDetailsContent />
    </Suspense>
  );
}