"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ElectricityPage() {
  const router = useRouter();

  const [operator, setOperator] = useState("");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const cleanConsumerNumber =
      consumerNumber.trim().toUpperCase();

    const cleanAmount = Number(amount);

    if (!operator) {
      setError("कृपया Electricity Board चुनें।");
      return;
    }

    if (!cleanConsumerNumber) {
      setError("कृपया Consumer Number डालें।");
      return;
    }

    if (cleanConsumerNumber.length < 4) {
      setError("कृपया सही Consumer Number डालें।");
      return;
    }

    if (!Number.isFinite(cleanAmount)) {
      setError("कृपया सही Bill Amount डालें।");
      return;
    }

    if (cleanAmount < 10) {
      setError("Minimum bill payment ₹10 है।");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/recharge/electricity",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            operator,
            consumerNumber:
              cleanConsumerNumber,
            amount: cleanAmount,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "ELECTRICITY API RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Electricity bill transaction create नहीं हो पाया।"
        );

        setLoading(false);
        return;
      }

      if (!data.transactionId) {
        setError(
          "Transaction ID प्राप्त नहीं हुई।"
        );

        setLoading(false);
        return;
      }

      // अभी केवल transaction create हुआ है।
      // अगले चरण में इसी transactionId से
      // Razorpay payment शुरू करेंगे।

      router.push(
        `/service1/electricity/payment?transactionId=${encodeURIComponent(
          data.transactionId
        )}&amount=${encodeURIComponent(
          cleanAmount.toFixed(2)
        )}`
      );
    } catch (error) {
      console.error(
        "ELECTRICITY FORM ERROR:",
        error
      );

      setError(
        "Server से संपर्क नहीं हो पाया। कृपया दोबारा प्रयास करें।"
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">

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

      {/* MAIN */}

      <div className="max-w-xl mx-auto px-6 py-12">

        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Electricity Bill Payment
          </h2>

          <p className="text-gray-500 text-center mt-2">
            अपना electricity bill online pay करें
          </p>

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

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >

            {/* ELECTRICITY BOARD */}

            <div>
              <label
                htmlFor="operator"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Electricity Board
              </label>

              <select
                id="operator"
                value={operator}
                onChange={(event) =>
                  setOperator(event.target.value)
                }
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Electricity Board चुनें
                </option>

                <option value="bses-rajdhani">
                  BSES Rajdhani Power Limited
                </option>

                <option value="bses-yamuna">
                  BSES Yamuna Power Limited
                </option>

                <option value="tata-power-delhi">
                  Tata Power Delhi Distribution
                </option>

                <option value="uppcl">
                  Uttar Pradesh Power Corporation
                </option>

                <option value="msedcl">
                  Maharashtra State Electricity Distribution
                </option>

                <option value="mpwz">
                  Madhya Pradesh Paschim Kshetra Vidyut
                </option>

                <option value="jvvnl">
                  Jaipur Vidyut Vitran Nigam
                </option>

              </select>
            </div>

            {/* CONSUMER NUMBER */}

            <div className="mt-6">

              <label
                htmlFor="consumerNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Consumer Number
              </label>

              <input
                id="consumerNumber"
                type="text"
                value={consumerNumber}
                onChange={(event) =>
                  setConsumerNumber(
                    event.target.value
                  )
                }
                disabled={loading}
                placeholder="Consumer Number डालें"
                maxLength={30}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500 mt-2">
                अपने electricity bill पर दिया गया Consumer Number डालें।
              </p>

            </div>

            {/* AMOUNT */}

            <div className="mt-6">

              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Bill Amount
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                  ₹
                </span>

                <input
                  id="amount"
                  type="number"
                  min="10"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  disabled={loading}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <p className="text-xs text-gray-500 mt-2">
                Minimum payment ₹10 है।
              </p>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg"
            >
              {loading
                ? "Transaction बन रही है..."
                : "Bill Pay करें →"}
            </button>

          </form>

          {/* CANCEL */}

          <button
            type="button"
            onClick={() =>
              router.push("/service1")
            }
            disabled={loading}
            className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </div>

    </main>
  );
}