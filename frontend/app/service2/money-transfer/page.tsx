"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function MoneyTransferPage() {
  const router = useRouter();

  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanName = beneficiaryName.trim();
    const cleanAccount = accountNumber.replace(/\s/g, "");
    const cleanConfirmAccount = confirmAccountNumber.replace(/\s/g, "");
    const cleanIfsc = ifsc.trim().toUpperCase();
    const cleanMobile = mobile.replace(/\D/g, "");
    const cleanAmount = Number(amount);

    if (!cleanName) {
      setError("कृपया Beneficiary Name डालें।");
      return;
    }

    if (!/^\d{6,20}$/.test(cleanAccount)) {
      setError("कृपया सही Bank Account Number डालें।");
      return;
    }

    if (cleanAccount !== cleanConfirmAccount) {
      setError("Account Number match नहीं कर रहा है।");
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setError("कृपया सही IFSC Code डालें।");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("कृपया सही 10 अंकों का Mobile Number डालें।");
      return;
    }

    if (!Number.isFinite(cleanAmount) || cleanAmount < 1) {
      setError("कृपया सही Transfer Amount डालें।");
      return;
    }

    /*
      IMPORTANT:
      अभी यहाँ कोई real Money Transfer API call नहीं होगी।

      Actual transfer authorized provider integration के बाद होगा।
      Account details को URL/query string में कभी नहीं भेजना है।
    */

    setMessage(
      "Form validation successful है। Actual Money Transfer authorized provider integration के बाद उपलब्ध होगा।"
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
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
            <div className="text-5xl">💸</div>

            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Money Transfer
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Bank account में money transfer करें
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-semibold text-yellow-800">
              Money Transfer Provider Required
            </p>

            <p className="mt-1 text-sm text-yellow-700">
              अभी यह page setup mode में है। Actual fund transfer authorized
              provider integration के बाद enable होगा।
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            <div>
              <label
                htmlFor="beneficiaryName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Beneficiary Name
              </label>

              <input
                id="beneficiaryName"
                type="text"
                value={beneficiaryName}
                onChange={(event) => setBeneficiaryName(event.target.value)}
                placeholder="Account holder name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="accountNumber"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Account Number
              </label>

              <input
                id="accountNumber"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={accountNumber}
                onChange={(event) =>
                  setAccountNumber(
                    event.target.value.replace(/\D/g, "").slice(0, 20)
                  )
                }
                placeholder="Bank Account Number"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="confirmAccountNumber"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirm Account Number
              </label>

              <input
                id="confirmAccountNumber"
                type="text"
                inputMode="numeric"
                value={confirmAccountNumber}
                onChange={(event) =>
                  setConfirmAccountNumber(
                    event.target.value.replace(/\D/g, "").slice(0, 20)
                  )
                }
                placeholder="Account Number दोबारा डालें"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="ifsc"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                IFSC Code
              </label>

              <input
                id="ifsc"
                type="text"
                value={ifsc}
                onChange={(event) =>
                  setIfsc(event.target.value.toUpperCase().slice(0, 11))
                }
                placeholder="Example: SBIN0001234"
                maxLength={11}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-lg bg-blue-600 py-4 font-bold text-white hover:bg-blue-700"
            >
              Continue to Money Transfer →
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