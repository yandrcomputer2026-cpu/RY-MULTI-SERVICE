"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Passenger = {
  name: string;
  age: string;
  gender: string;
  berthPreference: string;
};

type ConfirmedBooking = {
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
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  bookingId?: string;
  status?: string;
};

export default function TrainConfirmationPage() {
  const router = useRouter();

  const [booking, setBooking] = useState<ConfirmedBooking | null>(null);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem("ryTrainBooking");

    if (!storedBooking) {
      router.replace("/service2/train");
      return;
    }

    try {
      const parsedBooking: ConfirmedBooking = JSON.parse(storedBooking);

      if (parsedBooking.status !== "CONFIRMED") {
        router.replace("/service2/train");
        return;
      }

      setBooking(parsedBooking);
    } catch {
      sessionStorage.removeItem("ryTrainBooking");
      router.replace("/service2/train");
    }
  }, [router]);

  function handlePrint() {
    window.print();
  }

  function handleNewBooking() {
    sessionStorage.removeItem("ryTrainBooking");
    router.push("/service2/train");
  }

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Booking confirmation load हो रही है...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            🎫 Train Booking Confirmed
          </h1>

          <p className="mt-2 text-sm text-green-600">
            आपका payment सफल हो गया है और booking confirm हो गई है।
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-xl font-bold text-green-800">
            Booking Successful ✅
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-green-700">
                Booking ID
              </p>

              <p className="font-bold text-green-900">
                {booking.bookingId || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-green-700">
                Payment ID
              </p>

              <p className="break-all font-bold text-green-900">
                {booking.razorpayPaymentId || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Train Details
          </h2>

          <div className="mt-5 border-b border-gray-200 pb-5">
            <p className="text-lg font-bold text-gray-900">
              {booking.trainName}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Train No: {booking.trainNo}
            </p>
          </div>

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
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Departure</p>
              <p className="font-semibold text-gray-900">
                {booking.departure}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Arrival</p>
              <p className="font-semibold text-gray-900">
                {booking.arrival}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-semibold text-gray-900">
                {booking.duration}
              </p>
            </div>
          </div>
        </div>

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

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Fare Details
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Base Fare
              </span>

              <span className="font-semibold text-gray-900">
                ₹{booking.baseFare}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Convenience Fee
              </span>

              <span className="font-semibold text-gray-900">
                ₹{booking.convenienceFee}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-bold text-gray-900">
                Total Paid
              </span>

              <span className="text-3xl font-bold text-green-600">
                ₹{booking.totalAmount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            🖨️ Print Confirmation
          </button>

          <button
            type="button"
            onClick={handleNewBooking}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Book Another Train →
          </button>
        </div>
      </div>
    </main>
  );
}