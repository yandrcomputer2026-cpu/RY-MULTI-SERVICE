import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

import {
  trainProvider,
  busProvider,
  flightProvider,
  hotelProvider,
} from "@/lib/providers/travel/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// TRAVEL PROVIDER STATUS
// ======================================================

export async function GET() {
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
    // PROVIDER HEALTH CHECKS
    // ==================================================

    const [
      trainHealth,
      busHealth,
      flightHealth,
      hotelHealth,
    ] = await Promise.all([
      trainProvider.healthCheck(),
      busProvider.healthCheck(),
      flightProvider.healthCheck(),
      hotelProvider.healthCheck(),
    ]);

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        provider: "travel-provider",

        services: {
          train: trainHealth.data,
          bus: busHealth.data,
          flight: flightHealth.data,
          hotel: hotelHealth.data,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "TRAVEL PROVIDER STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Travel provider status check नहीं हो सका।",
      },
      {
        status: 500,
      }
    );
  }
}