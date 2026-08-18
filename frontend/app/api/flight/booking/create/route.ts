import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  getFlightProvider,
  type FlightAvailabilityRequest,
} from "@/lib/flight-api";

export const runtime = "nodejs";

type BookingBody = {
  flightId?: unknown;

  airlineCode?: unknown;
  airlineName?: unknown;
  flightNumber?: unknown;

  from?: unknown;
  fromName?: unknown;

  to?: unknown;
  toName?: unknown;

  journeyDate?: unknown;

  adults?: unknown;
  children?: unknown;
  infants?: unknown;

  cabinClass?: unknown;

  passengerName?: unknown;
  passengerAge?: unknown;
  passengerGender?: unknown;
  passengerMobile?: unknown;
};

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date =
    new Date(`${value}T00:00:00`);

  return !Number.isNaN(
    date.getTime()
  );
}

function isValidCabin(
  value: string
) {
  return [
    "ECONOMY",
    "PREMIUM_ECONOMY",
    "BUSINESS",
    "FIRST",
  ].includes(value);
}

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

    let body: BookingBody;

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
    // NORMALIZE DATA
    // ==================================================

    const flightId =
      String(
        body.flightId ?? ""
      ).trim();

    const airlineCode =
      String(
        body.airlineCode ?? ""
      ).trim();

    const airlineName =
      String(
        body.airlineName ?? ""
      ).trim();

    const flightNumber =
      String(
        body.flightNumber ?? ""
      ).trim();

    const from =
      String(
        body.from ?? ""
      )
        .trim()
        .toUpperCase();

    const fromName =
      String(
        body.fromName ?? ""
      ).trim();

    const to =
      String(
        body.to ?? ""
      )
        .trim()
        .toUpperCase();

    const toName =
      String(
        body.toName ?? ""
      ).trim();

    const journeyDate =
      String(
        body.journeyDate ?? ""
      ).trim();

    const adults =
      Number(
        body.adults
      );

    const children =
      Number(
        body.children
      );

    const infants =
      Number(
        body.infants
      );

    const cabinClass =
      String(
        body.cabinClass ??
          "ECONOMY"
      )
        .trim()
        .toUpperCase();

    const passengerName =
      String(
        body.passengerName ??
          ""
      ).trim();

    const passengerAge =
      Number(
        body.passengerAge
      );

    const passengerGender =
      String(
        body.passengerGender ??
          ""
      ).trim();

    const passengerMobile =
      String(
        body.passengerMobile ??
          ""
      ).trim();

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!flightId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Flight ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!airlineCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Airline code is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!airlineName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Airline name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!flightNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Flight number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!from) {
      return NextResponse.json(
        {
          success: false,
          message:
            "From airport is required.",
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
            "To airport is required.",
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
      !isValidDate(
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

    // ==================================================
    // PASSENGERS
    // ==================================================

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
            "Adults must be between 1 and 9.",
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
            "Children count is invalid.",
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
            "Infants count is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    const totalPassengers =
      adults +
      children +
      infants;

    if (
      totalPassengers < 1 ||
      totalPassengers > 9
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Total passengers 1 से 9 के बीच होने चाहिए।",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // CABIN
    // ==================================================

    if (
      !isValidCabin(
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
    // PASSENGER VALIDATION
    // ==================================================

    if (!passengerName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Passenger name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        passengerAge
      ) ||
      passengerAge < 1 ||
      passengerAge > 120
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid passenger age is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!passengerGender) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Passenger gender is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !/^[0-9]{10}$/.test(
        passengerMobile
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 10-digit passenger mobile is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // FLIGHT PROVIDER
    // ==================================================

    const provider =
      getFlightProvider();

    console.log(
      "FLIGHT BOOKING PROVIDER:",
      provider.constructor.name
    );

    // ==================================================
    // SERVER-SIDE AVAILABILITY / FARE CHECK
    // ==================================================

    const availabilityRequest: FlightAvailabilityRequest =
      {
        flightId,

        journeyDate,

        adults,

        children,

        infants,

        cabinClass,
      };

    const availability =
      await provider.getAvailability(
        availabilityRequest
      );

    // ==================================================
    // FLIGHT VERIFY
    // ==================================================

    if (
      !availability ||
      availability.flightId !==
        flightId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected flight details verify नहीं हो पाईं।",
        },
        {
          status: 409,
        }
      );
    }

    // ==================================================
    // ROUTE VERIFY
    // ==================================================

    if (
      availability.from !==
        from ||
      availability.to !==
        to
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected flight route बदल गई है। कृपया flight दोबारा select करें।",
        },
        {
          status: 409,
        }
      );
    }

    // ==================================================
    // AIRLINE VERIFY
    // ==================================================

    if (
      availability.airlineCode !==
      airlineCode
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Airline details बदल गई हैं। कृपया flight दोबारा select करें।",
        },
        {
          status: 409,
        }
      );
    }

    // ==================================================
    // FLIGHT NUMBER VERIFY
    // ==================================================

    if (
      availability.flightNumber !==
      flightNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Flight number बदल गया है। कृपया flight दोबारा select करें।",
        },
        {
          status: 409,
        }
      );
    }

    // ==================================================
    // SEAT CHECK
    // ==================================================

    if (
      availability.seatsAvailable <
      totalPassengers
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Required seats अभी available नहीं हैं।",
        },
        {
          status: 409,
        }
      );
    }

    // ==================================================
    // SERVER-SIDE FARE
    // ==================================================

    const baseFare =
      Number(
        availability.fare
          .baseFare
      );

    const taxes =
      Number(
        availability.fare
          .taxes
      );

    const convenienceFee =
      Number(
        availability.fare
          .convenienceFee
      );

    const totalAmount =
      Number(
        availability.fare
          .totalAmount
      );

    const currency =
      availability.fare
        .currency ||
      "INR";

    if (
      !Number.isFinite(
        baseFare
      ) ||
      !Number.isFinite(
        taxes
      ) ||
      !Number.isFinite(
        convenienceFee
      ) ||
      !Number.isFinite(
        totalAmount
      ) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Server verified flight fare invalid है।",
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // TRANSACTION ID
    // ==================================================

    const transactionId =
      `FLIGHT-${Date.now()}-${Math.floor(
        1000 +
          Math.random() * 9000
      )}`;

    // ==================================================
    // BOOKING DATA
    // ==================================================

    const bookingData = {
      bookingType:
        "FLIGHT_BOOKING",

      flight: {
        flightId,

        airlineCode:
          availability.airlineCode,

        airlineName:
          availability.airlineName,

        flightNumber:
          availability.flightNumber,

        from:
          availability.from,

        fromName:
          availability.fromName,

        to:
          availability.to,

        toName:
          availability.toName,

        departureTime:
          availability.departureTime,

        arrivalTime:
          availability.arrivalTime,

        duration:
          availability.duration,

        stops:
          availability.stops,

        cabinClass:
          availability.cabinClass,

        refundable:
          availability.refundable,

        seatsAvailable:
          availability.seatsAvailable,
      },

      journey: {
        journeyDate,

        adults,

        children,

        infants,

        totalPassengers,
      },

      passenger: {
        name:
          passengerName,

        age:
          passengerAge,

        gender:
          passengerGender,

        mobile:
          passengerMobile,
      },

      payment: {
        baseFare,

        taxes,

        convenienceFee,

        totalAmount,

        currency,
      },

      provider: {
        mode:
          process.env
            .FLIGHT_API_PROVIDER ||
          "demo",

        confirmationId:
          null,

        bookingStatus:
          "PENDING",
      },
    };

    // ==================================================
    // DESCRIPTION
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
              "FLIGHT_BOOKING",

            category:
              "TRAVEL",

            description,

            amount:
              totalAmount,

            status:
              "PENDING",

            referenceId:
              flightId,

            provider:
              availability.airlineName,

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
          "Flight booking transaction created successfully.",

        provider:
          process.env
            .FLIGHT_API_PROVIDER ||
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
      "FLIGHT BOOKING CREATE API ERROR:",
      error
    );

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Flight booking create नहीं हो सकी। Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}