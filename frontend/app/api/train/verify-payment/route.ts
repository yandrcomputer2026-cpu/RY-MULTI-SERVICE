import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { trainProvider } from "@/lib/providers/travel/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// TRAIN PAYMENT VERIFICATION
// ======================================================
//
// IMPORTANT:
//
// Razorpay payment verification और actual train booking
// confirmation दो अलग-अलग चीजें हैं.
//
// Authorized live train booking workflow implement होने
// तक यह route payment verification/booking confirmation
// perform नहीं करेगा.
//
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
          message: "पहले Login करना जरूरी है।",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // TRAIN PROVIDER CHECK
    // ==================================================

    const health =
      await trainProvider.healthCheck();

    const providerStatus =
      health.data;

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
          code: "TRAIN_PROVIDER_NOT_ACTIVE",
          paymentVerified: false,
          bookingConfirmed: false,
          message:
            "Train booking provider अभी active नहीं है। Payment verification से booking confirm नहीं की गई है।",
        },
        {
          status: 503,
        }
      );
    }

    // ==================================================
    // LIVE WORKFLOW SAFETY BLOCK
    // ==================================================
    //
    // Provider registry ACTIVE होने से actual booking
    // workflow automatically ready नहीं माना जाएगा.
    //
    // Future implementation में:
    //
    // 1. Razorpay order को server-side transaction से
    //    match करना होगा.
    //
    // 2. Razorpay signature को timingSafeEqual से verify
    //    करना होगा.
    //
    // 3. Razorpay API से payment/order/amount/captured
    //    status verify करना होगा.
    //
    // 4. Payment verified होने पर केवल payment status
    //    update होगा.
    //
    // 5. Actual train provider booking अलग call होगी.
    //
    // 6. केवल provider confirmation/PNR मिलने के बाद
    //    bookingStatus = CONFIRMED होगा.
    //
    // ==================================================

    return NextResponse.json(
      {
        success: false,
        code: "TRAIN_WORKFLOW_NOT_IMPLEMENTED",
        paymentVerified: false,
        bookingConfirmed: false,
        message:
          "Train provider active है, लेकिन live payment और train booking workflow अभी implement नहीं हुआ है। Booking confirm नहीं की गई है।",
      },
      {
        status: 503,
      }
    );
  } catch (error) {
    console.error(
      "TRAIN VERIFY PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        paymentVerified: false,
        bookingConfirmed: false,
        message:
          "Train payment verification process में error आया। Booking confirm नहीं की गई है।",
      },
      {
        status: 500,
      }
    );
  }
}