import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "पहले Login करना जरूरी है।",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      booking,
    } = body;

    if (
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature ||
      !booking
    ) {
      return NextResponse.json(
        {
          message: "Payment verification data incomplete है।",
        },
        {
          status: 400,
        }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        {
          message: "Razorpay configuration missing है।",
        },
        {
          status: 500,
        }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        {
          message: "Payment verification failed.",
        },
        {
          status: 400,
        }
      );
    }

    const bookingId = `TRAIN-${Date.now()}-${user.id}`;

    const baseFare = Number(
      booking.baseFare ?? booking.totalFare ?? booking.fare ?? 0
    );

    const convenienceFee = Number(
      booking.convenienceFee ?? 0
    );

    const totalAmount = Number(
      booking.totalAmount ??
        baseFare + convenienceFee
    );

    const description = JSON.stringify({
      bookingType: "TRAIN_BOOKING",

      trainNo: booking.trainNo || "",
      trainName: booking.trainName || "",

      from: booking.from || "",
      to: booking.to || "",

      journeyDate:
        booking.date ||
        booking.journeyDate ||
        "",

      travelClass:
        booking.travelClass ||
        booking.class ||
        "",

      passengers:
        booking.passengers || 1,

      passengerList:
        booking.passengerList || [],

      contact:
        booking.contact || null,

      departure:
        booking.departure || "",

      arrival:
        booking.arrival || "",

      duration:
        booking.duration || "",

      fare:
        Number(booking.fare || 0),

      totalFare:
        Number(booking.totalFare || 0),

      baseFare,

      convenienceFee,

      totalAmount,
    });

    const transaction =
      await prisma.transaction.create({
        data: {
          userId: user.id,

          transactionId: bookingId,

          service: "TRAIN_BOOKING",

          category: "TRAIN",

          description,

          amount: totalAmount,

          status: "SUCCESS",

          referenceId: razorpayPaymentId,

          provider: "RAZORPAY",

          razorpayOrderId,

          razorpayPaymentId,

          razorpaySignature,

          updatedAt: new Date(),
        },
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Train payment verified successfully.",

        bookingId:
          transaction.transactionId,

        razorpayPaymentId:
          transaction.razorpayPaymentId,

        status: "CONFIRMED",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "TRAIN VERIFY PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Train payment verify नहीं हो पाया।",
      },
      {
        status: 500,
      }
    );
  }
}