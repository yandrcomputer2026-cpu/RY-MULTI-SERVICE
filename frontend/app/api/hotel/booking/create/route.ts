import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { hotelProvider } from "@/lib/providers/travel/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
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

    const hotelId = String(body.hotelId ?? "").trim();
    const hotelName = String(body.hotelName ?? "").trim();
    const city = String(body.city ?? "").trim();
    const location = String(body.location ?? "").trim();

    const roomId = String(body.roomId ?? "").trim();
    const roomType = String(body.roomType ?? "").trim();

    const checkIn = String(body.checkIn ?? "").trim();
    const checkOut = String(body.checkOut ?? "").trim();

    const guests = Number(body.guests);
    const rooms = Number(body.rooms);

    const guestName = String(body.guestName ?? "").trim();
    const guestAge = Number(body.guestAge);
    const guestGender = String(body.guestGender ?? "").trim();
    const guestMobile = String(body.guestMobile ?? "").trim();

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!hotelId || !hotelName || !city || !location) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel details पूरी नहीं हैं।",
        },
        {
          status: 400,
        }
      );
    }

    if (!roomId || !roomType) {
      return NextResponse.json(
        {
          success: false,
          message: "Room details पूरी नहीं हैं।",
        },
        {
          status: 400,
        }
      );
    }

    if (!checkIn || !isValidDate(checkIn)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid check-in date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!checkOut || !isValidDate(checkOut)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid check-out date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Check-out date must be after check-in date.",
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

    if (!guestName) {
      return NextResponse.json(
        {
          success: false,
          message: "Guest name is required.",
        },
        {
          status: 400,
        }
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
          message: "Valid guest age is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !["MALE", "FEMALE", "OTHER"].includes(
        guestGender.toUpperCase()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid guest gender is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[0-9]{10}$/.test(guestMobile)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 10-digit guest mobile is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // COMMON TRAVEL PROVIDER SAFETY CHECK
    // ==================================================

    const providerHealth =
      await hotelProvider.healthCheck();

    const providerReady =
      providerHealth.success === true &&
      providerHealth.data?.configured === true &&
      providerHealth.data?.available === true &&
      providerHealth.data?.status === "ACTIVE";

    // ==================================================
    // PROVIDER NOT ACTIVE
    // IMPORTANT:
    // No transaction is created.
    // No Razorpay order is created.
    // ==================================================

    if (!providerReady) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "HOTEL_PROVIDER_NOT_ACTIVE",

          message:
            "Hotel booking provider अभी active नहीं है। इसलिए transaction और payment शुरू नहीं किया गया है।",

          provider: {
            configured:
              providerHealth.data?.configured ??
              false,

            available:
              providerHealth.data?.available ??
              false,

            status:
              providerHealth.data?.status ??
              "NOT_CONFIGURED",
          },
        },
        {
          status: 503,
        }
      );
    }

    // ==================================================
    // LIVE HOTEL WORKFLOW NOT IMPLEMENTED
    //
    // Even if registry is changed to ACTIVE,
    // payment must not start until the authorized
    // provider booking workflow is implemented.
    // ==================================================

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "HOTEL_WORKFLOW_NOT_IMPLEMENTED",

        message:
          "Hotel provider active है, लेकिन live hotel booking workflow अभी implement नहीं हुआ है। इसलिए transaction और payment शुरू नहीं किया गया है।",
      },
      {
        status: 503,
      }
    );
  } catch (error) {
    console.error(
      "HOTEL BOOKING CREATE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Hotel booking request process नहीं हो सकी। Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}