"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSuccess("");
    setLoading(true);

    // फिलहाल demo submission
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSuccess(
      "आपकी support request प्राप्त हो गई है। हमारी team जल्द आपसे संपर्क करेगी।"
    );

    setSubject("");
    setMessage("");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <div className="flex items-center gap-6">

            <Link
              href="/service3"
              className="text-gray-600 hover:text-blue-600"
            >
              Account
            </Link>

            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

          </div>
        </div>
      </header>


      {/* ================= CONTENT ================= */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          Help / Support 🆘
        </h2>

        <p className="text-gray-600 mt-2">
          किसी भी समस्या के लिए हमारी support team से संपर्क करें।
        </p>


        <div className="grid md:grid-cols-3 gap-6 mt-8">

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow p-6">

            <div className="text-4xl">
              📞
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-4">
              Customer Support
            </h3>

            <p className="text-gray-500 mt-2">
              किसी भी payment, recharge या account समस्या के लिए
              support से संपर्क करें।
            </p>

            <div className="mt-5 space-y-3 text-gray-700">

              <p>
                <span className="font-semibold">
                  Phone:
                </span>{" "}
                Support Number
              </p>

              <p>
                <span className="font-semibold">
                  Email:
                </span>{" "}
                support@rymultiservice.com
              </p>

              <p>
                <span className="font-semibold">
                  Timing:
                </span>{" "}
                9:00 AM – 6:00 PM
              </p>

            </div>

          </div>


          {/* Support Form */}
          <div className="md:col-span-2 bg-white rounded-xl shadow p-6">

            <h3 className="text-2xl font-bold text-gray-900">
              Create Support Request
            </h3>

            <p className="text-gray-500 mt-2">
              अपनी समस्या की जानकारी नीचे भरें।
            </p>


            <form onSubmit={handleSubmit} className="mt-6">

              {/* Subject */}
              <div>

                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Problem Type
                </label>

                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >

                  <option value="">
                    Problem select करें
                  </option>

                  <option value="recharge">
                    Recharge Problem
                  </option>

                  <option value="bill-payment">
                    Bill Payment Problem
                  </option>

                  <option value="aeps">
                    AEPS Problem
                  </option>

                  <option value="travel">
                    Travel / Booking Problem
                  </option>

                  <option value="account">
                    Account Problem
                  </option>

                  <option value="other">
                    Other Problem
                  </option>

                </select>

              </div>


              {/* Message */}
              <div className="mt-5">

                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Problem Details
                </label>

                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="अपनी समस्या विस्तार से लिखें..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>


              {/* Success Message */}
              {success && (
                <div className="mt-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
                  {success}
                </div>
              )}


              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Support Request"}
              </button>

            </form>

          </div>

        </div>


        {/* FAQ */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h3 className="text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h3>

          <div className="mt-5 space-y-4">

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">
                Recharge successful नहीं हुआ तो क्या करें?
              </h4>

              <p className="text-gray-500 mt-2">
                Payment History में transaction status check करें और
                जरूरत होने पर support request submit करें।
              </p>
            </div>


            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">
                Payment कट गया लेकिन service नहीं मिली?
              </h4>

              <p className="text-gray-500 mt-2">
                Transaction details सुरक्षित रखें और support team को
                transaction information दें।
              </p>
            </div>


            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">
                Password भूल गए हैं?
              </h4>

              <p className="text-gray-500 mt-2">
                Login page से Forgot Password option का उपयोग करें।
              </p>
            </div>

          </div>

        </div>


        {/* Back */}
        <div className="mt-8">

          <Link
            href="/service3"
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Account पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}