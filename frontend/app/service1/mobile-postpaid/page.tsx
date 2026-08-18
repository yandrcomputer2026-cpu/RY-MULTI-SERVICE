"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function MobilePostpaidPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [operator, setOperator] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    const cleanMobile = mobile.replace(/\D/g, "");
    const numericAmount = Number(amount);

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("कृपया valid 10 digit mobile number डालें।");
      return;
    }

    if (!operator) {
      setError("कृपया operator select करें।");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("कृपया valid bill amount डालें।");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * यहाँ आपका backend transaction-create API लगाना होगा।
       *
       * अभी frontend validation complete है।
       */

      const response = await fetch("/api/recharge/postpaid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: cleanMobile,
          operator,
          amount: numericAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Postpaid transaction create नहीं हो पाया।"
        );
        setLoading(false);
        return;
      }

      if (!data.transactionId) {
        setError("Transaction ID नहीं मिली।");
        setLoading(false);
        return;
      }

      router.push(
        `/service1/mobile-postpaid/payment?transactionId=${encodeURIComponent(
          data.transactionId
        )}&amount=${encodeURIComponent(
          numericAmount.toFixed(2)
        )}`
      );
    } catch (err) {
      console.error("POSTPAID ERROR:", err);

      setError(
        "Postpaid transaction शुरू नहीं हो पाया। कृपया दोबारा प्रयास करें।"
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <button
            type="button"
            onClick={() => router.push("/service1")}
            className="text-gray-600 hover:text-blue-600"
          >
            Service 1
          </button>
        </div>
      </header>

      {/* MAIN */}
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Mobile Postpaid
          </h2>

          <p className="text-gray-500 text-center mt-2">
            अपना postpaid bill payment करें
          </p>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              <p className="font-semibold">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleContinue}
            className="mt-8 space-y-5"
          >
            {/* MOBILE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter 10 digit mobile number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* OPERATOR */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Operator
              </label>

              <select
                value={operator}
                onChange={(e) =>
                  setOperator(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select Operator
                </option>

                <option value="airtel">
                  Airtel
                </option>

                <option value="jio">
                  Jio
                </option>

                <option value="vi">
                  Vodafone Idea
                </option>

                <option value="bsnl">
                  BSNL
                </option>
              </select>
            </div>

            {/* AMOUNT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bill Amount
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Enter bill amount"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SUBMIT */}
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

          <button
            type="button"
            onClick={() => router.push("/service1")}
            disabled={loading}
            className="w-full mt-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-800 font-semibold py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}