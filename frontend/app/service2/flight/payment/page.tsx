"use client";

import Link from "next/link";

import {
  Suspense,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

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
// PAYMENT CONTENT
// ======================================================

function FlightPaymentContent() {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  // ====================================================
  // FLIGHT
  // ====================================================

  const flightId =
    searchParams.get(
      "flightId"
    ) || "";

  const airlineName =
    searchParams.get(
      "airlineName"
    ) || "";

  const airlineCode =
    searchParams.get(
      "airlineCode"
    ) || "";

  const flightNumber =
    searchParams.get(
      "flightNumber"
    ) || "";

  const from =
    searchParams.get(
      "from"
    ) || "";

  const fromName =
    searchParams.get(
      "fromName"
    ) || "";

  const to =
    searchParams.get(
      "to"
    ) || "";

  const toName =
    searchParams.get(
      "toName"
    ) || "";

  const departureTime =
    searchParams.get(
      "departureTime"
    ) || "";

  const arrivalTime =
    searchParams.get(
      "arrivalTime"
    ) || "";

  const duration =
    searchParams.get(
      "duration"
    ) || "";

  const stops =
    Number(
      searchParams.get(
        "stops"
      ) || "0"
    );

  const cabinClass =
    searchParams.get(
      "cabinClass"
    ) || "ECONOMY";

  const refundable =
    searchParams.get(
      "refundable"
    ) === "true";

  const journeyDate =
    searchParams.get(
      "journeyDate"
    ) || "";

  // ====================================================
  // PASSENGERS
  // ====================================================

  const adults =
    Number(
      searchParams.get(
        "adults"
      ) || "1"
    );

  const children =
    Number(
      searchParams.get(
        "children"
      ) || "0"
    );

  const infants =
    Number(
      searchParams.get(
        "infants"
      ) || "0"
    );

  const passengerName =
    searchParams.get(
      "passengerName"
    ) || "";

  const passengerAge =
    Number(
      searchParams.get(
        "passengerAge"
      ) || "0"
    );

  const passengerGender =
    searchParams.get(
      "passengerGender"
    ) || "";

  const passengerMobile =
    searchParams.get(
      "passengerMobile"
    ) || "";

  // ====================================================
  // DISPLAY FARE
  // Server final amount will be used for payment.
  // ====================================================

  const requestedBaseFare =
    Number(
      searchParams.get(
        "baseFare"
      ) || "0"
    );

  const requestedTaxes =
    Number(
      searchParams.get(
        "taxes"
      ) || "0"
    );

  const requestedConvenienceFee =
    Number(
      searchParams.get(
        "convenienceFee"
      ) || "0"
    );

const requestedTotalAmount =
  Number(
    searchParams.get(
      "totalAmount"
    ) || "0"
  );

const totalAmount =
  requestedTotalAmount;

const currency =
  searchParams.get(
    "currency"
  ) || "INR";

  // ====================================================
  // STATE
  // ====================================================

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

  // ====================================================
  // HELPERS
  // ====================================================

  function money(
    value: number
  ) {
    return value.toLocaleString(
      "en-IN"
    );
  }

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

  // ====================================================
  // LOAD RAZORPAY
  // ====================================================

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

  // ====================================================
  // HANDLE PAYMENT
  // ====================================================

  async function startPayment() {
    if (
      loading ||
      paid
    ) {
      return;
    }

    // --------------------------------------------------
    // BASIC CLIENT VALIDATION
    // --------------------------------------------------

    if (
      !flightId ||
      !airlineName ||
      !flightNumber ||
      !from ||
      !to ||
      !journeyDate ||
      !passengerName ||
      !passengerMobile
    ) {
      setError(
        "Flight booking details पूरी नहीं हैं।"
      );

      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // =================================================
      // STEP 1
      // LOAD RAZORPAY
      // =================================================

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        setError(
          "Razorpay Checkout load नहीं हो पाया।"
        );

        setLoading(false);

        return;
      }

      // =================================================
      // STEP 2
      // CREATE SERVER-SIDE FLIGHT TRANSACTION
      // =================================================

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
            "Flight booking transaction create होने में समस्या हुई। कृपया दोबारा प्रयास करें।"
          );

          setLoading(false);

          return;
        }

        transactionCreatedRef.current =
          true;

        console.log(
          "CREATING SERVER VERIFIED FLIGHT TRANSACTION"
        );

        const bookingResponse =
          await fetch(
            "/api/flight/booking/create",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                flightId,

                airlineCode,

                airlineName,

                flightNumber,

                from,

                fromName,

                to,

                toName,

                journeyDate,

                adults,

                children,

                infants,

                cabinClass,

                passengerName,

                passengerAge,

                passengerGender,

                passengerMobile,
              }),
            }
          );

        const bookingData =
          await readJsonResponse(
            bookingResponse
          );

        console.log(
          "FLIGHT SERVER BOOKING RESPONSE:",
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
              "Flight booking transaction create नहीं हो सकी।"
          );

          setLoading(false);

          return;
        }

        currentTransactionId =
          bookingData.transaction
            ?.transactionId ||
          "";

        currentAmount =
          bookingData.transaction
            ?.amount ||
          "";

        if (
          !currentTransactionId
        ) {
          transactionCreatedRef.current =
            false;

          setError(
            "Flight transaction ID नहीं मिली।"
          );

          setLoading(false);

          return;
        }

        if (
          !currentAmount
        ) {
          transactionCreatedRef.current =
            false;

          setError(
            "Server verified flight amount नहीं मिला।"
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
      }

      // =================================================
      // STEP 3
      // CREATE RAZORPAY ORDER
      // =================================================

      console.log(
        "CREATING FLIGHT RAZORPAY ORDER:",
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
        "FLIGHT RAZORPAY ORDER RESPONSE:",
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

      // =================================================
      // STEP 4
      // VALIDATE ORDER
      // =================================================

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

      // =================================================
      // STEP 5
      // RAZORPAY OPTIONS
      // =================================================

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
          `Flight Booking - ${airlineName} ${flightNumber}`,

        order_id:
          orderData.order.id,

        notes: {
          transactionId:
            currentTransactionId,

          service:
            "FLIGHT_BOOKING",

          flightId,

          flightNumber,
        },

        theme: {
          color:
            "#2563eb",
        },

        // ===============================================
        // PAYMENT SUCCESS
        // ===============================================

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
                "FLIGHT RAZORPAY RESPONSE:",
                response
              );

              // =========================================
              // STEP 6
              // VERIFY PAYMENT
              // =========================================

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
                "FLIGHT VERIFY RESPONSE:",
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

              // =========================================
              // PAYMENT VERIFIED
              // =========================================

              paymentVerifiedRef.current =
                true;

              setPaid(true);

              setLoading(false);

              setError("");

              setVerifiedAmount(
                String(
                  verifyData.transaction
                    ?.amount ||
                    currentAmount
                )
              );

              setMessage(
                "Flight payment सफलतापूर्वक verify हो गया है।"
              );

              // =================================================
// STEP 7
// CONFIRM FLIGHT BOOKING
// =================================================

setMessage(
  "Payment verify हो गया है। Flight booking confirm हो रही है..."
);

const confirmResponse =
  await fetch(
    "/api/flight/booking/confirm",
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

const confirmData =
  await readJsonResponse(
    confirmResponse
  );

console.log(
  "FLIGHT CONFIRM RESPONSE:",
  confirmData
);

if (
  !confirmResponse.ok ||
  !confirmData.success
) {
  setError(
    confirmData.message ||
      "Payment successful है, लेकिन flight booking confirm नहीं हो सकी।"
  );

  setMessage("");

  setLoading(false);

  return;
}

// =================================================
// BOOKING CONFIRMED
// =================================================

setMessage(
  "Flight booking successfully confirmed."
);

console.log(
  "FLIGHT BOOKING CONFIRMED:",
  confirmData.confirmationId
);

// =================================================
// REDIRECT TO CONFIRMATION
// =================================================

setTimeout(() => {
  router.push(
    `/service2/flight/confirmation/${encodeURIComponent(
      currentTransactionId
    )}`
  );
}, 1200);
              console.log(
                "FLIGHT PAYMENT SUCCESS:",
                currentTransactionId
              );

              // NOTE:
              // अभी payment verification complete है.
              // Flight provider confirmation अगला step है.
            } catch (error) {
              console.error(
                "FLIGHT PAYMENT VERIFY ERROR:",
                error
              );

              setError(
                "Payment verification में समस्या हुई।"
              );

              setMessage("");

              setLoading(false);
            }
          },

        // ===============================================
        // MODAL DISMISS
        // ===============================================

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

      // =================================================
      // STEP 7
      // OPEN RAZORPAY
      // =================================================

      const razorpay =
        new window.Razorpay(
          options
        );

      // =================================================
      // PAYMENT FAILED
      // =================================================

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
            "FLIGHT RAZORPAY PAYMENT FAILED:",
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
        "FLIGHT PAYMENT ERROR:",
        error
      );

      transactionCreatedRef.current =
        false;

      setError(
        "Flight payment process शुरू नहीं हो पाया।"
      );

      setLoading(false);
    }
  }

  // ====================================================
  // INVALID DATA
  // ====================================================

  if (
    !flightId ||
    !airlineName ||
    !flightNumber ||
    !from ||
    !to ||
    !journeyDate ||
    !passengerName ||
    totalAmount <= 0
  ) {
    return (
      <main className="min-h-screen bg-gray-100">

        <header className="bg-white shadow-sm px-6 py-4">

          <div className="max-w-6xl mx-auto flex items-center justify-between">

            <Link
              href="/"
              className="text-xl font-bold text-blue-700"
            >
              RY MULTI SERVICE
            </Link>

            <Link
              href="/service2/flight"
              className="text-gray-600 hover:text-blue-600"
            >
              Flight Search
            </Link>

          </div>

        </header>

        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="bg-white rounded-xl shadow p-10 text-center">

            <div className="text-5xl">
              ❌
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              Payment Details नहीं मिलीं
            </h2>

            <p className="text-gray-600 mt-2">
              कृपया पहले flight select करके passenger details पूरी करें।
            </p>

            <Link
              href="/service2/flight"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              ← Flight Search पर जाएँ
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // ====================================================
  // DISPLAY AMOUNT
  // ====================================================

  const displayAmount =
    verifiedAmount ||
    String(
      requestedTotalAmount
    );

  const displayBaseFare =
    verifiedAmount
      ? Math.max(
          Number(
            verifiedAmount
          ) -
            requestedTaxes -
            requestedConvenienceFee,
          0
        )
      : requestedBaseFare;

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm px-6 py-4">

        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <Link
            href="/"
            className="text-xl font-bold text-blue-700"
          >
            RY MULTI SERVICE
          </Link>

          <div className="flex items-center gap-6">

            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/service2/flight"
              className="text-gray-600 hover:text-blue-600"
            >
              Flight Search
            </Link>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-gray-900">
            ✈️ Flight Booking Payment
          </h1>

          <p className="text-gray-600 mt-2">
            अपनी flight booking का payment पूरा करें।
          </p>

        </div>

        <div className="max-w-3xl mx-auto">

          {/* FLIGHT DETAILS */}

          <section className="bg-white rounded-xl shadow p-6">

            <div className="flex items-start justify-between gap-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {airlineName}
                </h2>

                <p className="text-gray-500 mt-1">
                  {airlineCode}
                  {" • "}
                  {flightNumber}
                </p>

              </div>

              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                {cabinClass}
              </span>

            </div>

            <div className="mt-6 flex items-center gap-4">

              <div>

                <p className="text-2xl font-bold text-gray-900">
                  {departureTime}
                </p>

                <p className="text-sm text-gray-500">
                  {from}
                  {" • "}
                  {fromName}
                </p>

              </div>

              <div className="flex-1 text-center">

                <p className="text-xs text-gray-500">
                  {duration}
                </p>

                <div className="flex items-center gap-2 mt-2">

                  <div className="h-px bg-gray-300 flex-1" />

                  <span className="text-blue-600">
                    ✈️
                  </span>

                  <div className="h-px bg-gray-300 flex-1" />

                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {stops ===
                  0
                    ? "Non-stop"
                    : `${stops} stop`}
                </p>

              </div>

              <div className="text-right">

                <p className="text-2xl font-bold text-gray-900">
                  {arrivalTime}
                </p>

                <p className="text-sm text-gray-500">
                  {to}
                  {" • "}
                  {toName}
                </p>

              </div>

            </div>

            <div className="border-t mt-6 pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>

                <p className="text-sm text-gray-500">
                  Journey Date
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {formatDate(
                    journeyDate
                  )}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Passengers
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {adults +
                    children +
                    infants}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Booking Type
                </p>

                <p className="font-semibold mt-1">

                  <span
                    className={
                      refundable
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {refundable
                      ? "Refundable"
                      : "Non-refundable"}
                  </span>

                </p>

              </div>

            </div>

          </section>

          {/* PRIMARY PASSENGER */}

          <section className="bg-white rounded-xl shadow p-6 mt-6">

            <h2 className="text-xl font-bold text-gray-900">
              👤 Primary Passenger
            </h2>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <p className="text-sm text-gray-500">
                  Name
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {passengerName}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Age
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {passengerAge}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Gender
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {passengerGender}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Mobile
                </p>

                <p className="font-semibold text-gray-900 mt-1">
                  {passengerMobile}
                </p>

              </div>

            </div>

          </section>

          {/* FARE */}

          <section className="bg-white rounded-xl shadow p-6 mt-6">

            <h2 className="text-xl font-bold text-gray-900">
              💳 Fare Summary
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between gap-5">

                <span className="text-gray-600">
                  Base Fare
                </span>

                <span className="font-semibold">
                  ₹
                  {money(
                    displayBaseFare
                  )}
                </span>

              </div>

              <div className="flex justify-between gap-5">

                <span className="text-gray-600">
                  Taxes
                </span>

                <span className="font-semibold">
                  ₹
                  {money(
                    requestedTaxes
                  )}
                </span>

              </div>

              <div className="flex justify-between gap-5">

                <span className="text-gray-600">
                  Convenience Fee
                </span>

                <span className="font-semibold">
                  ₹
                  {money(
                    requestedConvenienceFee
                  )}
                </span>

              </div>

              <div className="border-t pt-4 flex justify-between gap-5">

                <span className="text-xl font-bold text-gray-900">
                  Total Amount
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹
                  {money(
                    Number(
                      displayAmount
                    )
                  )}
                </span>

              </div>

            </div>

            {/* TRANSACTION */}

            {transactionId && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">

                <p className="text-sm text-blue-700">
                  Booking Transaction ID
                </p>

                <p className="font-bold text-blue-800 mt-1 break-all">
                  {transactionId}
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

            {/* MESSAGE */}

            {!paid &&
              message && (
                <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4">
                  {message}
                </div>
              )}

            {/* SUCCESS */}

            {paid && (
              <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-5">

                <div className="text-4xl text-center">
                  ✅
                </div>

                <h3 className="text-xl font-bold text-center mt-3">
                  Flight Payment Successful
                </h3>

                <p className="text-center mt-2">
                  आपका flight payment successfully verify हो गया है।
                </p>

                {transactionId && (
                  <div className="mt-4 bg-white rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Transaction ID
                    </p>

                    <p className="font-bold text-gray-900 break-all mt-1">
                      {transactionId}
                    </p>

                  </div>
                )}

                <p className="text-center text-sm mt-4">
                  Flight booking confirmation अगला step है।
                </p>

              </div>
            )}

            {/* PAY */}

            {!paid && (
              <button
                type="button"
                onClick={
                  startPayment
                }
                disabled={
                  loading
                }
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg"
              >
                {loading
                  ? "Payment Processing..."
                  : `Pay ₹${money(
                      Number(
                        displayAmount
                      )
                    )} →`}
              </button>
            )}

            {!paid && (
              <Link
                href={`/service2/flight/details?${new URLSearchParams(
                  {
                    flightId,
                    airlineCode,
                    airlineName,
                    flightNumber,
                    from,
                    fromName,
                    to,
                    toName,
                    departureTime,
                    arrivalTime,
                    duration,
                    stops:
                      String(
                        stops
                      ),
                    cabinClass,
                    refundable:
                      String(
                        refundable
                      ),
                    journeyDate,
                    adults:
                      String(
                        adults
                      ),
                    children:
                      String(
                        children
                      ),
                    infants:
                      String(
                        infants
                      ),
                    passengerName,
                    passengerAge:
                      String(
                        passengerAge
                      ),
                    passengerGender,
                    passengerMobile,
                    baseFare:
                      String(
                        requestedBaseFare
                      ),
                    taxes:
                      String(
                        requestedTaxes
                      ),
                    convenienceFee:
                      String(
                        requestedConvenienceFee
                      ),
                    totalAmount:
                      String(
                        requestedTotalAmount
                      ),
                    currency,
                  }
                ).toString()}`}
                className="block w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg text-center"
              >
                ← Change Passenger Details
              </Link>
            )}

            {!paid && (
              <p className="text-center text-xs text-gray-500 mt-6">
                Secure payment powered by Razorpay
              </p>
            )}

          </section>

        </div>

      </div>

    </main>
  );
}

// ======================================================
// PAGE WRAPPER
// ======================================================

export default function FlightPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">

          <p className="text-gray-600">
            Payment page load हो रहा है...
          </p>

        </main>
      }
    >
      <FlightPaymentContent />
    </Suspense>
  );
}