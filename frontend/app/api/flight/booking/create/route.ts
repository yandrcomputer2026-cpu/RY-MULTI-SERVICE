import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { flightProvider } from "@/lib/providers/travel/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
          transactionCreated: false,
          paymentStarted: false,
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
            "Flight booking provider अभी active नहीं है। इसलिए transaction और payment शुरू नहीं किया गया है।",

          provider: health.provider,

          providerStatus:
            health.data ?? null,

          transactionCreated: false,
          paymentStarted: false,
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
    // Registry में provider ACTIVE होना अकेले booking
    // transaction शुरू करने के लिए पर्याप्त नहीं है.
    //
    // यहां future में actual authorized provider:
    //
    // 1. availability verification
    // 2. live fare verification
    // 3. fare/session token
    // 4. passenger validation
    // 5. booking workflow
    //
    // implement होने के बाद ही transaction/payment
    // creation enable करना है.
    //
    // DemoFlightProvider को real booking के लिए use
    // नहीं करना है.
    // ==================================================

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "FLIGHT_WORKFLOW_NOT_IMPLEMENTED",

        message:
          "Flight provider active है, लेकिन live flight booking workflow अभी implement नहीं हुआ है। इसलिए transaction और payment शुरू नहीं किया गया है।",

        provider: health.provider,

        providerStatus:
          health.data ?? null,

        transactionCreated: false,
        paymentStarted: false,
        bookingConfirmed: false,
      },
      {
        status: 503,
      }
    );
  } catch (error) {
    console.error(
      "FLIGHT BOOKING CREATE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "FLIGHT_PROVIDER_CHECK_FAILED",

        message:
          "Flight provider status check नहीं हो पाया। इसलिए transaction और payment शुरू नहीं किया गया है।",

        transactionCreated: false,
        paymentStarted: false,
        bookingConfirmed: false,
      },
      {
        status: 503,
      }
    );
  }
}