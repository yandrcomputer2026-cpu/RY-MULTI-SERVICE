import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    // ================= USER CHECK =================

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

    // ================= ENV CHECK =================

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay keys are missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Razorpay configuration is missing.",
        },
        { status: 500 }
      );
    }

    // ================= REQUEST DATA =================

    const body = await request.json();

    const transactionId = String(
      body.transactionId || ""
    ).trim();

    const razorpayPaymentId = String(
      body.razorpay_payment_id || ""
    ).trim();

    const razorpayOrderId = String(
      body.razorpay_order_id || ""
    ).trim();

    const razorpaySignature = String(
      body.razorpay_signature || ""
    ).trim();

    if (
      !transactionId ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification data is incomplete.",
        },
        { status: 400 }
      );
    }

    // ================= FIND TRANSACTION =================

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          transactionId,
          userId: user.id,
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found.",
        },
        { status: 404 }
      );
    }

    // ================= ALREADY SUCCESS =================

    if (
      transaction.status === "SUCCESS" ||
      transaction.status === "RECHARGE_SUCCESS"
    ) {
      return NextResponse.json({
        success: true,

        message: "Payment already verified.",

        transaction: {
          transactionId:
            transaction.transactionId,

          amount:
            transaction.amount.toString(),

          status:
            transaction.status,

          razorpayOrderId:
            transaction.razorpayOrderId,

          razorpayPaymentId:
            transaction.razorpayPaymentId,
        },
      });
    }

    // ================= ORDER MUST EXIST =================

    if (!transaction.razorpayOrderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay order not found in database.",
        },
        { status: 400 }
      );
    }

    // ================= ORDER ID CHECK =================

    if (
      transaction.razorpayOrderId !==
      razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay order mismatch.",
        },
        { status: 400 }
      );
    }

    // ================= SIGNATURE VERIFY =================

    const generatedSignature =
      crypto
        .createHmac("sha256", keySecret)
        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest("hex");

    const receivedBuffer =
      Buffer.from(razorpaySignature, "utf8");

    const generatedBuffer =
      Buffer.from(generatedSignature, "utf8");

    if (
      receivedBuffer.length !==
      generatedBuffer.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment signature.",
        },
        { status: 400 }
      );
    }

    const signatureValid =
      crypto.timingSafeEqual(
        receivedBuffer,
        generatedBuffer
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

    // ================= RAZORPAY API =================

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const payment =
      await razorpay.payments.fetch(
        razorpayPaymentId
      );

    // ================= PAYMENT ORDER CHECK =================

    if (
      payment.order_id !==
      transaction.razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment does not belong to this order.",
        },
        { status: 400 }
      );
    }

    // ================= PAYMENT AMOUNT CHECK =================

    const transactionAmountInPaise =
      Math.round(
        Number(transaction.amount) * 100
      );

    if (
      Number(payment.amount) !==
      transactionAmountInPaise
    ) {
      console.error(
        "PAYMENT AMOUNT MISMATCH",
        {
          transactionAmount:
            transactionAmountInPaise,

          razorpayAmount:
            payment.amount,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount does not match transaction amount.",
        },
        { status: 400 }
      );
    }

    // ================= PAYMENT STATUS =================

    if (payment.status !== "captured") {
      return NextResponse.json(
        {
          success: false,
          message:
            `Payment status is ${payment.status}.`,
        },
        { status: 400 }
      );
    }

    // ================= DATABASE UPDATE =================

    const updatedTransaction =
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "SUCCESS",

          provider: "RAZORPAY",

          razorpayOrderId:
            transaction.razorpayOrderId,

          razorpayPaymentId:
            razorpayPaymentId,

          razorpaySignature:
            razorpaySignature,
        },
      });

    // ================= RESPONSE =================

    return NextResponse.json({
      success: true,

      message:
        "Payment verified successfully.",

      transaction: {
        transactionId:
          updatedTransaction.transactionId,

        amount:
          updatedTransaction.amount.toString(),

        status:
          updatedTransaction.status,

        provider:
          updatedTransaction.provider,

        razorpayOrderId:
          updatedTransaction.razorpayOrderId,

        razorpayPaymentId:
          updatedTransaction.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error(
      "RAZORPAY VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}