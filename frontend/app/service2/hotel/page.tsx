"use client";

import Link from "next/link";
import { useState } from "react";

type Hotel = {
  hotelId: string;
  hotelName: string;
  city: string;
  location: string;
  rating: number;
  reviews: number;
  roomType: string;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  available: boolean;
};

export default function HotelBookingPage() {
  const [city, setCity] =
    useState("");

  const [checkIn, setCheckIn] =
    useState("");

  const [checkOut, setCheckOut] =
    useState("");

  const [guests, setGuests] =
    useState("1");

  const [rooms, setRooms] =
    useState("1");

  const [hotels, setHotels] =
    useState<Hotel[]>([]);

  const [searched, setSearched] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // SEARCH HOTELS
  // ==================================================

  async function searchHotels() {
    setError("");
    setSearched(false);
    setHotels([]);

    if (!city.trim()) {
      setError(
        "Please enter destination city."
      );
      return;
    }

    if (!checkIn) {
      setError(
        "Please select check-in date."
      );
      return;
    }

    if (!checkOut) {
      setError(
        "Please select check-out date."
      );
      return;
    }

    if (checkOut <= checkIn) {
      setError(
        "Check-out date check-in date के बाद होनी चाहिए।"
      );
      return;
    }

    const guestCount =
      Number(guests);

    const roomCount =
      Number(rooms);

    if (
      !Number.isInteger(
        guestCount
      ) ||
      guestCount < 1 ||
      guestCount > 20
    ) {
      setError(
        "Guests की संख्या 1 से 20 के बीच होनी चाहिए।"
      );
      return;
    }

    if (
      !Number.isInteger(
        roomCount
      ) ||
      roomCount < 1 ||
      roomCount > 10
    ) {
      setError(
        "Rooms की संख्या 1 से 10 के बीच होनी चाहिए।"
      );
      return;
    }

    try {
      setLoading(true);

      // ==================================================
      // API REQUEST
      // ==================================================

      const response =
        await fetch(
          "/api/hotel/search",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              city:
                city.trim(),

              checkIn,

              checkOut,

              guests:
                guestCount,

              rooms:
                roomCount,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "HOTEL SEARCH API RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Hotel search नहीं हो सकी।"
        );

        return;
      }

      setHotels(
        data.hotels || []
      );

      setSearched(true);

      if (
        !data.hotels ||
        data.hotels.length === 0
      ) {
        setError(
          "इस destination के लिए कोई hotel नहीं मिला।"
        );
      }
    } catch (error) {
      console.error(
        "HOTEL SEARCH ERROR:",
        error
      );

      setError(
        "Hotel search service से connection नहीं हो पाया।"
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // SELECT HOTEL
  // ==================================================

  function selectHotel(
    hotel: Hotel
  ) {
    const params =
      new URLSearchParams({
        hotelId:
          hotel.hotelId,

        hotelName:
          hotel.hotelName,

        city:
          hotel.city,

        location:
          hotel.location,

        rating:
          String(
            hotel.rating
          ),

        reviews:
          String(
            hotel.reviews
          ),

        roomType:
          hotel.roomType,

        pricePerNight:
          String(
            hotel.pricePerNight
          ),

        currency:
          hotel.currency,

        checkIn,

        checkOut,

        guests,

        rooms,
      });

    window.location.href =
      `/service2/hotel/booking?${params.toString()}`;
  }

  // ==================================================
  // TODAY
  // ==================================================

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ==================================================
          HEADER
          ================================================== */}

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

      {/* ==================================================
          MAIN
          ================================================== */}

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            🏨 Hotel Booking
          </h2>

          <p className="text-gray-600 mt-2">
            Hotel search करें और अपनी stay booking शुरू करें।
          </p>

        </div>

        {/* ==================================================
            SEARCH BOX
            ================================================== */}

        <div className="bg-white rounded-xl shadow p-6">

          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Search Hotels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

            {/* CITY */}

            <div>

              <label
                htmlFor="hotel-city"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Destination
              </label>

              <input
                id="hotel-city"
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(
                    event.target.value
                  )
                }
                placeholder="City / Hotel / Area"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* CHECK IN */}

            <div>

              <label
                htmlFor="check-in"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Check-in
              </label>

              <input
                id="check-in"
                type="date"
                value={checkIn}
                min={today}
                onChange={(event) =>
                  setCheckIn(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* CHECK OUT */}

            <div>

              <label
                htmlFor="check-out"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Check-out
              </label>

              <input
                id="check-out"
                type="date"
                value={checkOut}
                min={
                  checkIn ||
                  today
                }
                onChange={(event) =>
                  setCheckOut(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* GUESTS */}

            <div>

              <label
                htmlFor="guests"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Guests
              </label>

              <select
                id="guests"
                value={guests}
                onChange={(event) =>
                  setGuests(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                {Array.from(
                  {
                    length: 20,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (count) => (
                    <option
                      key={count}
                      value={count}
                    >
                      {count}{" "}
                      {count === 1
                        ? "Guest"
                        : "Guests"}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* ROOMS */}

            <div>

              <label
                htmlFor="rooms"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Rooms
              </label>

              <select
                id="rooms"
                value={rooms}
                onChange={(event) =>
                  setRooms(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                {Array.from(
                  {
                    length: 10,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (count) => (
                    <option
                      key={count}
                      value={count}
                    >
                      {count}{" "}
                      {count === 1
                        ? "Room"
                        : "Rooms"}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* SEARCH */}

          <div className="mt-6">

            <button
              type="button"
              onClick={
                searchHotels
              }
              disabled={
                loading
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-7 py-3 rounded-lg font-semibold transition"
            >
              {loading
                ? "Searching Hotels..."
                : "🔍 Search Hotels"}
            </button>

          </div>

        </div>

        {/* ==================================================
            RESULTS
            ================================================== */}

        {searched && (
          <div className="mt-8">

            {/* RESULT HEADER */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

              <div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Available Hotels
                </h3>

                <p className="text-gray-600 mt-1">
                  {city} •{" "}
                  {checkIn} →{" "}
                  {checkOut}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {guests}{" "}
                  {Number(
                    guests
                  ) === 1
                    ? "Guest"
                    : "Guests"}{" "}
                  •{" "}
                  {rooms}{" "}
                  {Number(
                    rooms
                  ) === 1
                    ? "Room"
                    : "Rooms"}
                </p>

              </div>

              <span className="text-sm text-gray-500">
                {hotels.length}{" "}
                hotels found
              </span>

            </div>

            {/* NO RESULTS */}

            {hotels.length ===
              0 && (
              <div className="bg-white rounded-xl shadow p-10 text-center">

                <div className="text-5xl">
                  🏨
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-4">
                  No Hotels Found
                </h3>

                <p className="text-gray-500 mt-2">
                  इस destination के लिए अभी कोई hotel उपलब्ध नहीं है।
                </p>

              </div>
            )}

            {/* HOTEL CARDS */}

            {hotels.length >
              0 && (
              <div className="space-y-5">

                {hotels.map(
                  (hotel) => (
                    <div
                      key={
                        hotel.hotelId
                      }
                      className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                        {/* HOTEL INFO */}

                        <div className="flex-1">

                          <h4 className="text-xl font-bold text-gray-900">
                            {
                              hotel.hotelName
                            }
                          </h4>

                          <p className="text-gray-500 mt-1">
                            {
                              hotel.location
                            }
                            ,{" "}
                            {
                              hotel.city
                            }
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-3">

                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                              ⭐{" "}
                              {
                                hotel.rating
                              }
                            </span>

                            <span className="text-sm text-gray-500">
                              {
                                hotel.reviews
                              }{" "}
                              reviews
                            </span>

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                hotel.available
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {hotel.available
                                ? "Available"
                                : "Unavailable"}
                            </span>

                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

                            <div>

                              <p className="text-xs text-gray-500">
                                Room Type
                              </p>

                              <p className="font-bold text-gray-900 mt-1">
                                {
                                  hotel.roomType
                                }
                              </p>

                            </div>

                            <div>

                              <p className="text-xs text-gray-500">
                                Amenities
                              </p>

                              <p className="font-medium text-gray-700 mt-1">
                                {
                                  hotel.amenities
                                    .join(
                                      " • "
                                    )
                                }
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* PRICE */}

                        <div className="lg:text-right">

                          <p className="text-sm text-gray-500">
                            Starting from
                          </p>

                          <p className="text-3xl font-bold text-gray-900 mt-1">
                            ₹
                            {hotel.pricePerNight.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            per night
                          </p>

                          <button
                            type="button"
                            disabled={
                              !hotel.available
                            }
                            onClick={() =>
                              selectHotel(
                                hotel
                              )
                            }
                            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition"
                          >
                            Select Hotel →
                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

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
