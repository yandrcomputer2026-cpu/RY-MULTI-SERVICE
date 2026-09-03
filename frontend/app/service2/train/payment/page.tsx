"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export default function TrainPaymentPage() {
  const router = useRouter();

  const [booking, setBooking] = useState<TrainBookingData | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handlePayment() {
    if (!booking) return;

    try {
      setLoading(true);

      const response = await fetch("/api/train/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: booking.totalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Payment order create नहीं हो पाया।");
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "RY MULTI SERVICE",
        description: `Train Booking - ${booking.trainName}`,
        order_id: data.orderId,

        prefill: {
          email: booking.contact.email,
          contact: booking.contact.mobile,
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          const verifyResponse = await fetch("/api/train/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              booking,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok) {
            alert(
              verifyData.message ||
                "Payment verify नहीं हो पाया।"
            );
            return;
          }

          const confirmedBooking = {
            ...booking,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            bookingId: verifyData.bookingId,
            status: "CONFIRMED",
          };

          sessionStorage.setItem(
            "ryTrainBooking",
            JSON.stringify(confirmedBooking)
          );

          router.push("/service2/train/confirmation");
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function () {
        alert("Payment failed हो गया। कृपया दोबारा कोशिश करें।");
      });

      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Payment शुरू करने में error आया।");
    } finally {
      setLoading(false);
    }
  }

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Payment details load हो रही हैं...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            💳 Train Payment
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            अपनी booking details जांचें और सुरक्षित payment करें।
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
              <p className="text-xs text-gray-500">
                From
              </p>

              <p className="font-semibold text-gray-900">
                {booking.from}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                To
              </p>

              <p className="font-semibold text-gray-900">
                {booking.to}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Date
              </p>

              <p className="font-semibold text-gray-900">
                {booking.date}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Class
              </p>

              <p className="font-semibold text-gray-900">
                {booking.travelClass}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Payment Summary
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
                Amount Payable
              </span>

              <span className="text-3xl font-bold text-blue-600">
                ₹{booking.totalAmount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Payment Razorpay के secure checkout से process होगा।
          </p>
        </div>

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
            onClick={handlePayment}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading
              ? "Payment शुरू हो रहा है..."
              : `Pay ₹${booking.totalAmount}`}
          </button>
        </div>
      </div>
    </main>
  );
}