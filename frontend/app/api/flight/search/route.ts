import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import {
  getFlightProvider,
  type FlightSearchRequest,
} from "@/lib/flight-api";

export const runtime = "nodejs";

export async function POST(
  request: Request
) {
  try {
    // ==================================================
    // LOGIN CHECK
    // ==================================================

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // READ BODY
    // ==================================================

    let body: Partial<FlightSearchRequest>;

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
    // NORMALIZE
    // ==================================================

    const from =
      String(
        body.from ?? ""
      )
        .trim()
        .toUpperCase();

    const to =
      String(
        body.to ?? ""
      )
        .trim()
        .toUpperCase();

    const journeyDate =
      String(
        body.journeyDate ?? ""
      ).trim();

    const returnDate =
      body.returnDate
        ? String(
            body.returnDate
          ).trim()
        : undefined;

    const tripType =
      body.tripType ||
      "ONE_WAY";

    const adults =
      Number(
        body.adults ?? 1
      );

    const children =
      Number(
        body.children ?? 0
      );

    const infants =
      Number(
        body.infants ?? 0
      );

    const cabinClass =
      body.cabinClass ||
      "ECONOMY";

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!from) {
      return NextResponse.json(
        {
          success: false,
          message:
            "From airport/city is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          message:
            "To airport/city is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (from === to) {
      return NextResponse.json(
        {
          success: false,
          message:
            "From और To अलग होने चाहिए।",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !journeyDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(
        journeyDate
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid journey date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      tripType !==
        "ONE_WAY" &&
      tripType !==
        "ROUND_TRIP" &&
      tripType !==
        "MULTI_CITY"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid trip type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      tripType ===
        "ROUND_TRIP" &&
      (!returnDate ||
        !/^\d{4}-\d{2}-\d{2}$/.test(
          returnDate
        ))
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Round trip के लिए return date जरूरी है।",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        adults
      ) ||
      adults < 1 ||
      adults > 9
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Adults 1 से 9 के बीच होने चाहिए।",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        children
      ) ||
      children < 0 ||
      children > 8
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Children की संख्या valid नहीं है।",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        infants
      ) ||
      infants < 0 ||
      infants > 4
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Infants की संख्या valid नहीं है।",
        },
        {
          status: 400,
        }
      );
    }

    if (
      adults +
        children +
        infants >
        9
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Total passengers 9 से अधिक नहीं हो सकते।",
        },
        {
          status: 400,
        }
      );
    }

    const allowedCabins = [
      "ECONOMY",
      "PREMIUM_ECONOMY",
      "BUSINESS",
      "FIRST",
    ];

    if (
      !allowedCabins.includes(
        cabinClass
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid cabin class.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // PROVIDER
    // ==================================================

    const provider =
      getFlightProvider();

    console.log(
      "FLIGHT SEARCH PROVIDER:",
      provider.constructor.name
    );

    // ==================================================
    // SEARCH REQUEST
    // ==================================================

    const searchRequest: FlightSearchRequest =
      {
        from,

        to,

        journeyDate,

        returnDate,

        tripType,

        adults,

        children,

        infants,

        cabinClass,
      };

    // ==================================================
    // SEARCH
    // ==================================================

    const flights =
      await provider.searchFlights(
        searchRequest
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        provider:
          process.env
            .FLIGHT_API_PROVIDER ||
          "demo",

        search: {
          from,

          to,

          journeyDate,

          returnDate:
            returnDate ||
            null,

          tripType,

          adults,

          children,

          infants,

          cabinClass,
        },

        count:
          flights.length,

        flights,
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
      "FLIGHT SEARCH API ERROR:",
      error
    );

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Flight search service से response नहीं मिला।",
      },
      {
        status: 500,
      }
    );
  }
}