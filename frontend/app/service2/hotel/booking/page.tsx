"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

type Room = {
  roomId: string;
  hotelId: string;
  roomType: string;
  mealPlan: string;
  maxGuests: number;
  availableRooms: number;
  requestedRooms: number;
  requestedGuests: number;
  pricePerNight: number;
  nights: number;
  roomFare: number;
  currency: string;
  refundable: boolean;
  amenities: string[];
};

function HotelBookingContent() {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  // ==================================================
  // HOTEL SEARCH DATA
  // ==================================================

  const hotelId =
    searchParams.get(
      "hotelId"
    ) || "";

  const hotelName =
    searchParams.get(
      "hotelName"
    ) || "";

  const city =
    searchParams.get(
      "city"
    ) || "";

  const location =
    searchParams.get(
      "location"
    ) || "";

  const initialRoomType =
    searchParams.get(
      "roomType"
    ) || "";

  const checkIn =
    searchParams.get(
      "checkIn"
    ) || "";

  const checkOut =
    searchParams.get(
      "checkOut"
    ) || "";

  const guests =
    Number(
      searchParams.get(
        "guests"
      ) || "1"
    );

  const roomsRequested =
    Number(
      searchParams.get(
        "rooms"
      ) || "1"
    );

  // ==================================================
  // STATE
  // ==================================================

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [selectedRoomId, setSelectedRoomId] =
    useState("");

  const [guestName, setGuestName] =
    useState("");

  const [guestAge, setGuestAge] =
    useState("");

  const [guestGender, setGuestGender] =
    useState("MALE");

  const [guestMobile, setGuestMobile] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // LOAD ROOM AVAILABILITY
  // ==================================================

  useEffect(() => {
    async function loadAvailability() {
      if (
        !hotelId ||
        !checkIn ||
        !checkOut
      ) {
        setError(
          "Hotel booking details उपलब्ध नहीं हैं।"
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/hotel/availability",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                hotelId,
                checkIn,
                checkOut,
                guests,
                rooms:
                  roomsRequested,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "HOTEL AVAILABILITY RESPONSE:",
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {
          setError(
            data.message ||
              "Room availability load नहीं हो सकी।"
          );

          return;
        }

        const availableRooms =
          Array.isArray(
            data.rooms
          )
            ? data.rooms
            : [];

        setRooms(
          availableRooms
        );

        // Initial room selection
        const matchingRoom =
          availableRooms.find(
            (room: Room) =>
              room.roomType ===
              initialRoomType
          );

        if (matchingRoom) {
          setSelectedRoomId(
            matchingRoom.roomId
          );
        } else if (
          availableRooms.length >
          0
        ) {
          setSelectedRoomId(
            availableRooms[0]
              .roomId
          );
        }
      } catch (error) {
        console.error(
          "HOTEL AVAILABILITY ERROR:",
          error
        );

        setError(
          "Room availability service से connection नहीं हो पाया।"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, [
    hotelId,
    checkIn,
    checkOut,
    guests,
    roomsRequested,
    initialRoomType,
  ]);

  // ==================================================
  // SELECTED ROOM
  // ==================================================

  const selectedRoom =
    useMemo(() => {
      return (
        rooms.find(
          (room) =>
            room.roomId ===
            selectedRoomId
        ) || null
      );
    }, [
      rooms,
      selectedRoomId,
    ]);

  // ==================================================
  // FARE
  // ==================================================

  const convenienceFee =
    selectedRoom
      ? 50
      : 0;

  const roomFare =
    selectedRoom?.roomFare ||
    0;

  const totalAmount =
    roomFare +
    convenienceFee;

  // ==================================================
  // VALIDATION
  // ==================================================

  function validateGuestDetails() {
    if (!selectedRoom) {
      setError(
        "कृपया कोई room select करें।"
      );
      return false;
    }

    if (
      !guestName.trim()
    ) {
      setError(
        "Guest name डालना जरूरी है।"
      );
      return false;
    }

    const age =
      Number(guestAge);

    if (
      !Number.isFinite(age) ||
      age < 1 ||
      age > 120
    ) {
      setError(
        "Valid guest age डालें।"
      );
      return false;
    }

    if (!guestGender) {
      setError(
        "Guest gender select करें।"
      );
      return false;
    }

    if (
      !/^[0-9]{10}$/.test(
        guestMobile.trim()
      )
    ) {
      setError(
        "Valid 10-digit mobile number डालें।"
      );
      return false;
    }

    return true;
  }

  // ==================================================
  // CONTINUE TO PAYMENT
  // ==================================================

  function continueToPayment() {
    setError("");

    if (
      !validateGuestDetails()
    ) {
      return;
    }

    if (!selectedRoom) {
      return;
    }

    setSubmitting(true);

    const params =
      new URLSearchParams({
        hotelId,

        hotelName,

        city,

        location,

        roomType:
          selectedRoom.roomType,

        checkIn,

        checkOut,

        guests:
          String(guests),

        rooms:
          String(roomsRequested),

        nights:
          String(
            selectedRoom.nights
          ),

        pricePerNight:
          String(
            selectedRoom.pricePerNight
          ),

        roomFare:
          String(
            roomFare
          ),

        convenienceFee:
          String(
            convenienceFee
          ),

        totalAmount:
          String(
            totalAmount
          ),

        guestName:
          guestName.trim(),

        guestAge:
          String(
            Number(guestAge)
          ),

        guestGender,

        guestMobile:
          guestMobile.trim(),

        roomId:
          selectedRoom.roomId,

        mealPlan:
          selectedRoom.mealPlan,

        refundable:
          String(
            selectedRoom.refundable
          ),
      });

    router.push(
      `/service2/hotel/payment?${params.toString()}`
    );
  }

  // ==================================================
  // FORMAT DATE
  // ==================================================

  function formatDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
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
  // INVALID DETAILS
  // ==================================================

  if (
    !hotelId ||
    !hotelName ||
    !checkIn ||
    !checkOut
  ) {
    return (
      <main className="min-h-screen bg-gray-100">

        <header className="bg-white shadow-sm px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">

            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <Link
              href="/service2/hotel"
              className="text-gray-600 hover:text-blue-600"
            >
              Hotel Search
            </Link>

          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="bg-white rounded-xl shadow p-10 text-center">

            <div className="text-5xl">
              ❌
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              Hotel Details नहीं मिलीं
            </h2>

            <p className="text-gray-600 mt-2">
              कृपया पहले Hotel Search करके hotel select करें।
            </p>

            <Link
              href="/service2/hotel"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              ← Hotel Search पर जाएँ
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

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
              href="/service2/hotel"
              className="text-gray-600 hover:text-blue-600"
            >
              Hotel Search
            </Link>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            🏨 Hotel Booking
          </h2>

          <p className="text-gray-600 mt-2">
            Room select करें और guest details भरें।
          </p>

        </div>

        {/* HOTEL SUMMARY */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <h3 className="text-2xl font-bold text-gray-900">
                {hotelName}
              </h3>

              <p className="text-gray-500 mt-1">
                {location},{" "}
                {city}
              </p>

              <p className="text-sm text-gray-600 mt-4">
                {formatDate(
                  checkIn
                )}{" "}
                →{" "}
                {formatDate(
                  checkOut
                )}
              </p>

            </div>

            <div className="lg:text-right">

              <p className="text-sm text-gray-500">
                Guests
              </p>

              <p className="font-bold text-gray-900">
                {guests}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Rooms
              </p>

              <p className="font-bold text-gray-900">
                {roomsRequested}
              </p>

            </div>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-4">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="bg-white rounded-xl shadow p-10 text-center">

            <div className="text-4xl">
              ⏳
            </div>

            <p className="text-gray-600 mt-4">
              Room availability load हो रही है...
            </p>

          </div>
        )}

        {/* ROOM OPTIONS */}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}

            <div className="lg:col-span-2">

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between gap-4">

                  <h3 className="text-xl font-bold text-gray-900">
                    Available Rooms
                  </h3>

                  <span className="text-sm text-gray-500">
                    {rooms.length}{" "}
                    options
                  </span>

                </div>

                {rooms.length ===
                  0 && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-8 text-center">

                    <div className="text-4xl">
                      🛏️
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 mt-3">
                      No Room Available
                    </h4>

                    <p className="text-gray-500 mt-1">
                      इस guest/room combination के लिए अभी room available नहीं है।
                    </p>

                  </div>
                )}

                <div className="mt-6 space-y-5">

                  {rooms.map(
                    (room) => {
                      const selected =
                        room.roomId ===
                        selectedRoomId;

                      return (
                        <button
                          key={
                            room.roomId
                          }
                          type="button"
                          onClick={() =>
                            setSelectedRoomId(
                              room.roomId
                            )
                          }
                          className={`w-full text-left border rounded-xl p-5 transition ${
                            selected
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >

                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                            {/* INFO */}

                            <div className="flex-1">

                              <div className="flex items-center gap-3 flex-wrap">

                                <h4 className="text-lg font-bold text-gray-900">
                                  {
                                    room.roomType
                                  }
                                </h4>

                                {selected && (
                                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Selected
                                  </span>
                                )}

                              </div>

                              <p className="text-gray-600 mt-2">
                                🍽️{" "}
                                {
                                  room.mealPlan
                                }
                              </p>

                              <div className="flex flex-wrap gap-2 mt-4">

                                {room.amenities.map(
                                  (
                                    amenity
                                  ) => (
                                    <span
                                      key={
                                        amenity
                                      }
                                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                                    >
                                      {
                                        amenity
                                      }
                                    </span>
                                  )
                                )}

                              </div>

                              <div className="flex flex-wrap gap-5 mt-5 text-sm">

                                <span className="text-gray-600">
                                  👥 Max{" "}
                                  {
                                    room.maxGuests
                                  }{" "}
                                  guests
                                </span>

                                <span className="text-gray-600">
                                  🛏️{" "}
                                  {
                                    room.availableRooms
                                  }{" "}
                                  rooms left
                                </span>

                                <span
                                  className={
                                    room.refundable
                                      ? "text-green-600 font-semibold"
                                      : "text-red-600 font-semibold"
                                  }
                                >
                                  {room.refundable
                                    ? "✓ Refundable"
                                    : "✕ Non-refundable"}
                                </span>

                              </div>

                            </div>

                            {/* PRICE */}

                            <div className="md:text-right">

                              <p className="text-sm text-gray-500">
                                Per night
                              </p>

                              <p className="text-2xl font-bold text-gray-900">
                                ₹
                                {room.pricePerNight.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                {room.nights}{" "}
                                {room.nights ===
                                1
                                  ? "night"
                                  : "nights"}{" "}
                                ×{" "}
                                {
                                  room.requestedRooms
                                }{" "}
                                room
                                {room.requestedRooms ===
                                1
                                  ? ""
                                  : "s"}
                              </p>

                              <p className="text-lg font-bold text-blue-600 mt-3">
                                ₹
                                {room.roomFare.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              <p className="text-xs text-gray-500">
                                Room fare
                              </p>

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              {/* GUEST DETAILS */}

              {selectedRoom && (
                <div className="bg-white rounded-xl shadow p-6 mt-6">

                  <h3 className="text-xl font-bold text-gray-900">
                    👤 Guest Details
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    Primary guest की जानकारी भरें।
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                    {/* NAME */}

                    <div>

                      <label
                        htmlFor="guest-name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Guest Name
                      </label>

                      <input
                        id="guest-name"
                        type="text"
                        value={
                          guestName
                        }
                        onChange={(
                          event
                        ) =>
                          setGuestName(
                            event.target
                              .value
                          )
                        }
                        placeholder="Enter guest name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />

                    </div>

                    {/* AGE */}

                    <div>

                      <label
                        htmlFor="guest-age"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Age
                      </label>

                      <input
                        id="guest-age"
                        type="number"
                        min="1"
                        max="120"
                        value={
                          guestAge
                        }
                        onChange={(
                          event
                        ) =>
                          setGuestAge(
                            event.target
                              .value
                          )
                        }
                        placeholder="Age"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />

                    </div>

                    {/* GENDER */}

                    <div>

                      <label
                        htmlFor="guest-gender"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Gender
                      </label>

                      <select
                        id="guest-gender"
                        value={
                          guestGender
                        }
                        onChange={(
                          event
                        ) =>
                          setGuestGender(
                            event.target
                              .value
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      >

                        <option value="MALE">
                          Male
                        </option>

                        <option value="FEMALE">
                          Female
                        </option>

                        <option value="OTHER">
                          Other
                        </option>

                      </select>

                    </div>

                    {/* MOBILE */}

                    <div>

                      <label
                        htmlFor="guest-mobile"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Mobile Number
                      </label>

                      <input
                        id="guest-mobile"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={
                          guestMobile
                        }
                        onChange={(
                          event
                        ) =>
                          setGuestMobile(
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="10-digit mobile"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />

                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* RIGHT SUMMARY */}

            <div>

              <div className="bg-white rounded-xl shadow p-6 lg:sticky lg:top-6">

                <h3 className="text-xl font-bold text-gray-900">
                  💳 Fare Summary
                </h3>

                {selectedRoom ? (
                  <>

                    <div className="mt-6 space-y-4">

                      <div className="flex justify-between gap-4">

                        <span className="text-gray-600">
                          Room
                        </span>

                        <span className="font-semibold text-right">
                          {
                            selectedRoom.roomType
                          }
                        </span>

                      </div>

                      <div className="flex justify-between gap-4">

                        <span className="text-gray-600">
                          Meal Plan
                        </span>

                        <span className="font-semibold text-right">
                          {
                            selectedRoom.mealPlan
                          }
                        </span>

                      </div>

                      <div className="flex justify-between gap-4">

                        <span className="text-gray-600">
                          Price / Night
                        </span>

                        <span className="font-semibold">
                          ₹
                          {selectedRoom.pricePerNight.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4">

                        <span className="text-gray-600">
                          Nights
                        </span>

                        <span className="font-semibold">
                          {
                            selectedRoom.nights
                          }
                        </span>

                      </div>

                      <div className="flex justify-between gap-4">

                        <span className="text-gray-600">
                          Rooms
                        </span>

                        <span className="font-semibold">
                          {
                            roomsRequested
                          }
                        </span>

                      </div>

                      <div className="border-t pt-4 flex justify-between gap-4">

                        <span className="text-gray-600">
                          Room Fare
                        </span>

                        <span className="font-semibold">
                          ₹
                          {roomFare.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4">

                        <span className="text-gray-600">
                          Convenience Fee
                        </span>

                        <span className="font-semibold">
                          ₹
                          {convenienceFee.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <div className="border-t pt-4 flex justify-between gap-4">

                        <span className="text-xl font-bold text-gray-900">
                          Total
                        </span>

                        <span className="text-2xl font-bold text-blue-600">
                          ₹
                          {totalAmount.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                    </div>

                    {/* CONTINUE */}

                    <button
                      type="button"
                      onClick={
                        continueToPayment
                      }
                      disabled={
                        submitting
                      }
                      className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold"
                    >
                      {submitting
                        ? "Please wait..."
                        : "Continue to Payment →"}
                    </button>

                  </>
                ) : (
                  <div className="mt-6 bg-gray-50 rounded-lg p-5 text-center">

                    <div className="text-3xl">
                      🛏️
                    </div>

                    <p className="text-gray-600 mt-2">
                      पहले कोई room select करें।
                    </p>

                  </div>
                )}

                <Link
                  href="/service2/hotel"
                  className="block w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold text-center"
                >
                  ← Change Hotel
                </Link>

              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

// ======================================================
// PAGE WRAPPER
// ======================================================

export default function HotelBookingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">

          <div className="text-gray-600">
            Hotel booking load हो रही है...
          </div>

        </main>
      }
    >
      <HotelBookingContent />
    </Suspense>
  );
}