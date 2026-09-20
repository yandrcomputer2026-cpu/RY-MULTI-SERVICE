import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { busProvider } from "@/lib/providers/travel/provider";

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
        },
        { status: 401 }
      );
    }

    // ==================================================
    // BUS PROVIDER CHECK
    // ==================================================

    const health = await busProvider.healthCheck();
    const providerStatus = health.data;

    if (
      !health.success ||
      !providerStatus ||
      providerStatus.configured !== true ||
      providerStatus.available !== true ||
      providerStatus.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "BUS_PROVIDER_NOT_ACTIVE",
          message:
            "Bus booking provider अभी active नहीं है। इसलिए transaction और payment शुरू नहीं किया गया है।",
        },
        { status: 503 }
      );
    }

    // ==================================================
    // LIVE WORKFLOW SAFETY GUARD
    // ==================================================
    //
    // Provider को केवल ACTIVE करने से live booking
    // enable नहीं होगी।
    //
    // Future में यहाँ:
    // 1. Request body validation
    // 2. Live bus/seat availability verification
    // 3. Provider fare verification
    // 4. Complete passenger persistence
    // 5. Transaction creation
    // 6. Payment flow
    // 7. Provider booking confirmation / PNR
    //
    // implement किया जाएगा।
    // ==================================================

    return NextResponse.json(
      {
        success: false,
        code: "BUS_WORKFLOW_NOT_IMPLEMENTED",
        message:
          "Bus provider active है, लेकिन live bus booking workflow अभी implement नहीं हुआ है। इसलिए transaction और payment शुरू नहीं किया गया है।",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error(
      "BUS BOOKING CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Bus provider status check नहीं हो सका। Transaction और payment शुरू नहीं किया गया है।",
      },
      { status: 500 }
    );
  }
}