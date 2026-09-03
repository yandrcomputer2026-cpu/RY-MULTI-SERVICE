import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type HotelDescription = {
  bookingType?: string;

  hotel?: {
    hotelId?: string;
    hotelName?: string;
    city?: string;
    location?: string;
  };

  room?: {
    roomId?: string;
    roomType?: string;
    mealPlan?: string;
    refundable?: boolean;
    maxGuests?: number;
  };

  stay?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    nights?: number;
  };

  guest?: {
    name?: string;
    age?: number;
    gender?: string;
    mobile?: string;
  };

  payment?: {
    pricePerNight?: number;
    roomFare?: number;
    convenienceFee?: number;
    totalAmount?: number;
    currency?: string;
  };

  provider?: {
    mode?: string;
    confirmationId?: string | null;
    bookingStatus?: string;
  };
};

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

export default async function HotelTicketPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { transactionId } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: {
      transactionId,
      userId: user.id,
      service: "HOTEL_BOOKING",
    },
  });

  if (!transaction) {
    notFound();
  }

  let details: HotelDescription = {};

  try {
    if (transaction.description) {
      details = JSON.parse(
        transaction.description
      ) as HotelDescription;
    }
  } catch (error) {
    console.error(
      "HOTEL DESCRIPTION PARSE ERROR:",
      error
    );
  }

  const hotel = details.hotel ?? {};
  const room = details.room ?? {};
  const stay = details.stay ?? {};
  const guest = details.guest ?? {};
  const payment = details.payment ?? {};

  const totalAmount = Number(
    payment.totalAmount ??
      transaction.amount
  );

  const roomFare = Number(
    payment.roomFare ?? 0
  );

  const convenienceFee = Number(
    payment.convenienceFee ?? 0
  );

  const pricePerNight = Number(
    payment.pricePerNight ?? 0
  );

  const currency =
    payment.currency || "INR";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            🏨 Hotel Booking
          </h1>

          <p className="mt-2 text-sm text-green-600">
            आपकी confirmed hotel booking details
          </p>
        </div>

        {/* SUCCESS */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-xl font-bold text-green-800">
            Booking {transaction.status} ✅
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs text-green-700">
                Booking ID
              </p>

              <p className="mt-1 break-all font-bold text-green-900">
                {transaction.transactionId}
              </p>
            </div>

            <div>
              <p className="text-xs text-green-700">
                Reference ID
              </p>

              <p className="mt-1 break-all font-bold text-green-900">
                {transaction.referenceId || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* HOTEL DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Hotel Details
          </h2>

          <div className="mt-5 border-b border-gray-200 pb-5">
            <p className="text-lg font-bold text-gray-900">
              {hotel.hotelName || "Hotel Booking"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Hotel ID: {hotel.hotelId || "-"}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">
                City
              </p>

              <p className="font-semibold text-gray-900">
                {hotel.city || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Location
              </p>

              <p className="font-semibold text-gray-900">
                {hotel.location || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Check-in
              </p>

              <p className="font-semibold text-gray-900">
                {stay.checkIn || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Check-out
              </p>

              <p className="font-semibold text-gray-900">
                {stay.checkOut || "-"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">
                Nights
              </p>

              <p className="font-semibold text-gray-900">
                {stay.nights ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Rooms
              </p>

              <p className="font-semibold text-gray-900">
                {stay.rooms ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Guests
              </p>

              <p className="font-semibold text-gray-900">
                {stay.guests ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Room Type
              </p>

              <p className="font-semibold text-gray-900">
                {room.roomType || "-"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">
                Meal Plan
              </p>

              <p className="font-semibold text-gray-900">
                {room.mealPlan || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Refundable
              </p>

              <p className="font-semibold text-gray-900">
                {room.refundable === true
                  ? "Yes"
                  : room.refundable === false
                  ? "No"
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Max Guests
              </p>

              <p className="font-semibold text-gray-900">
                {room.maxGuests ?? "-"}
              </p>
            </div>
          </div>
        </div>

        {/* GUEST DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Guest Details
          </h2>

          {guest.name ? (
            <div className="mt-5 rounded-xl border border-gray-200 p-4">
              <p className="font-bold text-gray-900">
                Guest: {guest.name}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">
                    Age
                  </p>

                  <p className="font-medium text-gray-900">
                    {guest.age ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Gender
                  </p>

                  <p className="font-medium text-gray-900">
                    {guest.gender || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Mobile
                  </p>

                  <p className="font-medium text-gray-900">
                    {guest.mobile || "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Guest details उपलब्ध नहीं हैं।
            </p>
          )}
        </div>

        {/* FARE DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Fare Details
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Price Per Night
              </span>

              <span className="font-semibold text-gray-900">
                ₹{pricePerNight}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-600">
                Room Fare
              </span>

              <span className="font-semibold text-gray-900">
                ₹{roomFare}
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
                Total Paid
              </span>

              <span className="text-3xl font-bold text-green-600">
                ₹{totalAmount}
              </span>
            </div>

            <p className="text-right text-xs text-gray-500">
              Currency: {currency}
            </p>
          </div>
        </div>

        {/* BOOKING INFO */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900">
            Booking Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                Provider
              </p>

              <p className="font-semibold text-gray-900">
                {transaction.provider || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Booking Date
              </p>

              <p className="font-semibold text-gray-900">
                {transaction.createdAt.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/history"
            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← My History
          </Link>

          <Link
            href="/service2/hotel"
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            Book Another Hotel →
          </Link>
        </div>

      </div>
    </main>
  );
}