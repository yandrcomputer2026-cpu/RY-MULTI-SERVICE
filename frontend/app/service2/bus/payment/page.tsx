"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ======================================================
// SAFE JSON RESPONSE
// ======================================================

async function readJsonResponse(response: Response) {
  const contentType =
    response.headers.get("content-type") || "";

  const text = await response.text();

  if (!text) {
    return {
      success: false,
      message: `Server ने empty response दिया। HTTP ${response.status}`,
    };
  }

  if (!contentType.includes("application/json")) {
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
    console.error("JSON PARSE ERROR:", error);

    return {
      success: false,
      message: "Server से invalid JSON response मिला।",
    };
  }
}

// ======================================================
// BUS PAYMENT CONTENT
// ======================================================

function BusPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const transactionId =
    searchParams.get("transactionId");

  const amount =
    searchParams.get("amount");

  const [loading, setLoading] =
    useState(false);

  const [paid, setPaid] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const paymentVerifiedRef =
    useRef(false);

  // ====================================================
  // LOAD RAZORPAY SCRIPT
  // ====================================================

  async function loadRazorpayScript(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(!!window.Razorpay)
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () =>
        resolve(!!window.Razorpay);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(script);
    });
  }

  // ====================================================
  // HANDLE PAYMENT
  // ====================================================

  async function handlePayment() {
    if (!transactionId || !amount) {
      setError(
        "Payment details उपलब्ध नहीं हैं।"
      );
      return;
    }

    if (loading || paid) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ==================================================
      // STEP 1: LOAD RAZORPAY
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
      // STEP 2: CREATE RAZORPAY ORDER
      // ==================================================

      console.log(
        "CREATING BUS RAZORPAY ORDER:",
        transactionId
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
              transactionId,
            }),
          }
        );

      const orderData =
        await readJsonResponse(
          orderResponse
        );

      console.log(
        "BUS ORDER RESPONSE:",
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
      // STEP 3: VALIDATE ORDER
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
      // STEP 4: RAZORPAY OPTIONS
      // ==================================================

      const options = {
        key: orderData.keyId,

        amount:
          orderData.order.amount,

        currency:
          orderData.order.currency ||
          "INR",

        name:
          "RY MULTI SERVICE",

        description:
          "Bus Booking Payment",

        order_id:
          orderData.order.id,

        notes: {
          transactionId,
          service:
            "BUS_BOOKING",
        },

        theme: {
          color: "#2563eb",
        },

        // ==================================================
        // PAYMENT SUCCESS
        // ==================================================

        handler: async function (
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
              "BUS RAZORPAY RESPONSE:",
              response
            );

            // ==============================================
            // STEP 5: VERIFY PAYMENT
            // ==============================================

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
                    transactionId,

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
              "BUS VERIFY RESPONSE:",
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

            // ==============================================
            // PAYMENT VERIFIED
            // ==============================================

            paymentVerifiedRef.current =
              true;

            setPaid(true);
            setLoading(false);
            setError("");

            setMessage(
              "Bus booking payment सफलतापूर्वक verify हो गया है।"
            );

            console.log(
              "BUS PAYMENT SUCCESS:",
              transactionId
            );

            // ==============================================
            // AUTO REDIRECT TO CONFIRMATION
            // ==============================================

            setTimeout(() => {
              router.push(
                `/service2/bus/confirmation/${encodeURIComponent(
                  transactionId
                )}`
              );
            }, 1000);
          } catch (error) {
            console.error(
              "BUS PAYMENT VERIFY ERROR:",
              error
            );

            setError(
              "Payment verification में समस्या हुई।"
            );

            setLoading(false);
          }
        },

        // ==================================================
        // PAYMENT MODAL DISMISS
        // ==================================================

        modal: {
          ondismiss: function () {
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
            "BUS RAZORPAY PAYMENT FAILED:",
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
        "BUS PAYMENT ERROR:",
        error
      );

      setError(
        "Payment process शुरू नहीं हो पाया।"
      );

      setLoading(false);
    }
  }

  // ====================================================
  // INVALID PAYMENT DETAILS
  // ====================================================

  if (
    !transactionId ||
    !amount
  ) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">

        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">

          <div className="text-5xl">
            ❌
          </div>

          <h1 className="text-2xl font-bold text-red-600 mt-4">
            Invalid Payment
          </h1>

          <p className="text-gray-600 mt-3">
            Bus payment details उपलब्ध नहीं हैं।
          </p>

          <Link
            href="/service2/bus"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            Bus Search पर वापस जाएँ
          </Link>

        </div>

      </main>
    );
  }

  // ====================================================
  // PAYMENT PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm px-6 py-4">

        <div className="max-w-4xl mx-auto flex items-center justify-between">

          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <Link
            href="/service2/bus"
            className="text-gray-600 hover:text-blue-600"
          >
            Bus Booking
          </Link>

        </div>

      </header>

      {/* MAIN */}

      <div className="max-w-xl mx-auto px-6 py-12">

        <div className="bg-white rounded-xl shadow p-8">

          {/* TITLE */}

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            🚌 Bus Booking Payment
          </h2>

          <p className="text-gray-500 text-center mt-2">
            अपनी Bus Booking का payment पूरा करें
          </p>

          {/* PAYMENT DETAILS */}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5">

            <div className="flex items-center justify-between">

              <span className="text-gray-600">
                Booking Amount
              </span>

              <span className="text-2xl font-bold text-gray-900">
                ₹{Number(amount).toFixed(2)}
              </span>

            </div>

            <div className="border-t border-blue-200 mt-5 pt-5">

              <p className="text-sm text-gray-600">
                Transaction ID
              </p>

              <p className="font-semibold text-blue-700 mt-1 break-all">
                {transactionId}
              </p>

            </div>

          </div>

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
                Booking Payment Successful
              </h3>

              <p className="text-center mt-2">
                आपका Bus Booking payment सफलतापूर्वक verify हो गया है।
              </p>

              <p className="text-center text-sm mt-3 break-all">
                Transaction ID: {transactionId}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/service2/bus/confirmation/${encodeURIComponent(
                      transactionId
                    )}`
                  )
                }
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
              >
                Bus Booking Details देखें →
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

          {/* STATUS */}

          {!paid && message && (
            <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4">
              {message}
            </div>
          )}

          {/* PAY BUTTON */}

          {!paid && (
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg"
            >
              {loading
                ? "Payment Processing..."
                : `Pay ₹${Number(amount).toFixed(2)} →`}
            </button>
          )}

          {/* CANCEL */}

          {!paid && (
            <Link
              href="/service2/bus"
              className="block w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg text-center"
            >
              Cancel
            </Link>
          )}

          {/* RAZORPAY INFO */}

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
// PAGE EXPORT
// ======================================================

export default function BusPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-gray-600">
            Payment details load हो रही हैं...
          </div>
        </main>
      }
    >
      <BusPaymentContent />
    </Suspense>
  );
}