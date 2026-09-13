"use client";

import Link from "next/link";
import Script from "next/script";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type OrderResponse = {
  success: boolean;
  message?: string;
  keyId?: string;

  order?: {
    id: string;
    amount: number;
    currency: string;
  };

  transaction?: {
    transactionId: string;
    amount: string;
    status: string;
  };
};

type VerifyResponse = {
  success: boolean;
  message?: string;

  wallet?: {
    availableBalance: string;
    lockedBalance: string;
    status?: string;
  };

  transaction?: {
    transactionId: string;
    amount?: string;
    status: string;
    balanceBefore?: string;
    balanceAfter?: string;
  };
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  handler: (
    response: RazorpaySuccessResponse
  ) => void | Promise<void>;

  notes?: {
    transactionId?: string;
  };

  theme?: {
    color?: string;
  };

  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (
  options: RazorpayOptions
) => RazorpayInstance;

export default function AddMoneyPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function chooseAmount(value: number) {
    setAmount(String(value));
    setError("");
    setMessage("");
  }

  async function handleAddMoney(event: FormEvent) {
    event.preventDefault();

    setError("");
    setMessage("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      setError("Valid amount डालें।");
      return;
    }

    if (numericAmount < 10) {
      setError("Minimum Add Money amount ₹10 है।");
      return;
    }

    if (numericAmount > 100000) {
      setError("Maximum Add Money amount ₹1,00,000 है।");
      return;
    }

    const RazorpayCheckout = (
      window as typeof window & {
        Razorpay?: RazorpayConstructor;
      }
    ).Razorpay;

    if (!RazorpayCheckout) {
      setError(
        "Razorpay Checkout load नहीं हुआ। Page refresh करके दोबारा try करें।"
      );
      return;
    }

    try {
      setLoading(true);

      const orderResponse = await fetch(
        "/api/wallet/add-money/order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: numericAmount,
          }),
        }
      );

      const orderData: OrderResponse =
        await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        setError(
          orderData.message ||
            "Wallet Add Money order create नहीं हो सका।"
        );
        setLoading(false);
        return;
      }

      if (
        !orderData.keyId ||
        !orderData.order ||
        !orderData.transaction
      ) {
        setError("Payment order response incomplete है।");
        setLoading(false);
        return;
      }

      const internalTransactionId =
        orderData.transaction.transactionId;

      const razorpay = new RazorpayCheckout({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "RY MULTI SERVICE",
        description: "Wallet Add Money",
        order_id: orderData.order.id,

        notes: {
          transactionId: internalTransactionId,
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Payment window बंद कर दी गई।");
          },
        },

        handler: async (
          response: RazorpaySuccessResponse
        ) => {
          try {
            setMessage("Payment verify हो रहा है...");
            setError("");

            const verifyResponse = await fetch(
              "/api/wallet/add-money/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transactionId: internalTransactionId,
                  razorpay_order_id:
                    response.razorpay_order_id,
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const verifyData: VerifyResponse =
              await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyData.success
            ) {
              setMessage("");
              setError(
                verifyData.message ||
                  "Payment verify नहीं हो सका।"
              );
              return;
            }

            setMessage(
              `₹${numericAmount.toLocaleString(
                "en-IN"
              )} wallet में successfully add हो गया।`
            );

            setTimeout(() => {
              router.push("/wallet");
              router.refresh();
            }, 1200);
          } catch (verifyError) {
            console.error(
              "WALLET VERIFY ERROR:",
              verifyError
            );

            setMessage("");
            setError(
              "Payment verification service से connection नहीं हो पाया।"
            );
          } finally {
            setLoading(false);
          }
        },
      });

      razorpay.open();
    } catch (paymentError) {
      console.error(
        "WALLET ADD MONEY ERROR:",
        paymentError
      );

      setError(
        "Payment service से connection नहीं हो पाया।"
      );

      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-gray-100">
        <header className="bg-white px-6 py-4 shadow-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <Link
              href="/wallet"
              className="text-gray-600 hover:text-blue-600"
            >
              Wallet
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              ➕ Add Money
            </h2>

            <p className="mt-2 text-gray-600">
              Razorpay के माध्यम से अपने RY Multi Service wallet में money add करें।
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <form onSubmit={handleAddMoney}>
              <label
                htmlFor="wallet-amount"
                className="block text-sm font-semibold text-gray-700"
              >
                Amount
              </label>

              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-600">
                  ₹
                </span>

                <input
                  id="wallet-amount"
                  type="number"
                  min="10"
                  max="100000"
                  step="0.01"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Minimum ₹10 • Maximum ₹1,00,000
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {[100, 500, 1000, 2000, 5000].map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => chooseAmount(value)}
                      className={`rounded-lg border px-4 py-2 font-semibold ${
                        Number(amount) === value
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      ₹{value.toLocaleString("en-IN")}
                    </button>
                  )
                )}
              </div>

              {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading
                  ? "Processing..."
                  : `Add ₹${Number(
                      amount || 0
                    ).toLocaleString(
                      "en-IN"
                    )} to Wallet`}
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-bold text-blue-800">
              🔒 Secure Wallet Credit
            </h3>

            <p className="mt-2 text-sm text-blue-700">
              Payment successful दिखने मात्र से wallet balance नहीं बढ़ेगा।
              Server Razorpay signature verify करने के बाद ही wallet credit करेगा।
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/wallet"
              className="inline-block rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white hover:bg-gray-900"
            >
              ← Wallet पर वापस जाएँ
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}