import crypto from "crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditWalletFromRazorpayPayment } from "@/lib/wallet-credit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // ======================================================
    // AUTH
    // ======================================================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ======================================================
    // BODY
    // ======================================================

    const body = await request.json();

    const transactionId = String(
      body?.transactionId || ""
    ).trim();

    const razorpayOrderId = String(
      body?.razorpay_order_id || ""
    ).trim();

    const razorpayPaymentId = String(
      body?.razorpay_payment_id || ""
    ).trim();

    const razorpaySignature = String(
      body?.razorpay_signature || ""
    ).trim();

    if (
      !transactionId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification details incomplete हैं।",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // RAZORPAY CONFIG
    // ======================================================

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("RAZORPAY KEYS MISSING");

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment gateway configure नहीं है।",
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // ======================================================
    // GET WALLET TRANSACTION
    // ======================================================

    const walletTransaction =
      await prisma.walletTransaction.findUnique({
        where: {
          transactionId,
        },
      });

    if (!walletTransaction) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet transaction नहीं मिली।",
        },
        { status: 404 }
      );
    }

    // ======================================================
    // OWNERSHIP
    // ======================================================

    if (walletTransaction.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized transaction.",
        },
        { status: 403 }
      );
    }

    // ======================================================
    // DATABASE ORDER ID MUST MATCH
    // ======================================================

    if (
      !walletTransaction.razorpayOrderId ||
      walletTransaction.razorpayOrderId !==
        razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay order ID match नहीं हुई।",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // ALREADY SUCCESS
    // ======================================================

    if (walletTransaction.status === "SUCCESS") {
      const wallet =
        await prisma.wallet.findUnique({
          where: {
            id: walletTransaction.walletId,
          },
        });

      return NextResponse.json({
        success: true,
        alreadyVerified: true,

        message:
          "Payment पहले ही verify हो चुका है।",

        wallet: wallet
          ? {
              availableBalance:
                wallet.availableBalance.toString(),

              lockedBalance:
                wallet.lockedBalance.toString(),

              status: wallet.status,
            }
          : null,

        transaction: {
          transactionId:
            walletTransaction.transactionId,

          amount:
            walletTransaction.amount.toString(),

          status:
            walletTransaction.status,
        },
      });
    }

    // ======================================================
    // PROCESSING
    //
    // Webhook browser verify से पहले transaction claim
    // कर सकता है।
    // ======================================================

    if (walletTransaction.status === "PROCESSING") {
      return NextResponse.json(
        {
          success: false,
          processing: true,
          message:
            "Payment process हो रही है। कृपया कुछ सेकंड बाद wallet check करें।",
        },
        { status: 409 }
      );
    }

    if (walletTransaction.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message:
            `Transaction status ${walletTransaction.status} है।`,
        },
        { status: 409 }
      );
    }

    // ======================================================
    // VERIFY CHECKOUT SIGNATURE
    // ======================================================

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`
      )
      .digest("hex");

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      razorpaySignature,
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
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // FETCH PAYMENT DIRECTLY FROM RAZORPAY
    // ======================================================

    const payment =
      await razorpay.payments.fetch(
        razorpayPaymentId
      );

    // ======================================================
    // VERIFY PAYMENT -> ORDER RELATION
    // ======================================================

    if (payment.order_id !== razorpayOrderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment संबंधित Razorpay order से match नहीं करती।",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // VERIFY CURRENCY
    // ======================================================

    if (payment.currency !== "INR") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment currency invalid है।",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // VERIFY EXACT AMOUNT
    // ======================================================

    const expectedAmountInPaise =
      Math.round(
        Number(walletTransaction.amount) * 100
      );

    const paidAmountInPaise =
      Number(payment.amount);

    if (
      !Number.isSafeInteger(paidAmountInPaise) ||
      paidAmountInPaise !==
        expectedAmountInPaise
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount transaction amount से match नहीं करती।",
        },
        { status: 400 }
      );
    }

    // ======================================================
    // VERIFY PAYMENT CAPTURED
    // ======================================================

    if (
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment अभी successfully captured नहीं हुई है। Wallet credit नहीं किया गया।",
        },
        { status: 409 }
      );
    }

    // ======================================================
    // SHARED SAFE WALLET CREDIT
    //
    // Browser verify और Razorpay webhook दोनों अब
    // इसी function से wallet credit करेंगे।
    // ======================================================

    const result =
      await creditWalletFromRazorpayPayment({
        razorpayOrderId,
        razorpayPaymentId,
        amountInPaise: paidAmountInPaise,
        currency: payment.currency,
        razorpaySignature,
      });

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json({
      success: true,

      alreadyVerified:
        result.alreadyProcessed,

      message:
        result.alreadyProcessed
          ? "Payment पहले ही verify हो चुका है।"
          : "Payment Razorpay से verify हुई और wallet balance successfully credit हो गया।",

      wallet: {
        availableBalance:
          result.wallet.availableBalance.toString(),

        lockedBalance:
          result.wallet.lockedBalance.toString(),

        status:
          result.wallet.status,
      },

      transaction: {
        transactionId:
          result.transaction.transactionId,

        amount:
          result.transaction.amount.toString(),

        status:
          result.transaction.status,

        balanceBefore:
          result.transaction.balanceBefore.toString(),

        balanceAfter:
          result.transaction.balanceAfter.toString(),

        razorpayOrderId:
          result.transaction.razorpayOrderId,

        razorpayPaymentId:
          result.transaction.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error(
      "WALLET ADD MONEY VERIFY ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "WALLET_TRANSACTION_BUSY"
    ) {
      return NextResponse.json(
        {
          success: false,
          processing: true,
          message:
            "Payment process हो रही है। कृपया कुछ सेकंड बाद wallet check करें।",
        },
        { status: 409 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "WALLET_NOT_ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet अभी active नहीं है।",
        },
        { status: 403 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "WALLET_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet नहीं मिला।",
        },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "WALLET_USER_MISMATCH"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet ownership verification failed.",
        },
        { status: 403 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "PAYMENT_AMOUNT_MISMATCH"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount transaction amount से match नहीं करती।",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Wallet payment verify नहीं हो सका।",
      },
      { status: 500 }
    );
  }
}