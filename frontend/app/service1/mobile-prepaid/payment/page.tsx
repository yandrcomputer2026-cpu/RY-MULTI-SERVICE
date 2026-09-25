"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const transactionId = searchParams.get("transactionId");
  const amount = searchParams.get("amount");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  const paymentVerifiedRef = useRef(false);

  // ======================================================
  // LOAD RAZORPAY
  // ======================================================

  async function loadRazorpayScript(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          resolve(!!window.Razorpay);
        });

        existingScript.addEventListener("error", () => {
          resolve(false);
        });

        if (window.Razorpay) {
          resolve(true);
        }

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => {
        resolve(!!window.Razorpay);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  // ======================================================
  // PAYMENT
  // ======================================================

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
      // PROVIDER STATUS CHECK
      //
      // IMPORTANT:
      // Provider ACTIVE होने से पहले Razorpay order
      // या payment शुरू नहीं होना चाहिए.
      // ==================================================

      const statusResponse = await fetch(
        "/api/internal/recharge/status",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const statusData =
        await statusResponse.json();

      if (
        !statusResponse.ok ||
        !statusData.success
      ) {
        setError(
          statusData.message ||
            "Recharge provider status check नहीं हो पाया।"
        );

        setLoading(false);
        return;
      }

      const prepaidProvider =
        statusData.services?.mobilePrepaid;

      const providerReady =
  prepaidProvider?.success === true &&
  prepaidProvider?.data?.configured === true &&
  prepaidProvider?.data?.available === true &&
  (
    prepaidProvider?.data?.status === "TEST_MODE" ||
    prepaidProvider?.data?.status === "ACTIVE"
  );

      if (!providerReady) {
        setError(
          "Mobile Prepaid provider अभी available नहीं है। इसलिए payment शुरू नहीं किया गया है।"
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // LOAD RAZORPAY ONLY AFTER PROVIDER CHECK
      // ==================================================

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        setError(
          "Razorpay Checkout load नहीं हो पाया। कृपया internet connection check करें।"
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // CREATE RAZORPAY ORDER
      // ==================================================

      const orderResponse = await fetch(
        "/api/payment/order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            transactionId,
          }),
        }
      );

      const orderData =
        await orderResponse.json();

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

      if (
        !orderData.keyId ||
        !orderData.order?.id ||
        !orderData.order?.amount
      ) {
        console.error(
          "INVALID RAZORPAY ORDER RESPONSE:",
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

        amount: orderData.order.amount,

        currency:
          orderData.order.currency || "INR",

        name: "RY MULTI SERVICE",

        description:
          "Mobile Prepaid Recharge Payment",

        order_id:
          orderData.order.id,

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        notes: {
          transactionId,
        },

        theme: {
          color: "#2563eb",
        },

        // ==================================================
        // RAZORPAY PAYMENT RESPONSE
        // ==================================================

        handler: async function (
          response: any
        ) {
          if (paymentVerifiedRef.current) {
            return;
          }

          try {
            setMessage(
              "Payment received. Verification चल रही है..."
            );

            setError("");

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
              await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyData.success
            ) {
              setError(
                verifyData.message ||
                  "Payment verification failed."
              );

              setLoading(false);
              return;
            }

            // Payment verified.
            // This does NOT mean recharge is successful.

            paymentVerifiedRef.current = true;

            setPaid(true);
            setError("");

            setMessage(
              "Payment verified successfully. Recharge provider confirmation का इंतजार किया जा रहा है..."
            );

            // ==============================================
            // PROCESS RECHARGE
            // ==============================================

            const rechargeResponse =
              await fetch(
                "/api/recharge/process",
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

            const rechargeData =
              await rechargeResponse.json();

            if (
              !rechargeResponse.ok ||
              !rechargeData.success
            ) {
              setError(
                rechargeData.message ||
                  "Payment verified है, लेकिन recharge अभी complete नहीं हुआ।"
              );

              setMessage(
                "Payment verified है, लेकिन recharge provider से successful confirmation नहीं मिला है।"
              );

              setLoading(false);
              return;
            }

            // ==============================================
            // RECHARGE SUCCESS
            //
            // This branch should only be reached when the
            // backend provider workflow has verified the
            // actual recharge as successful.
            // ==============================================

            setRechargeSuccess(true);
            setError("");

            setMessage(
              `Recharge successful! Transaction ID: ${transactionId}`
            );

            setLoading(false);
          } catch (err) {
            console.error(
              "VERIFY / RECHARGE ERROR:",
              err
            );

            setError(
              "Payment verification या recharge processing में समस्या हुई।"
            );

            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            if (paymentVerifiedRef.current) {
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
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          if (paymentVerifiedRef.current) {
            return;
          }

          console.warn(
            "Razorpay payment attempt failed:",
            response
          );

          setLoading(false);

          setError(
            response?.error?.description ||
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

  // ======================================================
  // INVALID PAYMENT DATA
  // ======================================================

  if (!transactionId || !amount) {
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
                "/service1/mobile-prepaid"
              )
            }
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg"
          >
            वापस Recharge पर जाएँ
          </button>

        </div>
      </main>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">

          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/service1/mobile-prepaid"
              )
            }
            disabled={loading}
            className="text-gray-600 hover:text-blue-600 disabled:opacity-50"
          >
            Recharge
          </button>

        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Payment
          </h2>

          <p className="text-gray-500 text-center mt-2">
            अपना recharge payment complete करें
          </p>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5">

            <div className="flex justify-between items-center">

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

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">

              <p className="font-semibold">
                Payment / Recharge Status
              </p>

              <p className="mt-1">
                {error}
              </p>

            </div>
          )}

          {paid && message && (
            <div
              className={`mt-6 rounded-lg p-4 ${
                rechargeSuccess
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-700"
              }`}
            >

              <p className="font-bold">
                {rechargeSuccess
                  ? "Recharge Successful"
                  : "Payment Verified"}
              </p>

              <p className="mt-2">
                {message}
              </p>

              {!rechargeSuccess && (
                <p className="text-sm mt-2">
                  Recharge को successful तभी माना जाएगा जब provider से verified confirmation मिले।
                </p>
              )}

            </div>
          )}

          {!paid && (
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition"
            >
              {loading
                ? "Checking Provider..."
                : `Pay ₹${Number(amount).toFixed(2)} →`}
            </button>
          )}

          {rechargeSuccess && (
            <button
              type="button"
              onClick={() =>
                router.push("/history")
              }
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg"
            >
              History देखें
            </button>
          )}

          {paid &&
            !rechargeSuccess &&
            error && (
              <button
                type="button"
                onClick={() =>
                  router.push("/history")
                }
                className="w-full mt-8 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
              >
                Transaction History देखें
              </button>
            )}

          {!paid && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/service1/mobile-prepaid"
                )
              }
              disabled={loading}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-semibold py-3 rounded-lg"
            >
              Cancel
            </button>
          )}

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

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow p-8 text-center">

            <h2 className="text-xl font-bold text-gray-900">
              Payment Page
            </h2>

            <p className="text-gray-500 mt-2">
              Payment details load हो रही हैं...
            </p>

          </div>
        </main>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}