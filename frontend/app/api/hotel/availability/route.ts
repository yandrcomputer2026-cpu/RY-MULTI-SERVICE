import { NextResponse } from "next/server";

import {
  getHotelProvider,
  type HotelAvailabilityRequest,
} from "@/lib/hotel-api";

export const runtime = "nodejs";

// ======================================================
// HOTEL AVAILABILITY API
// ======================================================

export async function POST(
  request: Request
) {
  try {
    // ==================================================
    // REQUEST BODY
    // ==================================================

    let body: {
      hotelId?: unknown;
      checkIn?: unknown;
      checkOut?: unknown;
      guests?: unknown;
      rooms?: unknown;
    };

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

    // ==================================================
    // READ DATA
    // ==================================================

    const hotelId =
      typeof body.hotelId === "string"
        ? body.hotelId.trim()
        : "";

    const checkIn =
      typeof body.checkIn === "string"
        ? body.checkIn.trim()
        : "";

    const checkOut =
      typeof body.checkOut === "string"
        ? body.checkOut.trim()
        : "";

    const guests = Number(
      body.guests
    );

    const rooms = Number(
      body.rooms
    );

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!hotelId) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!checkIn) {
      return NextResponse.json(
        {
          success: false,
          message: "Check-in date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!checkOut) {
      return NextResponse.json(
        {
          success: false,
          message: "Check-out date is required.",
        },
        {
          status: 400,
        }
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
          message: "Guests must be between 1 and 20.",
        },
        {
          status: 400,
        }
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
          message: "Rooms must be between 1 and 10.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // PROVIDER REQUEST
    // ==================================================

    const availabilityRequest: HotelAvailabilityRequest = {
      hotelId,
      checkIn,
      checkOut,
      guests,
      rooms,
    };

    // ==================================================
    // GET HOTEL PROVIDER
    // ==================================================

    const provider =
      getHotelProvider();

    console.log(
      "HOTEL AVAILABILITY PROVIDER:",
      provider.constructor.name
    );

    // ==================================================
    // GET AVAILABLE ROOMS
    // ==================================================

    const availableRooms =
      await provider.getAvailability(
        availabilityRequest
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        provider:
          process.env.HOTEL_API_PROVIDER ||
          "demo",

        search: {
          hotelId,
          checkIn,
          checkOut,
          guests,
          rooms,
        },

        count:
          availableRooms.length,

        rooms:
          availableRooms,

        message:
          availableRooms.length > 0
            ? "Room availability found successfully."
            : "No rooms available for the selected dates.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "HOTEL AVAILABILITY API ERROR:",
      error
    );

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Hotel room availability service में server error हुआ।",
      },
      {
        status: 500,
      }
    );
  }
}