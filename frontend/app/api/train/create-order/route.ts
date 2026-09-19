import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { trainProvider } from "@/lib/providers/travel/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// TRAIN RAZORPAY ORDER
// ======================================================

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
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // TRAVEL PROVIDER CHECK
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
          message:
            "Train booking provider अभी active नहीं है। इसलिए payment order create नहीं किया गया है।",
        },
        {
          status: 503,
        }
      );
    }

    // ==================================================
    // SAFETY BLOCK
    // ==================================================
    //
    // Provider registry ACTIVE होना alone पर्याप्त नहीं है.
    //
    // जब तक authorized train booking provider का actual
    // server-side availability, fare और booking workflow
    // implement नहीं होता, Razorpay order नहीं बनाया जाएगा.
    // ==================================================

    return NextResponse.json(
      {
        success: false,
        code: "TRAIN_WORKFLOW_NOT_IMPLEMENTED",
        message:
          "Train provider active है, लेकिन live train booking workflow अभी implement नहीं हुआ है। इसलिए payment order create नहीं किया गया है।",
      },
      {
        status: 503,
      }
    );

    /*
    // ==================================================
    // FUTURE LIVE PAYMENT FLOW
    // ==================================================
    //
    // यह code तभी enable करें जब:
    //
    // 1. Authorized train provider connected हो.
    // 2. Server provider से live availability मिले.
    // 3. Server provider से final fare verify करे.
    // 4. Client amount पर भरोसा न किया जाए.
    // 5. Booking/payment workflow implemented हो.
    //
    // ==================================================

    const body = await request.json();

    // IMPORTANT:
    // Future में amount body से नहीं लेना है.
    // Final amount authorized train provider/server-side
    // booking transaction से लेना होगा.

    const amount = Number(body.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment amount.",
        },
        {
          status: 400,
        }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay configuration missing.",
        },
        {
          status: 500,
        }
      );
    }

    const razorpay =
      new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

    const order =
      await razorpay.orders.create({
        amount:
          Math.round(
            amount * 100
          ),

        currency: "INR",

        receipt:
          `train_${Date.now()}`,

        notes: {
          service:
            "TRAIN_BOOKING",

          userId:
            String(user.id),
        },
      });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
    */
  } catch (error) {
    console.error(
      "TRAIN CREATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Train payment order create नहीं हो पाया।",
      },
      {
        status: 500,
      }
    );
  }
}