"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function MoneyTransferPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanMobile = mobile.replace(/\D/g, "");
    const cleanAmount = Number(amount);

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setMessage("कृपया सही 10 अंकों का Mobile Number डालें।");
      return;
    }

    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      setMessage("कृपया सही Transfer Amount डालें।");
      return;
    }

    if (!consent) {
      setMessage("Money Transfer setup check के लिए consent देना जरूरी है।");
      return;
    }

    setMessage(
      "Money Transfer provider अभी configure नहीं है। Details validation successful है, लेकिन कोई fund transfer process नहीं किया गया।"
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
              Banking Services
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
          {/* ================= TITLE ================= */}
          <div className="text-center">
            <div className="text-5xl">💸</div>

            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
              Money Transfer
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Domestic Money Transfer (DMT)
            </p>
          </div>

          {/* ================= PROVIDER NOTICE ================= */}
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-bold text-amber-900">
              DMT Provider Setup Required
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Authorized Money Transfer provider integration complete होने
              के बाद beneficiary verification और real fund transfer enable
              किया जाएगा।
            </p>
          </div>

          {/* ================= PRIVACY NOTICE ================= */}
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="font-bold text-blue-900">
              Bank Account Details अभी Collect नहीं की जा रही हैं
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              Provider integration complete होने तक beneficiary account
              number, IFSC या दूसरी banking credentials इस setup page पर
              collect या store नहीं की जाएँगी।
            </p>
          </div>

          {/* ================= MESSAGE ================= */}
          {message && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-800">
              {message}
            </div>
          )}

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="mt-8">
            <div>
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

            <div className="mt-6">
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Transfer Amount
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

              <p className="mt-2 text-xs text-gray-500">
                यह केवल setup validation के लिए है। कोई पैसा transfer नहीं होगा।
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
                मैं समझता/समझती हूँ कि अभी Money Transfer service setup mode
                में है और authorized provider activation के बिना कोई real
                fund transfer process नहीं होगा।
              </span>
            </label>

            <button
              type="submit"
              className="mt-8 w-full rounded-lg bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700"
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