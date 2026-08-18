"use client";

import { useState } from "react";
import Link from "next/link";

type Bus = {
  id: string;
  operator: string;
  busType: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seats: number;
};

const demoBuses: Bus[] = [
  {
    id: "BUS001",
    operator: "UPSRTC",
    busType: "AC Seater",
    departure: "06:30 AM",
    arrival: "12:30 PM",
    duration: "6h 00m",
    price: 650,
    seats: 24,
  },
  {
    id: "BUS002",
    operator: "RSRTC",
    busType: "AC Sleeper",
    departure: "08:00 AM",
    arrival: "02:30 PM",
    duration: "6h 30m",
    price: 850,
    seats: 18,
  },
  {
    id: "BUS003",
    operator: "Shatabdi Travels",
    busType: "Volvo AC",
    departure: "10:30 AM",
    arrival: "05:00 PM",
    duration: "6h 30m",
    price: 999,
    seats: 12,
  },
  {
    id: "BUS004",
    operator: "Royal Travels",
    busType: "AC Sleeper",
    departure: "09:00 PM",
    arrival: "05:30 AM",
    duration: "8h 30m",
    price: 1100,
    seats: 8,
  },
];

export default function BusBookingPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [buses, setBuses] = useState<Bus[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  function searchBuses() {
    setError("");

    if (!from.trim()) {
      setError("Please enter boarding city.");
      return;
    }

    if (!to.trim()) {
      setError("Please enter destination city.");
      return;
    }

    if (!journeyDate) {
      setError("Please select journey date.");
      return;
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setError("From और To city अलग-अलग होनी चाहिए।");
      return;
    }

    setBuses(demoBuses);
    setSearched(true);
  }

  function selectBus(bus: Bus) {
    const params = new URLSearchParams({
      busId: bus.id,
      operator: bus.operator,
      busType: bus.busType,
      from,
      to,
      date: journeyDate,
      departure: bus.departure,
      arrival: bus.arrival,
      duration: bus.duration,
      price: String(bus.price),
    });

    window.location.href = `/service2/bus/booking?${params.toString()}`;
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

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
              href="/service2"
              className="text-gray-600 hover:text-blue-600"
            >
              Service 2
            </Link>

          </div>
        </div>
      </header>

      {/* MAIN */}

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            🚌 Bus Booking
          </h2>

          <p className="text-gray-600 mt-2">
            अपने शहर से destination तक bus search और booking करें।
          </p>

        </div>

        {/* SEARCH BOX */}

        <div className="bg-white rounded-xl shadow p-6">

          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Search Buses
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* FROM */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From
              </label>

              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Boarding city"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* TO */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To
              </label>

              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Destination city"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DATE */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Journey Date
              </label>

              <input
                type="date"
                value={journeyDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* SEARCH BUTTON */}

          <div className="mt-6">

            <button
              type="button"
              onClick={searchBuses}
              className="bg-blue-600 text-white px-7 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              🔍 Search Buses
            </button>

          </div>

        </div>

        {/* SEARCH RESULT */}

        {searched && (
          <div className="mt-8">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Available Buses
                </h3>

                <p className="text-gray-600 mt-1">
                  {from} → {to}
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {buses.length} buses found
              </span>

            </div>

            <div className="space-y-5">

              {buses.map((bus) => (

                <div
                  key={bus.id}
                  className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                    {/* BUS INFO */}

                    <div className="flex-1">

                      <h4 className="text-xl font-bold text-gray-900">
                        {bus.operator}
                      </h4>

                      <p className="text-gray-500 mt-1">
                        {bus.busType}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">

                        <div>
                          <p className="text-xs text-gray-500">
                            Departure
                          </p>

                          <p className="font-bold text-gray-900 mt-1">
                            {bus.departure}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Arrival
                          </p>

                          <p className="font-bold text-gray-900 mt-1">
                            {bus.arrival}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Duration
                          </p>

                          <p className="font-bold text-gray-900 mt-1">
                            {bus.duration}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Available Seats
                          </p>

                          <p className="font-bold text-green-600 mt-1">
                            {bus.seats}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* PRICE + BUTTON */}

                    <div className="lg:text-right">

                      <p className="text-sm text-gray-500">
                        Starting from
                      </p>

                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₹{bus.price}
                      </p>

                      <button
                        type="button"
                        onClick={() => selectBus(bus)}
                        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Select Bus →
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

        {/* BACK */}

        <div className="mt-10">

          <Link
            href="/service2"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900"
          >
            ← Service 2 पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}