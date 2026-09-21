"use client";

import {
  Suspense,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

// ======================================================
// TYPES
// ======================================================

type ProviderHealth = {
  configured?: boolean;
  available?: boolean;
  status?: string;
  message?: string;
};

type TravelStatusResponse = {
  success?: boolean;
  message?: string;

  services?: {
    hotel?: ProviderHealth;
  };
};

// ======================================================
// SAFE JSON RESPONSE
// ======================================================

async function readJsonResponse(
  response: Response
) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  const text =
    await response.text();

  if (!text) {
    return {
      success: false,
      message:
        `Server ने empty response दिया। HTTP ${response.status}`,
    };
  }

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    console.error(
      "NON JSON RESPONSE:",
      response.status,
      text.substring(0, 500)
    );

    return {
      success: false,
      message:
        response.status === 404
          ? "Requested API endpoint नहीं मिला।"
          : `Server ने invalid response दिया। HTTP ${response.status}`,
    };
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "JSON PARSE ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Server से invalid JSON response मिला।",
    };
  }
}

// ======================================================
// HOTEL PAYMENT / PROVIDER CHECK CONTENT
// ======================================================

function HotelPaymentContent() {
  const searchParams =
    useSearchParams();

  // ==================================================
  // BOOKING DATA
  // ==================================================

  const hotelId =
    searchParams.get("hotelId") || "";

  const hotelName =
    searchParams.get("hotelName") || "";

  const city =
    searchParams.get("city") || "";

  const location =
    searchParams.get("location") || "";

  const roomId =
    searchParams.get("roomId") || "";

  const roomType =
    searchParams.get("roomType") || "";

  const mealPlan =
    searchParams.get("mealPlan") || "";

  const refundable =
    searchParams.get("refundable") || "";

  const checkIn =
    searchParams.get("checkIn") || "";

  const checkOut =
    searchParams.get("checkOut") || "";

  const guests =
    searchParams.get("guests") || "1";

  const rooms =
    searchParams.get("rooms") || "1";

  const nights =
    searchParams.get("nights") || "0";

  const pricePerNight =
    searchParams.get(
      "pricePerNight"
    ) || "0";

  const roomFare =
    searchParams.get(
      "roomFare"
    ) || "0";

  const convenienceFee =
    searchParams.get(
      "convenienceFee"
    ) || "0";

  const totalAmount =
    searchParams.get(
      "totalAmount"
    ) || "0";

  const guestName =
    searchParams.get(
      "guestName"
    ) || "";

  const guestAge =
    searchParams.get(
      "guestAge"
    ) || "";

  const guestGender =
    searchParams.get(
      "guestGender"
    ) || "";

  const guestMobile =
    searchParams.get(
      "guestMobile"
    ) || "";

  // ==================================================
  // STATE
  // ==================================================

  const [checking, setChecking] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // ==================================================
  // DATE FORMAT
  // ==================================================

  function formatDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    const date = new Date(
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
  // CHECK HOTEL PROVIDER
  // ==================================================

  async function checkProvider() {
    if (
      !hotelId ||
      !hotelName ||
      !roomId ||
      !checkIn ||
      !checkOut ||
      !guestName ||
      !guestMobile
    ) {
      setError(
        "Hotel booking details पूरी नहीं हैं।"
      );
      return;
    }

    if (checking) {
      return;
    }

    setChecking(true);
    setError("");
    setMessage("");

    try {
      // ================================================
      // STEP 1
      // COMMON TRAVEL PROVIDER STATUS
      // ================================================

      const statusResponse =
        await fetch(
          "/api/internal/travel/status",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const statusData =
        (await readJsonResponse(
          statusResponse
        )) as TravelStatusResponse;

      console.log(
        "HOTEL PROVIDER STATUS:",
        statusData
      );

      if (
        !statusResponse.ok ||
        !statusData.success
      ) {
        setError(
          statusData.message ||
            "Hotel provider status check नहीं हो सका।"
        );

        return;
      }

      const hotelStatus =
        statusData.services?.hotel;

      const providerReady =
        hotelStatus?.configured === true &&
        hotelStatus?.available === true &&
        hotelStatus?.status === "ACTIVE";

      // ================================================
      // STEP 2
      // PROVIDER NOT ACTIVE
      // ================================================

      if (!providerReady) {
        setError(
          "Hotel booking provider अभी active नहीं है। इसलिए transaction और payment शुरू नहीं किया गया है।"
        );

        return;
      }

      // ================================================
      // STEP 3
      // SERVER-SIDE BOOKING GUARD
      //
      // Provider ACTIVE होने पर भी backend final
      // authority रहेगा. अभी backend live workflow
      // implement न होने के कारण payment block करेगा.
      // ================================================

      const bookingResponse =
        await fetch(
          "/api/hotel/booking/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              hotelId,
              hotelName,
              city,
              location,

              roomId,
              roomType,
              mealPlan,
              refundable,

              checkIn,
              checkOut,

              guests:
                Number(guests),

              rooms:
                Number(rooms),

              guestName,

              guestAge:
                Number(guestAge),

              guestGender,

              guestMobile,
            }),
          }
        );

      const bookingData =
        await readJsonResponse(
          bookingResponse
        );

      console.log(
        "HOTEL BOOKING GUARD RESPONSE:",
        bookingData
      );

      // ================================================
      // CURRENT EXPECTED RESULT:
      // HOTEL_WORKFLOW_NOT_IMPLEMENTED
      // ================================================

      if (
        !bookingResponse.ok ||
        !bookingData.success
      ) {
        setError(
          bookingData.message ||
            "Hotel booking अभी शुरू नहीं की जा सकती।"
        );

        return;
      }

      // ================================================
      // SAFETY STOP
      //
      // Even if backend response changes unexpectedly,
      // this page intentionally contains NO Razorpay
      // code and cannot start payment.
      // ================================================

      setMessage(
        "Hotel provider check सफल रहा, लेकिन live booking/payment workflow अभी उपलब्ध नहीं है।"
      );
    } catch (error) {
      console.error(
        "HOTEL PROVIDER CHECK ERROR:",
        error
      );

      setError(
        "Hotel provider status check में समस्या हुई।"
      );
    } finally {
      setChecking(false);
    }
  }

  // ==================================================
  // INVALID BOOKING
  // ==================================================

  if (
    !hotelId ||
    !hotelName ||
    !roomId ||
    !checkIn ||
    !checkOut ||
    !guestName ||
    !guestMobile
  ) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="text-5xl">
            ❌
          </div>

          <h1 className="text-2xl font-bold text-red-600 mt-4">
            Invalid Hotel Review
          </h1>

          <p className="text-gray-600 mt-3">
            Hotel demo booking details उपलब्ध
            नहीं हैं।
          </p>

          <Link
            href="/service2/hotel"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            Hotel Search पर वापस जाएँ
          </Link>
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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

      {/* MAIN */}

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow p-8">
          {/* TITLE */}

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            🏨 Hotel Booking Review
          </h2>

          <p className="text-gray-500 text-center mt-2">
            Demo booking details review करें और
            Hotel provider status check करें।
          </p>

          {/* DEMO WARNING */}

          <div className="mt-6 bg-amber-50 border border-amber-300 rounded-lg p-5">
            <h3 className="font-bold text-amber-800">
              ⚠️ Demo / Setup Mode
            </h3>

            <p className="text-amber-800 mt-2 text-sm leading-6">
              Hotel, room availability, refundable
              status और fares अभी demo data हैं।
              इस page पर कोई payment नहीं लिया
              जाएगा। Authorized Hotel provider और
              live booking workflow उपलब्ध होने तक
              Razorpay शुरू नहीं होगा।
            </p>
          </div>

          {/* HOTEL DETAILS */}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">
                {hotelName}
              </h3>

              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                DEMO
              </span>
            </div>

            <p className="text-gray-600 mt-1">
              {location}, {city}
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">
                  Demo Room:
                </span>{" "}
                {roomType}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">
                  Demo Meal Plan:
                </span>{" "}
                {mealPlan || "-"}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">
                  Demo Booking Type:
                </span>{" "}
                {refundable === "true"
                  ? "Refundable"
                  : "Non-refundable"}
              </p>
            </div>

            <div className="border-t border-blue-200 mt-5 pt-5 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Check-in
                </span>

                <span className="font-semibold text-gray-900">
                  {formatDate(checkIn)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Check-out
                </span>

                <span className="font-semibold text-gray-900">
                  {formatDate(checkOut)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Guests
                </span>

                <span className="font-semibold text-gray-900">
                  {guests}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Rooms
                </span>

                <span className="font-semibold text-gray-900">
                  {rooms}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Nights
                </span>

                <span className="font-semibold text-gray-900">
                  {nights}
                </span>
              </div>
            </div>
          </div>

          {/* GUEST */}

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900">
              👤 Primary Guest
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Name
                </span>

                <span className="font-semibold text-gray-900">
                  {guestName || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Age
                </span>

                <span className="font-semibold text-gray-900">
                  {guestAge || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Gender
                </span>

                <span className="font-semibold text-gray-900">
                  {guestGender || "-"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Mobile
                </span>

                <span className="font-semibold text-gray-900">
                  {guestMobile || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* DEMO FARE */}

          <div className="mt-6 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900">
              💳 Demo Fare Summary
            </h3>

            <p className="text-xs text-amber-700 mt-2">
              ये amounts केवल demo display के लिए
              हैं। इन्हें live/final hotel fare न
              मानें।
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Demo Price / Night
                </span>

                <span className="font-semibold">
                  ₹
                  {Number(
                    pricePerNight
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Demo Room Fare
                </span>

                <span className="font-semibold">
                  ₹
                  {Number(
                    roomFare
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-600">
                  Demo Convenience Fee
                </span>

                <span className="font-semibold">
                  ₹
                  {Number(
                    convenienceFee
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between gap-4">
                <span className="text-xl font-bold text-gray-900">
                  Demo Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹
                  {Number(
                    totalAmount
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              <p className="font-semibold">
                Hotel Booking Status
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          )}

          {/* MESSAGE */}

          {message && (
            <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4">
              {message}
            </div>
          )}

          {/* PROVIDER CHECK */}

          <button
            type="button"
            onClick={checkProvider}
            disabled={checking}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg"
          >
            {checking
              ? "Checking Hotel Provider..."
              : "Check Provider & Continue"}
          </button>

          <p className="text-center text-gray-500 text-sm mt-3">
            Provider active और actual live booking
            workflow उपलब्ध हुए बिना transaction
            या payment शुरू नहीं होगा।
          </p>

          {/* BACK */}

          <Link
            href="/service2/hotel"
            className="block w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg text-center"
          >
            ← Back to Hotel Search
          </Link>
        </div>
      </div>
    </main>
  );
}

// ======================================================
// PAGE WRAPPER
// ======================================================

export default function HotelPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-gray-600">
            Hotel booking review load हो रही है...
          </div>
        </main>
      }
    >
      <HotelPaymentContent />
    </Suspense>
  );
}