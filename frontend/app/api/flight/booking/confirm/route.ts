import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  getFlightProvider,
  type FlightBookingRequest,
} from "@/lib/flight-api";

export const runtime = "nodejs";

// ======================================================
// CONFIRM FLIGHT BOOKING
// ======================================================

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
    // READ REQUEST
    // ==================================================

    let body: {
      transactionId?: unknown;
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

    const transactionId =
      String(
        body.transactionId ??
          ""
      ).trim();

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Transaction ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // FIND TRANSACTION
    // ==================================================

    const transaction =
      await prisma.transaction.findFirst(
        {
          where: {
            transactionId,

            userId:
              user.id,
          },
        }
      );

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Flight transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // SERVICE CHECK
    // ==================================================

    if (
      transaction.service !==
      "FLIGHT_BOOKING"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This transaction is not a flight booking.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // PAYMENT CHECK
    // ==================================================

    if (
      transaction.status !==
      "SUCCESS"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Flight payment is not verified yet.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // READ BOOKING DATA
    // ==================================================

    let bookingData: any;

    try {
      bookingData =
        JSON.parse(
          transaction.description ||
            "{}"
        );
    } catch (error) {
      console.error(
        "FLIGHT DESCRIPTION JSON ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Flight booking data invalid है।",
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // ALREADY CONFIRMED
    // ==================================================

    if (
      bookingData?.provider
        ?.bookingStatus ===
        "CONFIRMED" &&
      bookingData?.provider
        ?.confirmationId
    ) {
      return NextResponse.json(
        {
          success: true,

          message:
            "Flight booking already confirmed.",

          transactionId,

          confirmationId:
            bookingData.provider
              .confirmationId,

          booking:
            bookingData,
        },
        {
          status: 200,
        }
      );
    }

    // ==================================================
    // VALIDATE STORED BOOKING DATA
    // ==================================================

    const flight =
      bookingData?.flight;

    const journey =
      bookingData?.journey;

    const passenger =
      bookingData?.passenger;

    if (
      !flight?.flightId ||
      !flight?.airlineCode ||
      !flight?.airlineName ||
      !flight?.flightNumber ||
      !flight?.from ||
      !flight?.to
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stored flight details incomplete हैं।",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !journey?.journeyDate ||
      !Number.isInteger(
        Number(
          journey.adults
        )
      ) ||
      !Number.isInteger(
        Number(
          journey.children
        )
      ) ||
      !Number.isInteger(
        Number(
          journey.infants
        )
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stored journey details incomplete हैं।",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !passenger?.name ||
      !Number.isInteger(
        Number(
          passenger.age
        )
      ) ||
      !passenger?.gender ||
      !passenger?.mobile
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stored passenger details incomplete हैं।",
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // PROVIDER
    // ==================================================

    const provider =
      getFlightProvider();

    console.log(
      "FLIGHT CONFIRM PROVIDER:",
      provider.constructor.name
    );

    // ==================================================
    // CREATE PROVIDER BOOKING REQUEST
    // ==================================================

    const bookingRequest: FlightBookingRequest =
      {
        flightId:
          String(
            flight.flightId
          ),

        airlineCode:
          String(
            flight.airlineCode
          ),

        airlineName:
          String(
            flight.airlineName
          ),

        flightNumber:
          String(
            flight.flightNumber
          ),

        from:
          String(
            flight.from
          ),

        fromName:
          String(
            flight.fromName ||
              ""
          ),

        to:
          String(
            flight.to
          ),

        toName:
          String(
            flight.toName ||
              ""
          ),

        journeyDate:
          String(
            journey.journeyDate
          ),

        adults:
          Number(
            journey.adults
          ),

        children:
          Number(
            journey.children
          ),

        infants:
          Number(
            journey.infants
          ),

        cabinClass:
          String(
            flight.cabinClass ||
              "ECONOMY"
          ),

        passengerName:
          String(
            passenger.name
          ),

        passengerAge:
          Number(
            passenger.age
          ),

        passengerGender:
          String(
            passenger.gender
          ),

        passengerMobile:
          String(
            passenger.mobile
          ),
      };

    // ==================================================
    // PROVIDER BOOKING
    // ==================================================

    const result =
      await provider.createBooking(
        bookingRequest
      );

    console.log(
      "FLIGHT PROVIDER BOOKING RESULT:",
      result
    );

    // ==================================================
    // PROVIDER FAILURE
    // ==================================================

    if (
      result.status !==
        "CONFIRMED" ||
      !result.confirmationId
    ) {
      bookingData.provider = {
        ...(bookingData.provider ||
          {}),

        mode:
          process.env
            .FLIGHT_API_PROVIDER ||
          "demo",

        confirmationId:
          result.confirmationId,

        bookingStatus:
          "FAILED",

        provider:
          result.provider,
      };

      await prisma.transaction.update(
        {
          where: {
            id:
              transaction.id,
          },

          data: {
            description:
              JSON.stringify(
                bookingData
              ),

            provider:
              result.provider,

            updatedAt:
              new Date(),
          },
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment सफल हुआ लेकिन flight booking confirm नहीं हो सकी।",
          transactionId,
          provider:
            result.provider,
        },
        {
          status: 502,
        }
      );
    }

    // ==================================================
    // UPDATE BOOKING DATA
    // ==================================================

    bookingData.provider = {
      ...(bookingData.provider ||
        {}),

      mode:
        process.env
          .FLIGHT_API_PROVIDER ||
        "demo",

      confirmationId:
        result.confirmationId,

      bookingStatus:
        "CONFIRMED",

      provider:
        result.provider,
    };

    // ==================================================
    // SAVE PROVIDER RESULT
    // ==================================================

    bookingData.providerResult =
      result;

    // ==================================================
    // DATABASE UPDATE
    // ==================================================

    const updatedTransaction =
      await prisma.transaction.update(
        {
          where: {
            id:
              transaction.id,
          },

          data: {
            description:
              JSON.stringify(
                bookingData
              ),

            provider:
              result.provider,

            updatedAt:
              new Date(),
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
          "Flight booking confirmed successfully.",

        transaction: {
          transactionId:
            updatedTransaction.transactionId,

          status:
            updatedTransaction.status,

          amount:
            updatedTransaction.amount.toString(),

          provider:
            updatedTransaction.provider,
        },

        confirmationId:
          result.confirmationId,

        booking:
          bookingData,
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
      "FLIGHT BOOKING CONFIRM ERROR:",
      error
    );

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Flight booking confirmation failed.",
      },
      {
        status: 500,
      }
    );
  }
}