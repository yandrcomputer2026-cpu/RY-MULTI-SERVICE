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
};

export default function TrainFareSummaryPage() {
  const router = useRouter();

  const [booking, setBooking] = useState<TrainBookingData | null>(null);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem("ryTrainBooking");

    if (!storedBooking) {
      router.replace("/service2/train");
      return;
    }

    try {
      const parsedBooking: TrainBookingData = JSON.parse(storedBooking);
      setBooking(parsedBooking);
    } catch {
      sessionStorage.removeItem("ryTrainBooking");
      router.replace("/service2/train");
    }
  }, [router]);

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Booking details load हो रही हैं...
        </p>
      </main>
    );
  }

  const baseFare = booking.totalFare;
  const convenienceFee = booking.passengers * 25;
  const totalAmount = baseFare + convenienceFee;

  function handleProceedToPayment() {
    const finalBooking = {
      ...booking,
      baseFare,
      convenienceFee,
      totalAmount,
    };

    sessionStorage.setItem(
      "ryTrainBooking",
      JSON.stringify(finalBooking)
    );

    router.push("/service2/train/payment");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            💰 Fare Summary
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Payment से पहले अपनी booking details जांचें।
          </p>
        </div>

        {/* TRAIN DETAILS */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="border-b border-gray-200 pb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {booking.trainName}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Train No: {booking.trainNo}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Route</p>
              <p className="font-semibold text-gray-900">
                {booking.from} → {booking.to}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Journey Date</p>
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

            <div>
              <p className="text-xs text-gray-500">Passengers</p>
              <p className="font-semibold text-gray-900">
                {booking.passengers}
              </p>
            </div>
          </div>
        </div>

        {/* PASSENGER DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Passenger Details
          </h2>

          <div className="mt-5 space-y-4">
            {booking.passengerList.map((passenger, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 p-4"
              >
                <p className="font-bold text-gray-900">
                  Passenger {index + 1}: {passenger.name}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-medium text-gray-900">
                      {passenger.age}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900">
                      {passenger.gender}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Berth Preference
                    </p>
                    <p className="font-medium text-gray-900">
                      {passenger.berthPreference}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Contact Details
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Mobile Number</p>
              <p className="font-semibold text-gray-900">
                {booking.contact.mobile}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Email Address</p>
              <p className="font-semibold text-gray-900">
                {booking.contact.email}
              </p>
            </div>
          </div>
        </div>

        {/* FARE BREAKUP */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Fare Breakup
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Base Fare
              </span>

              <span className="font-semibold text-gray-900">
                ₹{baseFare}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Convenience Fee
              </span>

              <span className="font-semibold text-gray-900">
                ₹{convenienceFee}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-bold text-gray-900">
                Total Payable
              </span>

              <span className="text-3xl font-bold text-blue-600">
                ₹{totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            अभी fare और convenience fee demo booking flow के लिए हैं।
            Real Train API जुड़ने के बाद actual fare, taxes और availability
            provider से आएँगे।
          </p>
        </div>

        {/* BUTTONS */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            onClick={handleProceedToPayment}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Proceed to Payment →
          </button>
        </div>
      </div>
    </main>
  );
}