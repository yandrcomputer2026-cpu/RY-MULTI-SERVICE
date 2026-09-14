"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AepsWithdrawPage() {
  const router = useRouter();

  const [bank, setBank] = useState("");
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanMobile = mobile.replace(/\D/g, "");
    const cleanAmount = Number(amount);

    if (!bank) {
      setMessage("कृपया Bank चुनें।");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setMessage("कृपया सही 10 अंकों का Mobile Number डालें।");
      return;
    }

    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      setMessage("कृपया सही Withdrawal Amount डालें।");
      return;
    }

    if (!consent) {
      setMessage("AEPS service के लिए consent देना जरूरी है।");
      return;
    }

    setMessage(
      "AEPS provider अभी configure नहीं है। Details validation successful है, लेकिन कोई transaction process नहीं किया गया।"
    );
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
              AEPS Banking
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/banking")}
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Banking
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="text-5xl">💵</div>

            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
              AEPS Cash Withdrawal
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Aadhaar Enabled Payment System
            </p>
          </div>

          {/* ================= SETUP NOTICE ================= */}
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-bold text-amber-900">
              AEPS Provider Setup Required
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              अभी यह service setup mode में है। Authorized AEPS provider,
              biometric device और secure authentication flow connect होने के
              बाद ही real withdrawal enable होगा।
            </p>
          </div>

          {/* ================= PRIVACY NOTICE ================= */}
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="font-bold text-blue-900">
              Aadhaar Data अभी Collect नहीं किया जा रहा
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              Provider integration complete होने तक इस page पर Aadhaar Number,
              fingerprint या biometric data collect या store नहीं किया जाएगा।
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-800">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            {/* ================= BANK ================= */}
            <div>
              <label
                htmlFor="bank"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Bank
              </label>

              <select
                id="bank"
                value={bank}
                onChange={(event) => setBank(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bank चुनें</option>
                <option value="sbi">State Bank of India</option>
                <option value="pnb">Punjab National Bank</option>
                <option value="bob">Bank of Baroda</option>
                <option value="canara">Canara Bank</option>
                <option value="union">Union Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
              </select>
            </div>

            {/* ================= MOBILE ================= */}
            <div className="mt-6">
              <label
                htmlFor="mobile"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Customer Mobile Number
              </label>

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10 digit Mobile Number"
                maxLength={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ================= AMOUNT ================= */}
            <div className="mt-6">
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Withdrawal Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-600">
                  ₹
                </span>

                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                मैं समझता/समझती हूँ कि AEPS transaction केवल authorized
                provider और required biometric authentication के बाद ही
                process किया जा सकता है।
              </span>
            </label>

            <button
              type="submit"
              className="mt-8 w-full rounded-lg bg-emerald-600 py-4 font-bold text-white transition hover:bg-emerald-700"
            >
              Check Setup →
            </button>
          </form>

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