import crypto from "crypto";
import { NextResponse } from "next/server";

import { creditWalletFromRazorpayPayment } from "@/lib/wallet-credit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RazorpayWebhookEvent = {
  event?: string;

  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string | null;
        amount?: number;
        currency?: string;
        status?: string;
        captured?: boolean;
      };
    };
  };
};

export async function POST(request: Request) {
  try {
    // ======================================================
    // WEBHOOK SECRET
    // ======================================================

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET MISSING"
      );

      return NextResponse.json(
        {
          success: false,
          message: "Webhook secret missing.",
        },
        { status: 500 }
      );
    }

    // ======================================================
    // RAW BODY
    //
    // Webhook signature RAW body से verify होगी।
    // request.json() पहले नहीं करना है।
    // ======================================================

    const rawBody = await request.text();

    const receivedSignature =
      request.headers.get(
        "x-razorpay-signature"
      );

    if (!receivedSignature) {
      return NextResponse.json(
        {
          success: false,
          message: "Webhook signature missing.",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // VERIFY WEBHOOK SIGNATURE
    // ======================================================

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      receivedSignature,
      "utf8"
    );

    const signatureValid =
      expectedBuffer.length ===
        receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      console.error(
        "INVALID RAZORPAY WEBHOOK SIGNATURE"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook signature verification failed.",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // PARSE VERIFIED BODY
    // ======================================================

    let webhookEvent: RazorpayWebhookEvent;

    try {
      webhookEvent = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook JSON.",
        },
        { status: 400 }
      );
    }

    console.log(
      "RAZORPAY WEBHOOK EVENT:",
      webhookEvent.event
    );

    // ======================================================
    // ONLY PAYMENT.CAPTURED
    // ======================================================

    if (
      webhookEvent.event !==
      "payment.captured"
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
        event: webhookEvent.event || null,
      });
    }

    // ======================================================
    // PAYMENT ENTITY
    // ======================================================

    const payment =
      webhookEvent.payload?.payment?.entity;

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook payment payload missing.",
        },
        { status: 400 }
      );
    }

    const razorpayPaymentId = String(
      payment.id || ""
    ).trim();

    const razorpayOrderId = String(
      payment.order_id || ""
    ).trim();

    const currency = String(
      payment.currency || ""
    ).trim();

    const amountInPaise = Number(
      payment.amount
    );

    if (
      !razorpayPaymentId ||
      !razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook payment/order ID missing.",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // CAPTURED CHECK
    // ======================================================

    if (
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
        message:
          "Payment captured state में नहीं है.",
      });
    }

    // ======================================================
    // CURRENCY
    // ======================================================

    if (currency !== "INR") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook payment currency invalid.",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // AMOUNT
    // ======================================================

    if (
      !Number.isSafeInteger(amountInPaise) ||
      amountInPaise <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook payment amount invalid.",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // SAFE SHARED WALLET CREDIT
    // ======================================================

    const result =
      await creditWalletFromRazorpayPayment({
        razorpayOrderId,
        razorpayPaymentId,
        amountInPaise,
        currency,
      });

    console.log(
      "RAZORPAY WEBHOOK WALLET CREDIT:",
      {
        transactionId:
          result.transaction.transactionId,

        paymentId:
          razorpayPaymentId,

        alreadyProcessed:
          result.alreadyProcessed,

        balance:
          result.wallet.availableBalance.toString(),
      }
    );

    // ======================================================
    // SUCCESS
    // ======================================================

    return NextResponse.json({
      success: true,

      alreadyProcessed:
        result.alreadyProcessed,

      transactionId:
        result.transaction.transactionId,
    });
  } catch (error) {
    console.error(
      "RAZORPAY WEBHOOK ERROR:",
      error
    );

    // ======================================================
    // DUPLICATE / CONCURRENT DELIVERY
    //
    // Razorpay webhook retry कर सकता है।
    // अगर browser verify उसी transaction को process कर
    // रहा है तो यहाँ wallet दोबारा credit नहीं होगा।
    // ======================================================

    if (
      error instanceof Error &&
      error.message ===
        "WALLET_TRANSACTION_BUSY"
    ) {
      return NextResponse.json({
        success: true,
        processing: true,
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "WALLET_TRANSACTION_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet transaction not found.",
        },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "PAYMENT_AMOUNT_MISMATCH"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook payment amount mismatch.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "WALLET_NOT_ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet is not active.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Razorpay webhook process नहीं हो सका.",
      },
      { status: 500 }
    );
  }
}