"use client";

import { useState } from "react";

export default function TrainPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [travelClass, setTravelClass] = useState("SL");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!from || !to || !journeyDate) {
      alert("कृपया From, To और Journey Date भरें।");
      return;
    }

    console.log({
      from,
      to,
      journeyDate,
      passengers,
      travelClass,
    });

    alert("Train search शुरू हो गया है।");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">

      {/* HEADER */}
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            🚆 Train Booking
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            अपनी ट्रेन खोजें और आसानी से टिकट बुक करें।
          </p>
        </div>

        {/* SEARCH CARD */}
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg">

          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Search Train
          </h2>

          <form onSubmit={handleSearch}>

            {/* FROM / TO */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* FROM */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  From
                </label>

                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="जैसे Delhi"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* TO */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  To
                </label>

                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="जैसे Mumbai"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

            {/* DATE / PASSENGERS / CLASS */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* JOURNEY DATE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Journey Date
                </label>

                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* PASSENGERS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Passengers
                </label>

                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4 Passengers</option>
                  <option value="5">5 Passengers</option>
                  <option value="6">6 Passengers</option>
                </select>
              </div>

              {/* CLASS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Travel Class
                </label>

                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="SL">
                    Sleeper (SL)
                  </option>

                  <option value="3A">
                    AC 3 Tier (3A)
                  </option>

                  <option value="2A">
                    AC 2 Tier (2A)
                  </option>

                  <option value="1A">
                    AC First Class (1A)
                  </option>

                  <option value="CC">
                    Chair Car (CC)
                  </option>

                  <option value="2S">
                    Second Sitting (2S)
                  </option>
                </select>
              </div>

            </div>

            {/* SEARCH BUTTON */}
            <div className="mt-7">

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                🔍 Search Trains
              </button>

            </div>

          </form>
        </div>

        {/* INFORMATION CARDS */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-xl bg-white p-5 text-center shadow-sm">
            <div className="text-3xl">
              🚆
            </div>

            <h3 className="mt-3 font-bold text-gray-900">
              Train Search
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              अपनी पसंद की ट्रेन आसानी से खोजें।
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 text-center shadow-sm">
            <div className="text-3xl">
              👤
            </div>

            <h3 className="mt-3 font-bold text-gray-900">
              Passenger Details
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              यात्री की जानकारी सुरक्षित तरीके से भरें।
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 text-center shadow-sm">
            <div className="text-3xl">
              🎫
            </div>

            <h3 className="mt-3 font-bold text-gray-900">
              Easy Booking
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Payment के बाद confirmation ticket प्राप्त करें।
            </p>
          </div>

        </div>

      </div>

    </main>
  );
}