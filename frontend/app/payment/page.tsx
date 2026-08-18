"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

  // ================= LOAD RAZORPAY SCRIPT =================

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
        existingScript.addEventListener("load", () => {
          resolve(true);
        });

        existingScript.addEventListener("error", () => {
          resolve(false);
        });

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  // ================= PAYMENT =================

  async function handlePayment() {
    if (!transactionId || !amount) {
      setError("Payment details नहीं मिलीं।");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ================= STEP 1 =================
      // LOAD RAZORPAY

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        setError(
          "Razorpay Checkout load नहीं हो पाया। कृपया internet connection check करें।"
        );

        setLoading(false);
        return;
      }

      // ================= STEP 2 =================
      // CREATE RAZORPAY ORDER

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

      // ================= STEP 3 =================
      // RAZORPAY CHECKOUT OPTIONS

      const options = {
        key: orderData.keyId,

        amount: orderData.order.amount,

        currency: orderData.order.currency,

        name: "RY MULTI SERVICE",

        description:
          "Mobile Recharge Payment",

        order_id: orderData.order.id,

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

        // ================= PAYMENT SUCCESS =================

        handler: async function (
          response: any
        ) {
          try {
            setMessage(
              "Payment received. Verification चल रही है..."
            );

            setError("");

            // ================= STEP 4 =================
            // VERIFY PAYMENT

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
                      response.razorpay_payment_id,

                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_signature:
                      response.razorpay_signature,
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

            // ================= PAYMENT VERIFIED =================

            setPaid(true);

            setMessage(
              "Payment verified successfully. Recharge process किया जा रहा है..."
            );

            // ================= STEP 5 =================
            // RECHARGE PROCESS

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
                  "Payment successful, लेकिन recharge failed."
              );

              setLoading(false);
              return;
            }

            // ================= RECHARGE SUCCESS =================

            setRechargeSuccess(true);

            setMessage(
              `Recharge successful! Transaction ID: ${transactionId}`
            );

            setLoading(false);
          } catch (error) {
            console.error(
              "VERIFY / RECHARGE ERROR:",
              error
            );

            setError(
              "Payment verify या recharge process में समस्या हुई।"
            );

            setLoading(false);
          }
        },

        // ================= PAYMENT FAILED =================

        modal: {
          ondismiss: function () {
            setLoading(false);

            setMessage("");

            setError(
              "Payment cancel कर दिया गया।"
            );
          },
        },
      };

      // ================= OPEN RAZORPAY =================

      const razorpay =
        new window.Razorpay(options);

      // ================= CHECKOUT ERROR =================

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "RAZORPAY PAYMENT FAILED:",
            response
          );

          setLoading(false);

          setError(
            response?.error?.description ||
              "Payment failed."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      setError(
        "Payment process शुरू नहीं हो पाया।"
      );

      setLoading(false);
    }
  }

  // ================= INVALID PAYMENT =================

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

  // ================= PAYMENT PAGE =================

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}

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

      {/* ================= MAIN ================= */}

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow p-8">
          {/* ================= TITLE ================= */}

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Payment
          </h2>

          <p className="text-gray-500 text-center mt-2">
            अपना recharge payment complete करें
          </p>

          {/* ================= PAYMENT DETAILS ================= */}

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

          {/* ================= ERROR ================= */}

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

          {/* ================= SUCCESS / PROCESSING ================= */}

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
                  : "Payment Successful"}
              </p>

              <p className="mt-2">
                {message}
              </p>

              {!rechargeSuccess && (
                <p className="text-sm mt-2">
                  कृपया इस page को बंद न करें...
                </p>
              )}
            </div>
          )}

          {/* ================= PAY BUTTON ================= */}

          {!paid && (
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition"
            >
              {loading
                ? "Processing Payment..."
                : `Pay ₹${Number(amount).toFixed(
                    2
                  )} →`}
            </button>
          )}

          {/* ================= AFTER SUCCESS ================= */}

          {rechargeSuccess && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/service1/mobile-prepaid"
                )
              }
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg"
            >
              वापस Recharge Page पर जाएँ
            </button>
          )}

          {/* ================= PAYMENT VERIFIED BUT RECHARGE FAILED ================= */}

          {paid &&
            !rechargeSuccess &&
            error && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/service1/mobile-prepaid"
                  )
                }
                className="w-full mt-8 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
              >
                Recharge Page पर जाएँ
              </button>
            )}

          {/* ================= CANCEL ================= */}

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

          {/* ================= PAYMENT INFO ================= */}

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
        <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
          <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Payment Page
            </h1>
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