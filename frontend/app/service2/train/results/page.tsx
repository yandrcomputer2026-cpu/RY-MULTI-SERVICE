"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const demoTrains = [
  {
    trainNo: "12952",
    trainName: "Mumbai Rajdhani Express",
    departure: "16:25",
    arrival: "08:15",
    duration: "15h 50m",
    available: "AVAILABLE 24",
    fare: 850,
  },
  {
    trainNo: "12954",
    trainName: "August Kranti Rajdhani",
    departure: "17:40",
    arrival: "09:45",
    duration: "16h 05m",
    available: "AVAILABLE 18",
    fare: 790,
  },
  {
    trainNo: "22222",
    trainName: "CSMT Rajdhani Express",
    departure: "16:55",
    arrival: "08:35",
    duration: "15h 40m",
    available: "AVAILABLE 11",
    fare: 920,
  },
];

function TrainResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const passengers = searchParams.get("passengers") || "1";
  const travelClass = searchParams.get("class") || "SL";

  function handleSelectTrain(train: (typeof demoTrains)[0]) {
    const params = new URLSearchParams({
      from,
      to,
      date,
      passengers,
      class: travelClass,
      trainNo: train.trainNo,
      trainName: train.trainName,
      departure: train.departure,
      arrival: train.arrival,
      duration: train.duration,
      fare: String(train.fare),
    });

    router.push(`/service2/train/details?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            🚆 Train Results
          </h1>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div>
              <p className="text-xs text-gray-500">From</p>
              <p className="font-semibold text-gray-900">{from}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">To</p>
              <p className="font-semibold text-gray-900">{to}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Journey Date</p>
              <p className="font-semibold text-gray-900">{date}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Passengers</p>
              <p className="font-semibold text-gray-900">{passengers}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Class</p>
              <p className="font-semibold text-gray-900">{travelClass}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {demoTrains.map((train) => (
            <div
              key={train.trainNo}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {train.trainName}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Train No: {train.trainNo}
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {train.departure}
                    </p>
                    <p className="text-xs text-gray-500">{from}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {train.duration}
                    </p>
                    <div className="mt-1 h-px w-20 bg-gray-300" />
                  </div>

                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {train.arrival}
                    </p>
                    <p className="text-xs text-gray-500">{to}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-sm font-semibold text-green-600">
                    {train.available}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Class: {travelClass}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Fare per passenger
                    </p>

                    <p className="text-xl font-bold text-gray-900">
                      ₹{train.fare}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectTrain(train)}
                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Select Train →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            अभी यह demo train data है। बाद में real Train API connect करके
            actual trains, availability और fare दिखाएँगे।
          </p>
        </div>
      </div>
    </main>
  );
}

export default function TrainResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-gray-600">
            Train results load हो रहे हैं...
          </p>
        </main>
      }
    >
      <TrainResultsContent />
    </Suspense>
  );
}