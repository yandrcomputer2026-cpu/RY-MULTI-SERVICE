import { NextResponse } from "next/server";

import {
  getHotelProvider,
  type HotelSearchRequest,
} from "@/lib/hotel-api";

export const runtime = "nodejs";

// ======================================================
// HOTEL SEARCH API
// ======================================================

export async function POST(
  request: Request
) {
  try {
    // ==================================================
    // REQUEST BODY
    // ==================================================

    let body: {
      city?: unknown;
      checkIn?: unknown;
      checkOut?: unknown;
      guests?: unknown;
      rooms?: unknown;
    };

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request data.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // READ INPUT
    // ==================================================

    const city =
      typeof body.city ===
      "string"
        ? body.city.trim()
        : "";

    const checkIn =
      typeof body.checkIn ===
      "string"
        ? body.checkIn.trim()
        : "";

    const checkOut =
      typeof body.checkOut ===
      "string"
        ? body.checkOut.trim()
        : "";

    const guests =
      Number(body.guests);

    const rooms =
      Number(body.rooms);

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Destination city is required.",
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
          message:
            "Check-in date is required.",
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
          message:
            "Check-out date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        guests
      ) ||
      guests < 1 ||
      guests > 20
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Guests must be between 1 and 20.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        rooms
      ) ||
      rooms < 1 ||
      rooms > 10
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rooms must be between 1 and 10.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // PROVIDER REQUEST
    // ==================================================

    const searchRequest: HotelSearchRequest = {
      city,
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
      "HOTEL SEARCH PROVIDER:",
      provider.constructor.name
    );

    // ==================================================
    // SEARCH
    // ==================================================

    const hotels =
      await provider.searchHotels(
        searchRequest
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
          city,
          checkIn,
          checkOut,
          guests,
          rooms,
        },

        count:
          hotels.length,

        hotels,

        message:
          hotels.length > 0
            ? "Hotels found successfully."
            : "No hotels found for this destination.",
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
      "HOTEL SEARCH API ERROR:",
      error
    );

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Hotel search service में server error हुआ।",
      },
      {
        status: 500,
      }
    );
  }
}