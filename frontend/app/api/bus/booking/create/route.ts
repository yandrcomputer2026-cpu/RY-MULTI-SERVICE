import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
        { status: 401 }
      );
    }

    // ==================================================
    // REQUEST BODY
    // ==================================================

    let body: {
      busId?: unknown;
      operator?: unknown;
      busType?: unknown;
      from?: unknown;
      to?: unknown;
      journeyDate?: unknown;
      departure?: unknown;
      arrival?: unknown;
      duration?: unknown;
      price?: unknown;

      passengerName?: unknown;
      passengerAge?: unknown;
      passengerGender?: unknown;
      passengerMobile?: unknown;
      seatNumber?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // READ DATA
    // ==================================================

    const busId =
      String(body.busId ?? "").trim();

    const operator =
      String(body.operator ?? "").trim();

    const busType =
      String(body.busType ?? "").trim();

    const from =
      String(body.from ?? "").trim();

    const to =
      String(body.to ?? "").trim();

    const journeyDate =
      String(body.journeyDate ?? "").trim();

    const departure =
      String(body.departure ?? "").trim();

    const arrival =
      String(body.arrival ?? "").trim();

    const duration =
      String(body.duration ?? "").trim();

    const passengerName =
      String(body.passengerName ?? "").trim();

    const passengerMobile =
      String(body.passengerMobile ?? "").trim();

    const passengerGender =
      String(body.passengerGender ?? "").trim();

    const seatNumber =
      String(body.seatNumber ?? "").trim();

    const passengerAge =
      Number(body.passengerAge);

    const totalAmount =
      Number(body.price);

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!busId) {
      return NextResponse.json(
        {
          success: false,
          message: "Bus ID is required.",
        },
        { status: 400 }
      );
    }

    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          message: "Bus operator is required.",
        },
        { status: 400 }
      );
    }

    if (!busType) {
      return NextResponse.json(
        {
          success: false,
          message: "Bus type is required.",
        },
        { status: 400 }
      );
    }

    if (!from || !to) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Boarding and destination city are required.",
        },
        { status: 400 }
      );
    }

    if (!journeyDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Journey date is required.",
        },
        { status: 400 }
      );
    }

    if (!departure) {
      return NextResponse.json(
        {
          success: false,
          message: "Departure time is required.",
        },
        { status: 400 }
      );
    }

    if (!arrival) {
      return NextResponse.json(
        {
          success: false,
          message: "Arrival time is required.",
        },
        { status: 400 }
      );
    }

    if (!duration) {
      return NextResponse.json(
        {
          success: false,
          message: "Journey duration is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking amount.",
        },
        { status: 400 }
      );
    }

    if (!passengerName) {
      return NextResponse.json(
        {
          success: false,
          message: "Passenger name is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(passengerAge) ||
      passengerAge < 1 ||
      passengerAge > 120
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid passenger age is required.",
        },
        { status: 400 }
      );
    }

    if (!passengerGender) {
      return NextResponse.json(
        {
          success: false,
          message: "Passenger gender is required.",
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    if (!seatNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Seat number is required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // TRANSACTION ID
    // ==================================================

    const transactionId =
      `BUS-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    // ==================================================
    // FULL BOOKING DATA
    // ==================================================

    const bookingData = {
      bookingType: "BUS_BOOKING",

      bus: {
        busId,
        operator,
        busType,
        from,
        to,
        journeyDate,
        departure,
        arrival,
        duration,
      },

      passenger: {
        name: passengerName,
        age: passengerAge,
        gender: passengerGender,
        mobile: passengerMobile,
        seatNumber,
      },

      payment: {
        totalAmount,
        currency: "INR",
      },
    };

    // ==================================================
    // STORE FULL BOOKING DATA
    // ==================================================

    const description =
      JSON.stringify(bookingData);

    // ==================================================
    // CREATE TRANSACTION
    // ==================================================

    const transaction =
      await prisma.transaction.create({
        data: {
          userId: user.id,

          transactionId,

          service: "BUS_BOOKING",

          category: "TRAVEL",

          description,

          amount: totalAmount,

          status: "PENDING",

          referenceId: busId,

          provider: operator,

          updatedAt: new Date(),
        },

        select: {
          id: true,
          transactionId: true,
          service: true,
          category: true,
          description: true,
          amount: true,
          status: true,
          referenceId: true,
          provider: true,
          createdAt: true,
        },
      });

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Bus booking transaction created successfully.",

        transaction: {
          id: transaction.id,

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

        booking: bookingData,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "BUS BOOKING CREATE ERROR:",
      error
    );

    console.error(
      "================================"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Bus booking create नहीं हो सकी। Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}