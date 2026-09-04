"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default function UpiCashPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [error, setError] = useState("");

  function generateQr(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setQrValue("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 1) {
      setError("कृपया सही Payment Amount डालें।");
      return;
    }

    /*
      अभी testing/setup के लिए placeholder merchant UPI ID है।

      Production में इसे authorized payment provider /
      merchant configuration से लेना है।
    */
    const merchantUpiId = "merchant@upi";
    const merchantName = "RY MULTI SERVICE";

    const upiUrl =
      `upi://pay?pa=${encodeURIComponent(merchantUpiId)}` +
      `&pn=${encodeURIComponent(merchantName)}` +
      `&am=${numericAmount.toFixed(2)}` +
      `&cu=INR`;

    setQrValue(upiUrl);
  }

  function resetQr() {
    setQrValue("");
    setAmount("");
    setError("");
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
            <div className="text-5xl">📲</div>

            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              UPI Cash
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              QR Code scan करके UPI payment करें
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-semibold text-yellow-800">
              Setup / Test Mode
            </p>

            <p className="mt-1 text-sm text-yellow-700">
              अभी QR generation तैयार की जा रही है। Real payment confirmation
              authorized payment provider integration के बाद होगा।
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {!qrValue ? (
            <form onSubmit={generateQr} className="mt-8">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Payment Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-600">
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
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-8 w-full rounded-lg bg-purple-600 py-4 font-bold text-white hover:bg-purple-700"
              >
                Generate Payment QR →
              </button>
            </form>
          ) : (
            <div className="mt-8">
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                <p className="text-sm font-semibold text-gray-600">
                  Scan & Pay
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ₹{Number(amount).toFixed(2)}
                </p>

                <div className="mt-6 flex justify-center">
                  <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
                    <QRCodeSVG
                      value={qrValue}
                      size={240}
                      level="H"
                      includeMargin
                    />
                  </div>
                </div>

                <p className="mt-5 font-semibold text-gray-900">
                  किसी भी UPI App से QR Scan करें
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Google Pay • PhonePe • Paytm • BHIM
                </p>
              </div>

              <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="font-semibold text-blue-800">
                  Payment Verification
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  केवल QR scan करने पर transaction successful नहीं माना जाएगा।
                  Real payment provider confirmation मिलने के बाद ही SUCCESS
                  status किया जाएगा।
                </p>
              </div>

              <button
                type="button"
                onClick={resetQr}
                className="mt-6 w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-700"
              >
                Generate New QR
              </button>
            </div>
          )}

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