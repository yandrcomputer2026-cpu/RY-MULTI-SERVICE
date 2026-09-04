"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AepsWithdrawPage() {
  const router = useRouter();

  const [bank, setBank] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanAadhaar = aadhaar.replace(/\D/g, "");
    const cleanMobile = mobile.replace(/\D/g, "");
    const cleanAmount = Number(amount);

    if (!bank) {
      setError("कृपया Bank चुनें।");
      return;
    }

    if (!/^\d{12}$/.test(cleanAadhaar)) {
      setError("कृपया 12 अंकों का सही Aadhaar Number डालें।");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("कृपया सही 10 अंकों का Mobile Number डालें।");
      return;
    }

    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      setError("कृपया सही Withdrawal Amount डालें।");
      return;
    }

    if (!consent) {
      setError("AEPS transaction के लिए consent देना जरूरी है।");
      return;
    }

    /*
      IMPORTANT:
      अभी यहाँ कोई AEPS API call नहीं होगी।

      अगले चरण में authorized AEPS provider मिलने के बाद
      backend endpoint बनाया जाएगा।

      Aadhaar Number को URL/query string में कभी नहीं भेजना है।
    */

    setError(
      "AEPS provider अभी configure नहीं है। Form validation successful है।"
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <button
            type="button"
            onClick={() => router.push("/service2")}
            className="text-gray-600 hover:text-blue-600"
          >
            Service 2
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow">
          <div className="text-center">
            <div className="text-5xl">💵</div>

            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              AEPS Cash Withdrawal
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Aadhaar Enabled Payment System
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-semibold text-yellow-800">
              AEPS Provider Required
            </p>

            <p className="mt-1 text-sm text-yellow-700">
              अभी यह page setup mode में है। Actual withdrawal authorized
              AEPS provider integration के बाद enable होगा।
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            {/* BANK */}
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
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* AADHAAR */}
            <div className="mt-6">
              <label
                htmlFor="aadhaar"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Aadhaar Number
              </label>

              <input
                id="aadhaar"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={aadhaar}
                onChange={(event) =>
                  setAadhaar(
                    event.target.value.replace(/\D/g, "").slice(0, 12)
                  )
                }
                placeholder="12 digit Aadhaar Number"
                maxLength={12}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                सुरक्षा के लिए Aadhaar Number masked रखा गया है।
              </p>
            </div>

            {/* MOBILE */}
            <div className="mt-6">
              <label
                htmlFor="mobile"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Mobile Number
              </label>

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10 digit Mobile Number"
                maxLength={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* AMOUNT */}
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
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* CONSENT */}
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4"
              />

              <span className="text-sm text-gray-600">
                मैं इस AEPS transaction के लिए अपनी सहमति देता/देती हूँ और
                समझता/समझती हूँ कि actual transaction के लिए biometric
                authentication आवश्यक हो सकती है।
              </span>
            </label>

            <button
              type="submit"
              className="mt-8 w-full rounded-lg bg-green-600 py-4 font-bold text-white hover:bg-green-700"
            >
              Continue to AEPS →
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/service2")}
            className="mt-3 w-full rounded-lg bg-gray-200 py-3 font-semibold text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}