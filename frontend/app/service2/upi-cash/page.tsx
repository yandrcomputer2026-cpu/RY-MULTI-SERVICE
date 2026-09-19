"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function UpiCashPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setMessage("");

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    setMessage("कृपया सही Payment Amount डालें।");
    return;
  }

  if (!consent) {
    setMessage(
      "UPI Cash setup check के लिए consent देना जरूरी है।",
    );
    return;
  }

  try {
    const response = await fetch(
      "/api/internal/banking/status",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      setMessage(
        data.message ||
          "Banking provider status check नहीं हो पाया।",
      );
      return;
    }

    const upiCashProvider =
      data.services?.upiCash;

    const providerReady =
      upiCashProvider?.success === true &&
      upiCashProvider?.data?.configured === true &&
      upiCashProvider?.data?.available === true &&
      upiCashProvider?.data?.status === "ACTIVE";

    if (!providerReady) {
      setMessage(
        "UPI Cash provider अभी active नहीं है। इसलिए कोई QR या payment request generate नहीं की गई है।",
      );
      return;
    }

    setMessage(
      "UPI Cash provider active है, लेकिन live verified QR/payment workflow अभी implement नहीं किया गया है। कोई payment request generate नहीं की गई।",
    );
  } catch (error) {
    console.error(
      "UPI CASH STATUS ERROR:",
      error,
    );

    setMessage(
      "Banking provider status check नहीं हो पाया। कृपया बाद में दोबारा कोशिश करें।",
    );
  }
}

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-extrabold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <p className="text-xs font-medium text-gray-400">
              Banking Services
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          {/* ================= TITLE ================= */}
          <div className="text-center">
            <div className="text-5xl">📲</div>

            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
              UPI Cash
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Verified UPI payment flow
            </p>
          </div>

          {/* ================= PROVIDER NOTICE ================= */}
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-bold text-amber-900">
              UPI Payment Provider Setup Required
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Real merchant UPI configuration और server-side payment
              verification connect होने के बाद ही payment QR enable किया जाएगा।
            </p>
          </div>

          {/* ================= SECURITY NOTICE ================= */}
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="font-bold text-blue-900">
              Placeholder UPI QR Disabled
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              किसी temporary या unverified UPI ID से payment QR generate नहीं
              किया जा रहा। केवल authorized merchant/payment provider से
              verified payment flow enable किया जाएगा।
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-800">
              {message}
            </div>
          )}

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="mt-8">
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Payment Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-600">
                  ₹
                </span>

                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                यह केवल setup validation के लिए है। कोई QR या payment request
                generate नहीं होगी।
              </p>
            </div>

            {/* ================= CONSENT ================= */}
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4"
              />

              <span className="text-sm leading-6 text-gray-600">
                मैं समझता/समझती हूँ कि UPI Cash service अभी setup mode में है
                और authorized payment provider verification के बिना कोई real
                payment process नहीं होगा।
              </span>
            </label>

            <button
              type="submit"
              className="mt-8 w-full rounded-lg bg-purple-600 py-4 font-bold text-white transition hover:bg-purple-700"
            >
              Check Setup →
            </button>
          </form>

          {/* ================= BACK ================= */}
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-3 w-full rounded-lg bg-gray-200 py-3 font-semibold text-gray-800 hover:bg-gray-300"
          >
            ← Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}