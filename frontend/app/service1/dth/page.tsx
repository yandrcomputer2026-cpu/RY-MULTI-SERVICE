"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function DTHPage() {
  const router = useRouter();

  const [customerId, setCustomerId] = useState("");
  const [operator, setOperator] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const cleanCustomerId =
      customerId.trim().toUpperCase();

    const numericAmount = Number(amount);

    // ================= CUSTOMER ID VALIDATION =================

    if (!cleanCustomerId) {
      setError(
        "कृपया DTH Customer ID / Subscriber Number डालें।"
      );
      return;
    }

    if (cleanCustomerId.length < 4) {
      setError(
        "कृपया valid DTH Customer ID डालें।"
      );
      return;
    }

    // ================= OPERATOR VALIDATION =================

    if (!operator) {
      setError("कृपया DTH operator select करें।");
      return;
    }

    // ================= AMOUNT VALIDATION =================

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        "कृपया valid recharge amount डालें।"
      );
      return;
    }

    if (numericAmount < 10) {
      setError(
        "Minimum DTH recharge amount ₹10 है।"
      );
      return;
    }

    setLoading(true);

    try {
      // ================= CREATE TRANSACTION =================

      const response = await fetch(
        "/api/recharge/dth",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customerId: cleanCustomerId,
            operator,
            amount: numericAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "DTH transaction create नहीं हो पाया।"
        );

        setLoading(false);
        return;
      }

      // ================= TRANSACTION ID =================

      if (!data.transactionId) {
        setError(
          "Transaction ID नहीं मिली।"
        );

        setLoading(false);
        return;
      }

      // ================= PAYMENT PAGE =================

      router.push(
        `/service1/dth/payment?transactionId=${encodeURIComponent(
          data.transactionId
        )}&amount=${encodeURIComponent(
          numericAmount.toFixed(2)
        )}`
      );
    } catch (error) {
      console.error(
        "DTH TRANSACTION ERROR:",
        error
      );

      setError(
        "DTH recharge transaction शुरू नहीं हो पाया। कृपया दोबारा प्रयास करें।"
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}

      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push("/service1")
            }
            className="text-gray-600 hover:text-blue-600"
          >
            Service 1
          </button>

        </div>
      </header>


      {/* ================= MAIN ================= */}

      <div className="max-w-xl mx-auto px-6 py-10">

        <div className="bg-white rounded-xl shadow p-8">

          {/* ================= TITLE ================= */}

          <div className="text-center">

            <div className="text-5xl">
              📺
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-4">
              DTH Recharge
            </h2>

            <p className="text-gray-500 mt-2">
              अपने DTH connection को recharge करें।
            </p>

          </div>


          {/* ================= ERROR ================= */}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">

              <p className="font-semibold">
                Error
              </p>

              <p className="mt-1">
                {error}
              </p>

            </div>
          )}


          {/* ================= FORM ================= */}

          <form
            onSubmit={handleContinue}
            className="mt-8 space-y-5"
          >

            {/* ================= CUSTOMER ID ================= */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                DTH Customer ID / Subscriber Number
              </label>

              <input
                type="text"
                value={customerId}
                onChange={(e) =>
                  setCustomerId(
                    e.target.value
                      .toUpperCase()
                      .replace(/\s/g, "")
                  )
                }
                placeholder="Enter Customer ID"
                maxLength={20}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500 mt-2">
                अपने DTH account का Customer ID / Subscriber Number डालें।
              </p>

            </div>


            {/* ================= OPERATOR ================= */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                DTH Operator
              </label>

              <select
                value={operator}
                onChange={(e) =>
                  setOperator(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="">
                  Select DTH Operator
                </option>

                <option value="tata-play">
                  Tata Play
                </option>

                <option value="airtel-digital-tv">
                  Airtel Digital TV
                </option>

                <option value="dish-tv">
                  Dish TV
                </option>

                <option value="d2h">
                  d2h
                </option>

                <option value="sun-direct">
                  Sun Direct
                </option>

                <option value="videocon-d2h">
                  Videocon D2H
                </option>

              </select>

            </div>


            {/* ================= AMOUNT ================= */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recharge Amount
              </label>

              <input
                type="number"
                min="10"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Enter recharge amount"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* ================= SUBMIT ================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition"
            >
              {loading
                ? "Processing..."
                : "Continue to Payment →"}
            </button>

          </form>


          {/* ================= CANCEL ================= */}

          <button
            type="button"
            onClick={() =>
              router.push("/service1")
            }
            disabled={loading}
            className="w-full mt-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-semibold py-3 rounded-lg"
          >
            Cancel
          </button>


          {/* ================= INFO ================= */}

          <p className="text-center text-gray-500 text-sm mt-6">
            Secure payment powered by Razorpay
          </p>

        </div>

      </div>

    </main>
  );
}