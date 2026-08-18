"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useRef, useState } from "react";

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
      message: `Server returned empty response (${response.status}).`,
    };
  }

  if (!contentType.includes("application/json")) {
    console.error(
      "NON JSON API RESPONSE:",
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
    console.error("RAW RESPONSE:", text);

    return {
      success: false,
      message: "Server से invalid JSON response मिला।",
    };
  }
}

// ======================================================
// DTH PAYMENT CONTENT
// ======================================================

function DthPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const transactionId =
    searchParams.get("transactionId");

  const amount =
    searchParams.get("amount");

  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const paymentVerifiedRef = useRef(false);

  // ====================================================
  // LOAD RAZORPAY
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
      setError("Payment details नहीं मिलीं।");
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
      // LOAD RAZORPAY
      // ==================================================

      const loaded =
        await loadRazorpayScript();

      if (!loaded) {
        setError(
          "Razorpay Checkout load नहीं हो पाया।"
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // CREATE ORDER
      // ==================================================

      console.log(
        "CREATING RAZORPAY ORDER:",
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
        "RAZORPAY ORDER RESPONSE:",
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
      // VALIDATE ORDER
      // ==================================================

      if (
        !orderData.keyId ||
        !orderData.order?.id ||
        !orderData.order?.amount
      ) {
        console.error(
          "INVALID RAZORPAY ORDER:",
          orderData
        );

        setError(
          "Razorpay order की जानकारी सही नहीं मिली।"
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // RAZORPAY OPTIONS
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
          "DTH Recharge Payment",

        order_id:
          orderData.order.id,

        notes: {
          transactionId,
          service: "dth",
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
              "RAZORPAY PAYMENT RESPONSE:",
              response
            );

            // ==============================================
            // VERIFY PAYMENT
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
              "PAYMENT VERIFY RESPONSE:",
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

            setMessage(
              "Payment verified successfully. अब DTH recharge process किया जा रहा है..."
            );

            console.log(
              "DTH PAYMENT VERIFIED:",
              transactionId
            );

            // ==============================================
            // DTH PROCESS
            // ==============================================

            console.log(
              "STARTING DTH PROCESS:",
              transactionId
            );

            const processResponse =
              await fetch(
                "/api/recharge/dth/process",
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

            const processData =
              await readJsonResponse(
                processResponse
              );

            console.log(
              "DTH PROCESS RESPONSE:",
              processData
            );

            // ==============================================
            // PROCESS FAILED
            // ==============================================

            if (
              !processResponse.ok ||
              !processData.success
            ) {
              setPaid(true);
              setSuccess(false);

              setError(
                processData.message ||
                  "Payment successful है, लेकिन DTH recharge processing नहीं हुआ।"
              );

              setMessage(
                "Payment सफल हो चुका है, लेकिन DTH recharge processing में समस्या आई है।"
              );

              setLoading(false);

              return;
            }

            // ==============================================
            // EVERYTHING SUCCESSFUL
            // ==============================================

            setPaid(true);
            setSuccess(true);
            setError("");

            setMessage(
              `DTH recharge successful! Transaction ID: ${transactionId}`
            );

            console.log(
              "DTH RECHARGE COMPLETED:",
              transactionId
            );

            setLoading(false);
          } catch (err) {
            console.error(
              "DTH PAYMENT ERROR:",
              err
            );

            setError(
              "Payment verification या DTH processing में समस्या हुई।"
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
            "RAZORPAY PAYMENT FAILED:",
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
    } catch (err) {
      console.error(
        "PAYMENT ERROR:",
        err
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

          <h1 className="text-2xl font-bold text-red-600">
            Invalid Payment
          </h1>

          <p className="text-gray-600 mt-3">
            Payment details उपलब्ध नहीं हैं।
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/service1/dth"
              )
            }
            className="mt-6 bg-blue-600 text-white font-bold px-6 py-3 rounded-lg"
          >
            वापस जाएँ
          </button>

        </div>

      </main>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm px-6 py-4">

        <div className="max-w-4xl mx-auto flex justify-between items-center">

          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/service1/dth"
              )
            }
            disabled={loading}
            className="text-gray-600 hover:text-blue-600"
          >
            DTH
          </button>

        </div>

      </header>

      {/* MAIN */}

      <div className="max-w-xl mx-auto px-6 py-12">

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            DTH Recharge Payment
          </h2>

          <p className="text-gray-500 text-center mt-2">
            अपना DTH recharge payment complete करें
          </p>

          {/* RECHARGE DETAILS */}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5">

            <div className="flex justify-between">

              <span className="text-gray-600">
                Recharge Amount
              </span>

              <span className="font-bold text-gray-900">
                ₹{Number(amount).toFixed(2)}
              </span>

            </div>

            <div className="border-t border-blue-200 mt-4 pt-4">

              <p className="text-gray-600 text-sm">
                Transaction ID
              </p>

              <p className="font-semibold text-blue-700 text-sm mt-1 break-all">
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

          {/* STATUS */}

          {paid && message && (
            <div
              className={`mt-6 rounded-lg p-4 ${
                success
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-700"
              }`}
            >

              <p className="font-bold">
                {success
                  ? "DTH Recharge Successful"
                  : "Payment Received"}
              </p>

              <p className="mt-2">
                {message}
              </p>

            </div>
          )}

          {/* PAY BUTTON */}

          {!paid && (
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg"
            >
              {loading
                ? "Processing Payment..."
                : `Pay ₹${Number(amount).toFixed(2)} →`}
            </button>
          )}

          {/* SUCCESS BUTTON */}

          {success && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/service1"
                )
              }
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg"
            >
              Service 1 पर जाएँ
            </button>
          )}

          {/* CANCEL */}

          {!paid && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/service1/dth"
                )
              }
              disabled={loading}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
            >
              Cancel
            </button>
          )}

          {/* RAZORPAY MESSAGE */}

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

export default function DthPaymentPage() {
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
      <DthPaymentContent />
    </Suspense>
  );
}