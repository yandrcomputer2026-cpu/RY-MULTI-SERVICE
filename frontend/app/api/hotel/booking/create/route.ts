import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  getHotelProvider,
  type HotelAvailabilityRequest,
} from "@/lib/hotel-api";

export const runtime = "nodejs";

type BookingBody = {
  hotelId?: unknown;
  hotelName?: unknown;
  city?: unknown;
  location?: unknown;

  roomId?: unknown;
  roomType?: unknown;
  mealPlan?: unknown;
  refundable?: unknown;

  checkIn?: unknown;
  checkOut?: unknown;

  guests?: unknown;
  rooms?: unknown;

  guestName?: unknown;
  guestAge?: unknown;
  guestGender?: unknown;
  guestMobile?: unknown;
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
}

function calculateNights(
  checkIn: string,
  checkOut: string
) {
  const start = new Date(
    `${checkIn}T00:00:00`
  );

  const end = new Date(
    `${checkOut}T00:00:00`
  );

  const difference =
    end.getTime() - start.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
}

export async function POST(
  request: Request
) {
  try {
    // ==================================================
    // LOGIN CHECK
    // ==================================================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // READ REQUEST
    // ==================================================

    let body: BookingBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
        },
        {
          status: 400,
        }
      );
    }

    const hotelId =
      String(body.hotelId ?? "").trim();

    const hotelName =
      String(body.hotelName ?? "").trim();

    const city =
      String(body.city ?? "").trim();

    const location =
      String(body.location ?? "").trim();

    const roomId =
      String(body.roomId ?? "").trim();

    const roomType =
      String(body.roomType ?? "").trim();

    const mealPlan =
      String(body.mealPlan ?? "").trim();

    const checkIn =
      String(body.checkIn ?? "").trim();

    const checkOut =
      String(body.checkOut ?? "").trim();

    const guests =
      Number(body.guests);

    const rooms =
      Number(body.rooms);

    const guestName =
      String(body.guestName ?? "").trim();

    const guestAge =
      Number(body.guestAge);

    const guestGender =
      String(body.guestGender ?? "").trim();

    const guestMobile =
      String(body.guestMobile ?? "").trim();

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!hotelId) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel ID is required.",
        },
        { status: 400 }
      );
    }

    if (!hotelName) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel name is required.",
        },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel city is required.",
        },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel location is required.",
        },
        { status: 400 }
      );
    }

    if (!roomId) {
      return NextResponse.json(
        {
          success: false,
          message: "Room ID is required.",
        },
        { status: 400 }
      );
    }

    if (!roomType) {
      return NextResponse.json(
        {
          success: false,
          message: "Room type is required.",
        },
        { status: 400 }
      );
    }

    if (!checkIn || !isValidDate(checkIn)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid check-in date is required.",
        },
        { status: 400 }
      );
    }

    if (!checkOut || !isValidDate(checkOut)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid check-out date is required.",
        },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Check-out date must be after check-in date.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > 20
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Guests must be between 1 and 20.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(rooms) ||
      rooms < 1 ||
      rooms > 10
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rooms must be between 1 and 10.",
        },
        { status: 400 }
      );
    }

    if (!guestName) {
      return NextResponse.json(
        {
          success: false,
          message: "Guest name is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(guestAge) ||
      guestAge < 1 ||
      guestAge > 120
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid guest age is required.",
        },
        { status: 400 }
      );
    }

    if (!guestGender) {
      return NextResponse.json(
        {
          success: false,
          message: "Guest gender is required.",
        },
        { status: 400 }
      );
    }

    if (
      !/^[0-9]{10}$/.test(
        guestMobile
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 10-digit guest mobile is required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // NIGHTS
    // ==================================================

    const nights = calculateNights(
      checkIn,
      checkOut
    );

    if (nights < 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking must be at least 1 night.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // HOTEL PROVIDER
    // ==================================================

    const provider =
      getHotelProvider();

    console.log(
      "HOTEL BOOKING PROVIDER:",
      provider.constructor.name
    );

    // ==================================================
    // SERVER-SIDE AVAILABILITY CHECK
    // ==================================================

    const availabilityRequest: HotelAvailabilityRequest = {
      hotelId,
      checkIn,
      checkOut,
      guests,
      rooms,
    };

    const availableRooms =
      await provider.getAvailability(
        availabilityRequest
      );

    // ==================================================
    // SELECTED ROOM VERIFY
    // ==================================================

    const selectedRoom =
      availableRooms.find(
        (room) =>
          room.roomId === roomId
      );

    if (!selectedRoom) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected room अभी available नहीं है। कृपया room दोबारा select करें।",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // ROOM TYPE VERIFY
    // ==================================================

    if (
      selectedRoom.roomType !==
      roomType
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected room details बदल गई हैं। कृपया room दोबारा select करें।",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // MEAL PLAN VERIFY
    // ==================================================

    if (
      mealPlan &&
      selectedRoom.mealPlan !==
        mealPlan
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected meal plan बदल गया है। कृपया room दोबारा select करें।",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // CAPACITY VERIFY
    // ==================================================

    if (
      selectedRoom.maxGuests <
      guests
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected room requested guests के लिए पर्याप्त नहीं है।",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // SERVER-SIDE PRICE
    // ==================================================

    const roomFare =
      selectedRoom.roomFare;

    const convenienceFee = 50;

    const totalAmount =
      roomFare +
      convenienceFee;

    // ==================================================
    // TRANSACTION ID
    // ==================================================

    const transactionId =
      `HOTEL-${Date.now()}-${Math.floor(
        1000 +
          Math.random() * 9000
      )}`;

    // ==================================================
    // BOOKING DATA
    // ==================================================

    const bookingData = {
      bookingType:
        "HOTEL_BOOKING",

      hotel: {
        hotelId,
        hotelName,
        city,
        location,
      },

      room: {
        roomId:
          selectedRoom.roomId,

        roomType:
          selectedRoom.roomType,

        mealPlan:
          selectedRoom.mealPlan,

        refundable:
          selectedRoom.refundable,

        maxGuests:
          selectedRoom.maxGuests,
      },

      stay: {
        checkIn,
        checkOut,
        guests,
        rooms,
        nights,
      },

      guest: {
        name:
          guestName,

        age:
          guestAge,

        gender:
          guestGender,

        mobile:
          guestMobile,
      },

      payment: {
        pricePerNight:
          selectedRoom.pricePerNight,

        roomFare,

        convenienceFee,

        totalAmount,

        currency:
          selectedRoom.currency,
      },

      provider: {
        mode:
          process.env.HOTEL_API_PROVIDER ||
          "demo",

        confirmationId:
          null,

        bookingStatus:
          "PENDING",
      },
    };

    // ==================================================
    // SAVE DESCRIPTION
    // ==================================================

    const description =
      JSON.stringify(
        bookingData
      );

    // ==================================================
    // CREATE TRANSACTION
    // ==================================================

    const transaction =
      await prisma.transaction.create(
        {
          data: {
            userId:
              user.id,

            transactionId,

            service:
              "HOTEL_BOOKING",

            category:
              "TRAVEL",

            description,

            amount:
              totalAmount,

            status:
              "PENDING",

            referenceId:
              hotelId,

            provider:
              hotelName,

            updatedAt:
              new Date(),
          },

          select: {
            id: true,
            transactionId:
              true,
            service:
              true,
            category:
              true,
            description:
              true,
            amount:
              true,
            status:
              true,
            referenceId:
              true,
            provider:
              true,
            createdAt:
              true,
          },
        }
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Hotel booking transaction created successfully.",

        provider:
          process.env.HOTEL_API_PROVIDER ||
          "demo",

        transaction: {
          id:
            transaction.id,

          transactionId:
            transaction.transactionId,

          service:
            transaction.service,

          category:
            transaction.category,

          description:
            transaction.description,

          amount:
            transaction.amount.toString(),

          status:
            transaction.status,

          referenceId:
            transaction.referenceId,

          provider:
            transaction.provider,

          createdAt:
            transaction.createdAt.toISOString(),
        },

        booking:
          bookingData,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "HOTEL BOOKING CREATE API ERROR:",
      error
    );

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Hotel booking create नहीं हो सकी। Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}