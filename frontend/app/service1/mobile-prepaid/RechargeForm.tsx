"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RechargeForm() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [operator, setOperator] = useState("");
  const [circle, setCircle] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= QUICK AMOUNT =================

  function selectAmount(value: number) {
    setAmount(String(value));
  }

  // ================= PROCEED TO PAYMENT =================

  async function handleRecharge() {
    setError("");

    // Mobile validation
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("कृपया सही 10 digit mobile number डालें।");
      return;
    }

    // Operator validation
    if (!operator) {
      setError("कृपया mobile operator select करें।");
      return;
    }

    // Circle validation
    if (!circle) {
      setError("कृपया circle select करें।");
      return;
    }

    // Amount validation
    if (!amount || Number(amount) < 10) {
      setError("Minimum recharge amount ₹10 है।");
      return;
    }

    try {
      setLoading(true);

      // ================= CREATE RECHARGE TRANSACTION =================

      const response = await fetch("/api/recharge/prepaid", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          mobile,
          operator,
          circle,
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Recharge request failed."
        );
        return;
      }

      // Transaction ID
      const newTransactionId =
        data.transaction.transactionId;

      // ================= GO TO PAYMENT PAGE =================

      router.push(
        `/service1/mobile-prepaid/payment?transactionId=${newTransactionId}&amount=${Number(amount)}`
      );

    } catch (error) {
      console.error("RECHARGE ERROR:", error);

      setError(
        "Server से connection नहीं हो पाया।"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      {/* ================= TITLE ================= */}

      <h3 className="text-2xl font-bold text-gray-900">
        Recharge Details
      </h3>


      {/* ================= MOBILE ================= */}

      <div className="mt-6">

        <label className="block text-gray-700 font-semibold mb-2">
          Mobile Number
        </label>

        <input
          type="tel"
          maxLength={10}
          inputMode="numeric"
          value={mobile}
          onChange={(e) =>
            setMobile(
              e.target.value.replace(/\D/g, "")
            )
          }
          placeholder="Enter 10 digit mobile number"
          className="w-full border border-gray-300 rounded-lg px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>


      {/* ================= OPERATOR ================= */}

      <div className="mt-5">

        <label className="block text-gray-700 font-semibold mb-2">
          Select Operator
        </label>

        <select
          value={operator}
          onChange={(e) =>
            setOperator(e.target.value)
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        >

          <option value="">
            Select Operator
          </option>

          <option value="jio">
            Jio
          </option>

          <option value="airtel">
            Airtel
          </option>

          <option value="vi">
            Vi
          </option>

          <option value="bsnl">
            BSNL
          </option>

        </select>

      </div>


      {/* ================= CIRCLE ================= */}

      <div className="mt-5">

        <label className="block text-gray-700 font-semibold mb-2">
          Select Circle
        </label>

        <select
          value={circle}
          onChange={(e) =>
            setCircle(e.target.value)
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        >

          <option value="">
            Select Circle
          </option>

          <option value="andhra-pradesh">
            Andhra Pradesh
          </option>

          <option value="bihar">
            Bihar
          </option>

          <option value="delhi">
            Delhi
          </option>

          <option value="gujarat">
            Gujarat
          </option>

          <option value="haryana">
            Haryana
          </option>

          <option value="jharkhand">
            Jharkhand
          </option>

          <option value="karnataka">
            Karnataka
          </option>

          <option value="kerala">
            Kerala
          </option>

          <option value="madhya-pradesh">
            Madhya Pradesh
          </option>

          <option value="maharashtra">
            Maharashtra
          </option>

          <option value="odisha">
            Odisha
          </option>

          <option value="punjab">
            Punjab
          </option>

          <option value="rajasthan">
            Rajasthan
          </option>

          <option value="tamil-nadu">
            Tamil Nadu
          </option>

          <option value="telangana">
            Telangana
          </option>

          <option value="uttar-pradesh">
            Uttar Pradesh
          </option>

          <option value="uttarakhand">
            Uttarakhand
          </option>

          <option value="west-bengal">
            West Bengal
          </option>

        </select>

      </div>


      {/* ================= AMOUNT ================= */}

      <div className="mt-5">

        <label className="block text-gray-700 font-semibold mb-2">
          Recharge Amount
        </label>

        <div className="relative">

          <span className="absolute left-4 top-3 text-gray-600 font-semibold">
            ₹
          </span>

          <input
            type="number"
            min="10"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            placeholder="Enter recharge amount"
            className="w-full border border-gray-300 rounded-lg
            pl-9 pr-4 py-3
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <p className="text-sm text-gray-500 mt-2">
          Minimum recharge amount ₹10
        </p>

      </div>


      {/* ================= QUICK AMOUNT ================= */}

      <div className="mt-5">

        <p className="text-gray-700 font-semibold mb-3">
          Quick Amount
        </p>

        <div className="flex flex-wrap gap-3">

          {[99, 199, 299, 499, 599].map(
            (value) => (

              <button
                key={value}
                type="button"
                onClick={() =>
                  selectAmount(value)
                }
                disabled={loading}
                className="border border-gray-300 px-5 py-2 rounded-lg
                hover:bg-blue-50 hover:border-blue-500
                disabled:opacity-50"
              >
                ₹{value}
              </button>

            )
          )}

        </div>

      </div>


      {/* ================= ERROR ================= */}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200
          text-red-700 rounded-lg p-4">

          {error}

        </div>
      )}


      {/* ================= PROCEED BUTTON ================= */}

      <div className="mt-8">

        <button
          type="button"
          onClick={handleRecharge}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700
          disabled:bg-gray-400
          disabled:cursor-not-allowed
          text-white font-bold py-3 rounded-lg transition"
        >

          {loading
            ? "Creating Payment..."
            : "Proceed to Payment →"}

        </button>

      </div>

    </div>
  );
}