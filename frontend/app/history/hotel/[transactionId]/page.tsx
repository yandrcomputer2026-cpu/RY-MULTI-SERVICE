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

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function getTransactionStatusClasses(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "SUCCESS") {
    return {
      wrapper: "border-green-200 bg-green-50",
      heading: "text-green-800",
      text: "text-green-700",
      value: "text-green-900",
    };
  }

  if (
    normalizedStatus === "FAILED" ||
    normalizedStatus === "CANCELLED"
  ) {
    return {
      wrapper: "border-red-200 bg-red-50",
      heading: "text-red-800",
      text: "text-red-700",
      value: "text-red-900",
    };
  }

  return {
    wrapper: "border-yellow-200 bg-yellow-50",
    heading: "text-yellow-800",
    text: "text-yellow-700",
    value: "text-yellow-900",
  };
}

export default async function HotelTicketPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { transactionId } = await params;

  const transaction =
    await prisma.transaction.findFirst({
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

  const transactionAmount =
    Number(transaction.amount);

  const totalAmount = Number(
    payment.totalAmount ??
      (Number.isFinite(transactionAmount)
        ? transactionAmount
        : 0)
  );

  const roomFare =
    Number(payment.roomFare ?? 0);

  const convenienceFee =
    Number(payment.convenienceFee ?? 0);

  const pricePerNight =
    Number(payment.pricePerNight ?? 0);

  const currency =
    payment.currency || "INR";

  const status = String(
    transaction.status || "PENDING"
  ).toUpperCase();

  const statusClasses =
    getTransactionStatusClasses(status);

  const paymentReference =
    transaction.razorpayPaymentId ||
    transaction.referenceId ||
    "-";

  const hasPaymentReference =
    paymentReference !== "-";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            🏨 Hotel Booking Details
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Transaction और stay details
          </p>
        </div>

        {/* TRANSACTION STATUS */}
        <div
          className={`rounded-2xl border p-6 ${statusClasses.wrapper}`}
        >
          <h2
            className={`text-xl font-bold ${statusClasses.heading}`}
          >
            Transaction Status:{" "}
            {formatStatus(status)}
          </h2>

          <p
            className={`mt-2 text-sm ${statusClasses.text}`}
          >
            यह status transaction record को
            दर्शाता है। इसे confirmed hotel
            reservation का प्रमाण न मानें।
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p
                className={`text-xs ${statusClasses.text}`}
              >
                Transaction ID
              </p>

              <p
                className={`mt-1 break-all font-bold ${statusClasses.value}`}
              >
                {transaction.transactionId}
              </p>
            </div>

            <div>
              <p
                className={`text-xs ${statusClasses.text}`}
              >
                Payment / Reference ID
              </p>

              <p
                className={`mt-1 break-all font-bold ${statusClasses.value}`}
              >
                {paymentReference}
              </p>
            </div>
          </div>
        </div>

        {/* BOOKING CONFIRMATION */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-800">
            ⚠️ Booking Confirmation
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            इस record में verified hotel /
            travel-provider booking confirmation
            उपलब्ध नहीं है। इसलिए यह page केवल
            booking request / transaction details
            दिखाता है, confirmed hotel reservation
            नहीं।
          </p>
        </div>

        {/* HOTEL DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Hotel Details
          </h2>

          <div className="mt-5 border-b border-gray-200 pb-5">
            <p className="text-lg font-bold text-gray-900">
              {hotel.hotelName ||
                "Hotel Booking"}
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

        {/* AMOUNT DETAILS */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Amount Details
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
                Transaction Amount
              </span>

              <span className="text-3xl font-bold text-blue-600">
                ₹{totalAmount}
              </span>
            </div>

            <p className="text-right text-xs text-gray-500">
              Currency: {currency}
            </p>

            <p className="text-xs leading-5 text-gray-500">
              {hasPaymentReference
                ? "Payment/reference information इस transaction में मौजूद है, लेकिन hotel booking confirmation अलग provider verification पर निर्भर करती है।"
                : "Payment/reference ID उपलब्ध नहीं है। यह amount केवल transaction record में दर्ज amount है।"}
            </p>
          </div>
        </div>

        {/* TRANSACTION INFORMATION */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900">
            Transaction Information
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
                Transaction Date
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
            Search Hotels →
          </Link>
        </div>
      </div>
    </main>
  );
}