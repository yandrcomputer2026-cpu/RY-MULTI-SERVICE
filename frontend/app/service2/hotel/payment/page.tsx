"use client";

import {
  Suspense,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
      message: `Server ने empty response दिया। HTTP ${response.status}`,
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
// HOTEL PAYMENT CONTENT
// ======================================================

function HotelPaymentContent() {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  // ==================================================
  // BOOKING DATA
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

  const roomId =
    searchParams.get(
      "roomId"
    ) || "";

  const roomType =
    searchParams.get(
      "roomType"
    ) || "";

  const mealPlan =
    searchParams.get(
      "mealPlan"
    ) || "";

  const refundable =
    searchParams.get(
      "refundable"
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
    searchParams.get(
      "guests"
    ) || "1";

  const rooms =
    searchParams.get(
      "rooms"
    ) || "1";

  const nights =
    searchParams.get(
      "nights"
    ) || "0";

  const pricePerNight =
    searchParams.get(
      "pricePerNight"
    ) || "0";

  // --------------------------------------------------
  // These are only for initial display.
  // Final amount will come from server.
  // --------------------------------------------------

  const requestedRoomFare =
    searchParams.get(
      "roomFare"
    ) || "0";

  const requestedConvenienceFee =
    searchParams.get(
      "convenienceFee"
    ) || "0";

  const requestedTotalAmount =
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

  const [loading, setLoading] =
    useState(false);

  const [paid, setPaid] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [transactionId, setTransactionId] =
    useState("");

  const [verifiedAmount, setVerifiedAmount] =
    useState("");

  const paymentVerifiedRef =
    useRef(false);

  const transactionCreatedRef =
    useRef(false);

  // ==================================================
  // LOAD RAZORPAY
  // ==================================================

  async function loadRazorpayScript(): Promise<boolean> {
    if (
      typeof window ===
      "undefined"
    ) {
      return false;
    }

    if (window.Razorpay) {
      return true;
    }

    return new Promise(
      (resolve) => {
        const existingScript =
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          );

        if (existingScript) {
          existingScript.addEventListener(
            "load",
            () =>
              resolve(
                !!window.Razorpay
              )
          );

          existingScript.addEventListener(
            "error",
            () =>
              resolve(false)
          );

          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload = () =>
          resolve(
            !!window.Razorpay
          );

        script.onerror = () =>
          resolve(false);

        document.body.appendChild(
          script
        );
      }
    );
  }

  // ==================================================
  // DATE FORMAT
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
  // HANDLE PAYMENT
  // ==================================================

  async function handlePayment() {
    // ==================================================
    // BASIC CLIENT CHECK
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
      setError(
        "Hotel booking details पूरी नहीं हैं।"
      );
      return;
    }

    if (
      loading ||
      paid
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ==================================================
      // STEP 1
      // LOAD RAZORPAY
      // ==================================================

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        setError(
          "Razorpay Checkout load नहीं हो पाया।"
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // STEP 2
      // CREATE SERVER-SIDE HOTEL TRANSACTION
      // ==================================================

      let currentTransactionId =
        transactionId;

      let currentAmount =
        verifiedAmount;

      if (
        !currentTransactionId
      ) {
        if (
          transactionCreatedRef.current
        ) {
          setError(
            "Booking transaction create होने में समस्या हुई। कृपया दोबारा प्रयास करें।"
          );

          setLoading(false);
          return;
        }

        transactionCreatedRef.current =
          true;

        console.log(
          "CREATING SERVER VERIFIED HOTEL BOOKING"
        );

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
                  Number(
                    guests
                  ),

                rooms:
                  Number(
                    rooms
                  ),

                guestName,

                guestAge:
                  Number(
                    guestAge
                  ),

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
          "HOTEL SERVER BOOKING RESPONSE:",
          bookingData
        );

        if (
          !bookingResponse.ok ||
          !bookingData.success
        ) {
          transactionCreatedRef.current =
            false;

          setError(
            bookingData.message ||
              "Hotel booking transaction create नहीं हो सकी।"
          );

          setLoading(false);
          return;
        }

        currentTransactionId =
          bookingData.transaction
            ?.transactionId || "";

        currentAmount =
          bookingData.transaction
            ?.amount || "";

        if (
          !currentTransactionId
        ) {
          transactionCreatedRef.current =
            false;

          setError(
            "Hotel transaction ID नहीं मिली।"
          );

          setLoading(false);
          return;
        }

        if (!currentAmount) {
          transactionCreatedRef.current =
            false;

          setError(
            "Server verified booking amount नहीं मिला।"
          );

          setLoading(false);
          return;
        }

        setTransactionId(
          currentTransactionId
        );

        setVerifiedAmount(
          String(
            currentAmount
          )
        );
      } else {
        console.log(
          "USING EXISTING HOTEL TRANSACTION:",
          currentTransactionId
        );
      }

      // ==================================================
      // STEP 3
      // CREATE RAZORPAY ORDER
      // ==================================================

      console.log(
        "CREATING HOTEL RAZORPAY ORDER:",
        currentTransactionId
      );

      const orderResponse =
        await fetch(
          "/api/payment/order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              transactionId:
                currentTransactionId,
            }),
          }
        );

      const orderData =
        await readJsonResponse(
          orderResponse
        );

      console.log(
        "HOTEL ORDER RESPONSE:",
        orderData
      );

      if (
        !orderResponse.ok ||
        !orderData.success
      ) {
        setError(
          orderData.message ||
            "Razorpay order create नहीं हो पाया।"
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // STEP 4
      // VALIDATE RAZORPAY ORDER
      // ==================================================

      if (
        !orderData.keyId ||
        !orderData.order?.id ||
        !orderData.order?.amount
      ) {
        setError(
          "Razorpay order की जानकारी सही नहीं मिली।"
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // STEP 5
      // RAZORPAY OPTIONS
      // ==================================================

      const options = {
        key:
          orderData.keyId,

        amount:
          orderData.order.amount,

        currency:
          orderData.order.currency ||
          "INR",

        name:
          "RY MULTI SERVICE",

        description:
          `Hotel Booking - ${hotelName}`,

        order_id:
          orderData.order.id,

        notes: {
          transactionId:
            currentTransactionId,

          service:
            "HOTEL_BOOKING",

          hotelId,

          roomId,
        },

        theme: {
          color:
            "#2563eb",
        },

        // ==================================================
        // PAYMENT SUCCESS
        // ==================================================

        handler:
          async function (
            response: any
          ) {
            if (
              paymentVerifiedRef.current
            ) {
              return;
            }

            try {
              setError("");

              setMessage(
                "Payment received. Verification चल रही है..."
              );

              console.log(
                "HOTEL RAZORPAY RESPONSE:",
                response
              );

              // ==========================================
              // STEP 6
              // VERIFY PAYMENT
              // ==========================================

              const verifyResponse =
                await fetch(
                  "/api/payment/verify",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body: JSON.stringify({
                      transactionId:
                        currentTransactionId,

                      razorpay_payment_id:
                        response?.razorpay_payment_id,

                      razorpay_order_id:
                        response?.razorpay_order_id,

                      razorpay_signature:
                        response?.razorpay_signature,
                    }),
                  }
                );

              const verifyData =
                await readJsonResponse(
                  verifyResponse
                );

              console.log(
                "HOTEL VERIFY RESPONSE:",
                verifyData
              );

              if (
                !verifyResponse.ok ||
                !verifyData.success
              ) {
                setError(
                  verifyData.message ||
                    "Payment verification failed."
                );

                setMessage("");
                setLoading(false);

                return;
              }

              // ==========================================
              // PAYMENT VERIFIED
              // ==========================================

              paymentVerifiedRef.current =
                true;

              setPaid(true);
              setLoading(false);
              setError("");

              setTransactionId(
                currentTransactionId
              );

              setVerifiedAmount(
                String(
                  verifyData.transaction
                    ?.amount ||
                    currentAmount
                )
              );

              setMessage(
                "Hotel booking payment सफलतापूर्वक verify हो गया है।"
              );

              console.log(
                "HOTEL PAYMENT SUCCESS:",
                currentTransactionId
              );

              // ==========================================
              // AUTO REDIRECT
              // ==========================================

              setTimeout(() => {
                router.push(
                  `/service2/hotel/confirmation/${encodeURIComponent(
                    currentTransactionId
                  )}`
                );
              }, 1200);
            } catch (error) {
              console.error(
                "HOTEL PAYMENT VERIFY ERROR:",
                error
              );

              setError(
                "Payment verification में समस्या हुई।"
              );

              setLoading(false);
            }
          },

        // ==================================================
        // MODAL DISMISS
        // ==================================================

        modal: {
          ondismiss:
            function () {
              if (
                paymentVerifiedRef.current
              ) {
                return;
              }

              setLoading(false);

              setMessage("");

              setError(
                "Payment cancel कर दिया गया।"
              );
            },
        },
      };

      // ==================================================
      // OPEN RAZORPAY
      // ==================================================

      const razorpay =
        new window.Razorpay(
          options
        );

      // ==================================================
      // PAYMENT FAILED
      // ==================================================

      razorpay.on(
        "payment.failed",
        function (
          response: any
        ) {
          if (
            paymentVerifiedRef.current
          ) {
            return;
          }

          console.error(
            "HOTEL RAZORPAY PAYMENT FAILED:",
            response
          );

          setLoading(false);

          setError(
            response?.error
              ?.description ||
              "Payment failed. कृपया दोबारा प्रयास करें।"
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "HOTEL PAYMENT ERROR:",
        error
      );

      transactionCreatedRef.current =
        false;

      setError(
        "Hotel payment process शुरू नहीं हो पाया।"
      );

      setLoading(false);
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
            Invalid Hotel Payment
          </h1>

          <p className="text-gray-600 mt-3">
            Hotel payment details उपलब्ध नहीं हैं।
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
  // DISPLAY AMOUNT
  // ==================================================

  const displayAmount =
    verifiedAmount ||
    requestedTotalAmount;

  const displayRoomFare =
    verifiedAmount
      ? Math.max(
          Number(
            verifiedAmount
          ) -
            Number(
              requestedConvenienceFee
            ),
          0
        )
      : Number(
          requestedRoomFare
        );

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
            Hotel Booking
          </Link>

        </div>

      </header>

      {/* MAIN */}

      <div className="max-w-xl mx-auto px-6 py-12">

        <div className="bg-white rounded-xl shadow p-8">

          {/* TITLE */}

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            🏨 Hotel Booking Payment
          </h2>

          <p className="text-gray-500 text-center mt-2">
            अपनी hotel booking का payment पूरा करें
          </p>

          {/* HOTEL DETAILS */}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5">

            <h3 className="text-xl font-bold text-gray-900">
              {hotelName}
            </h3>

            <p className="text-gray-600 mt-1">
              {location},{" "}
              {city}
            </p>

            <div className="mt-4 space-y-2">

              <p className="text-gray-700">
                <span className="font-semibold">
                  Room:
                </span>{" "}
                {roomType}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">
                  Meal Plan:
                </span>{" "}
                {mealPlan ||
                  "-"}
              </p>

              <p className="text-gray-700">
                <span className="font-semibold">
                  Booking Type:
                </span>{" "}
                {refundable ===
                "true"
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
                  {formatDate(
                    checkIn
                  )}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-gray-600">
                  Check-out
                </span>

                <span className="font-semibold text-gray-900">
                  {formatDate(
                    checkOut
                  )}
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
                  {guestName ||
                    "-"}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-gray-500">
                  Age
                </span>

                <span className="font-semibold text-gray-900">
                  {guestAge ||
                    "-"}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-gray-500">
                  Gender
                </span>

                <span className="font-semibold text-gray-900">
                  {guestGender ||
                    "-"}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-gray-500">
                  Mobile
                </span>

                <span className="font-semibold text-gray-900">
                  {guestMobile ||
                    "-"}
                </span>

              </div>

            </div>

          </div>

          {/* FARE */}

          <div className="mt-6 border-t pt-6">

            <h3 className="text-xl font-bold text-gray-900">
              💳 Fare Summary
            </h3>

            <div className="mt-5 space-y-4">

              <div className="flex justify-between gap-4">

                <span className="text-gray-600">
                  Room Fare
                </span>

                <span className="font-semibold">
                  ₹
                  {displayRoomFare.toLocaleString(
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
                  {Number(
                    requestedConvenienceFee
                  ).toLocaleString(
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
                  {Number(
                    displayAmount
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

            </div>

          </div>

          {/* TRANSACTION ID */}

          {transactionId && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">

              <p className="text-sm text-green-700">
                Booking Transaction ID
              </p>

              <p className="font-bold text-green-800 mt-1 break-all">
                {
                  transactionId
                }
              </p>

            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">

              <p className="font-semibold">
                Payment Error
              </p>

              <p className="mt-1">
                {error}
              </p>

            </div>
          )}

          {/* SUCCESS */}

          {paid && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-5">

              <div className="text-4xl text-center">
                ✅
              </div>

              <h3 className="text-xl font-bold text-center mt-3">
                Hotel Payment Successful
              </h3>

              <p className="text-center mt-2">
                आपका hotel booking payment सफलतापूर्वक verify हो गया है।
              </p>

              {transactionId && (
                <p className="text-center text-sm mt-3 break-all">
                  Transaction ID:{" "}
                  {
                    transactionId
                  }
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  if (
                    transactionId
                  ) {
                    router.push(
                      `/service2/hotel/confirmation/${encodeURIComponent(
                        transactionId
                      )}`
                    );
                  }
                }}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
              >
                Hotel Booking Details देखें →
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/history"
                  )
                }
                className="w-full mt-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg"
              >
                Transaction History देखें
              </button>

            </div>
          )}

          {/* STATUS MESSAGE */}

          {!paid &&
            message && (
              <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4">
                {message}
              </div>
            )}

          {/* PAY BUTTON */}

          {!paid && (
            <button
              type="button"
              onClick={
                handlePayment
              }
              disabled={
                loading
              }
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg"
            >
              {loading
                ? "Payment Processing..."
                : `Pay ₹${Number(
                    displayAmount
                  ).toLocaleString(
                    "en-IN"
                  )} →`}
            </button>
          )}

          {/* CANCEL */}

          {!paid && (
            <Link
              href="/service2/hotel"
              className="block w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg text-center"
            >
              Cancel
            </Link>
          )}

          {/* SECURE PAYMENT */}

          {!paid && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Secure payment powered by Razorpay
            </p>
          )}

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
            Hotel payment details load हो रही हैं...
          </div>

        </main>
      }
    >
      <HotelPaymentContent />
    </Suspense>
  );
}
