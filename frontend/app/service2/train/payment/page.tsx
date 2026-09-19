"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Passenger = {
  name: string;
  age: string;
  gender: string;
  berthPreference: string;
};

type TrainBookingData = {
  from: string;
  to: string;
  date: string;
  passengers: number;
  travelClass: string;
  trainNo: string;
  trainName: string;
  departure: string;
  arrival: string;
  duration: string;
  fare: number;
  totalFare: number;
  passengerList: Passenger[];
  contact: {
    mobile: string;
    email: string;
  };
  baseFare: number;
  convenienceFee: number;
  totalAmount: number;
};

type TravelHealth = {
  configured?: boolean;
  available?: boolean;
  status?: string;
  message?: string;
};

type TravelStatusResponse = {
  success?: boolean;
  message?: string;
  services?: {
    train?: TravelHealth;
  };
};

export default function TrainPaymentPage() {
  const router = useRouter();

  const [booking, setBooking] =
    useState<TrainBookingData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD BOOKING
  // ====================================================

  useEffect(() => {
    const storedBooking =
      sessionStorage.getItem("ryTrainBooking");

    if (!storedBooking) {
      router.replace("/service2/train");
      return;
    }

    try {
      const parsedBooking: TrainBookingData =
        JSON.parse(storedBooking);

      setBooking(parsedBooking);
    } catch {
      sessionStorage.removeItem("ryTrainBooking");
      router.replace("/service2/train");
    }
  }, [router]);

  // ====================================================
  // PROVIDER CHECK
  // ====================================================

  async function handleContinue() {
    if (!booking || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const statusResponse = await fetch(
        "/api/internal/travel/status",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const statusData: TravelStatusResponse =
        await statusResponse.json();

      if (!statusResponse.ok || !statusData.success) {
        setError(
          statusData.message ||
            "Train provider status check नहीं हो सका।"
        );
        return;
      }

      const trainStatus = statusData.services?.train;

      if (
        !trainStatus ||
        trainStatus.configured !== true ||
        trainStatus.available !== true ||
        trainStatus.status !== "ACTIVE"
      ) {
        setError(
          "Train booking provider अभी active नहीं है। इसलिए payment शुरू नहीं किया गया है।"
        );
        return;
      }

      // IMPORTANT:
      // Provider registry में ACTIVE होना अकेले पर्याप्त नहीं है.
      // Authorized provider booking workflow, server-side fare,
      // availability verification और booking confirmation
      // implement होने तक payment शुरू नहीं करना है.

      setError(
        "Train provider active है, लेकिन live train booking workflow अभी implement नहीं हुआ है। इसलिए payment शुरू नहीं किया गया है।"
      );
    } catch (error) {
      console.error("TRAIN PROVIDER CHECK ERROR:", error);

      setError(
        "Train provider status check में समस्या हुई। Payment शुरू नहीं किया गया है।"
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Train details load हो रही हैं...
        </p>
      </main>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            🚆 Train Booking Review
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Demo booking details जांचें। Payment केवल authorized
            Train provider और complete live booking workflow उपलब्ध
            होने के बाद शुरू होगा।
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            {booking.trainName}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Train No: {booking.trainNo}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">From</p>
              <p className="font-semibold text-gray-900">
                {booking.from}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">To</p>
              <p className="font-semibold text-gray-900">
                {booking.to}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">
                {booking.date}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Class</p>
              <p className="font-semibold text-gray-900">
                {booking.travelClass}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Demo Fare Summary
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Demo Base Fare
              </span>

              <span className="font-semibold text-gray-900">
                ₹{booking.baseFare}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Demo Convenience Fee
              </span>

              <span className="font-semibold text-gray-900">
                ₹{booking.convenienceFee}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-bold text-gray-900">
                Demo Total
              </span>

              <span className="text-3xl font-bold text-blue-600">
                ₹{booking.totalAmount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-800">
            Demo / Setup Mode
          </p>

          <p className="mt-1 text-sm text-amber-800">
            दिखाई गई train, availability और fare live railway
            inventory नहीं हैं। Authorized provider से actual
            availability और fare verify किए बिना payment या
            confirmed ticket जारी नहीं किया जाएगा।
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              Train Booking
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading
              ? "Provider Check हो रहा है..."
              : "Check Provider & Continue"}
          </button>
        </div>
      </div>
    </main>
  );
}