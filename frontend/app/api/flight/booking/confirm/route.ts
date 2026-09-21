import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { flightProvider } from "@/lib/providers/travel/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// CONFIRM FLIGHT BOOKING
// ======================================================

export async function POST() {
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
          paymentVerified: false,
          bookingConfirmed: false,
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // TRAVEL PROVIDER STATUS
    // ==================================================

    const health =
      await flightProvider.healthCheck();

    const providerReady =
      health.success === true &&
      health.data?.configured === true &&
      health.data?.available === true &&
      health.data?.status === "ACTIVE";

    // ==================================================
    // PROVIDER NOT ACTIVE
    // ==================================================

    if (!providerReady) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "FLIGHT_PROVIDER_NOT_ACTIVE",

          message:
            "Flight booking provider अभी active नहीं है। इसलिए booking confirmation शुरू नहीं की गई है।",

          provider: health.provider,

          providerStatus:
            health.data ?? null,

          paymentVerified: false,
          bookingConfirmed: false,
        },
        {
          status: 503,
        }
      );
    }

    // ==================================================
    // IMPORTANT SAFETY GUARD
    // ==================================================
    //
    // Provider registry में ACTIVE status केवल यह बताता
    // है कि provider configuration available है.
    //
    // इससे booking automatically confirmed नहीं होगी.
    //
    // Future live implementation में यहां:
    //
    // 1. transaction ownership verify करना है
    // 2. Razorpay/payment verification independently
    //    verify करनी है
    // 3. stored live provider session/fare token verify
    //    करना है
    // 4. authorized provider booking API call करनी है
    // 5. provider PNR / booking reference verify करना है
    // 6. verified provider result मिलने के बाद ही
    //    bookingConfirmed = true करना है
    //
    // DemoFlightProvider.createBooking() को यहां call
    // नहीं करना है.
    // ==================================================

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "FLIGHT_WORKFLOW_NOT_IMPLEMENTED",

        message:
          "Flight provider active है, लेकिन live flight booking confirmation workflow अभी implement नहीं हुआ है।",

        provider: health.provider,

        providerStatus:
          health.data ?? null,

        paymentVerified: false,
        bookingConfirmed: false,
      },
      {
        status: 503,
      }
    );
  } catch (error) {
    console.error(
      "FLIGHT BOOKING CONFIRM ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "FLIGHT_PROVIDER_CHECK_FAILED",

        message:
          "Flight provider status check नहीं हो पाया। Booking confirmation शुरू नहीं की गई है।",

        paymentVerified: false,
        bookingConfirmed: false,
      },
      {
        status: 503,
      }
    );
  }
}