import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const amount = Number(body?.amount);

    if (!Number.isFinite(amount)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid amount डालना जरूरी है।",
        },
        { status: 400 }
      );
    }

    if (amount < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum Add Money amount ₹10 है।",
        },
        { status: 400 }
      );
    }

    if (amount > 100000) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum Add Money amount ₹1,00,000 है।",
        },
        { status: 400 }
      );
    }

    // Maximum 2 decimal places
    const normalizedAmount = Math.round(amount * 100) / 100;

    // ======================================================
    // RAZORPAY CONFIG
    // ======================================================

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("RAZORPAY KEYS MISSING");

      return NextResponse.json(
        {
          success: false,
          message: "Payment gateway configure नहीं है।",
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // ======================================================
    // GET / CREATE WALLET
    // ======================================================

    const wallet = await prisma.wallet.upsert({
      where: {
        userId: user.id,
      },

      update: {},

      create: {
        userId: user.id,
        availableBalance: 0,
        lockedBalance: 0,
        status: "ACTIVE",
      },
    });

    if (wallet.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet अभी active नहीं है।",
        },
        { status: 403 }
      );
    }

    // ======================================================
    // INTERNAL TRANSACTION ID
    // ======================================================

    const internalTransactionId =
      `RYWAL-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // ======================================================
    // CREATE RAZORPAY ORDER
    // Razorpay amount = paise
    // ======================================================

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(normalizedAmount * 100),
      currency: "INR",

      receipt: internalTransactionId.slice(0, 40),

      notes: {
        userId: String(user.id),
        walletId: String(wallet.id),
        type: "WALLET_ADD_MONEY",
        transactionId: internalTransactionId,
      },
    });

    // ======================================================
    // CREATE PENDING WALLET LEDGER ENTRY
    //
    // IMPORTANT:
    // Balance is NOT increased here.
    // Wallet will only be credited after Razorpay signature verification.
    // ======================================================

    const walletTransaction = await prisma.walletTransaction.create({
      data: {
        transactionId: internalTransactionId,

        walletId: wallet.id,
        userId: user.id,

        type: "CREDIT",
        source: "ADD_MONEY",

        amount: normalizedAmount,

        balanceBefore: wallet.availableBalance,
        balanceAfter: wallet.availableBalance,

        status: "PENDING",

        referenceId: razorpayOrder.id,

        description: JSON.stringify({
          bookingType: "WALLET_ADD_MONEY",
          payment: {
            amount: normalizedAmount,
            currency: "INR",
          },
        }),

        razorpayOrderId: razorpayOrder.id,
      },
    });

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json({
      success: true,

      message: "Wallet Add Money order created.",

      keyId,

      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },

      transaction: {
        transactionId: walletTransaction.transactionId,
        amount: walletTransaction.amount.toString(),
        status: walletTransaction.status,
      },
    });
  } catch (error) {
    console.error("WALLET ADD MONEY ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Wallet Add Money order create नहीं हो सका।",
      },
      { status: 500 }
    );
  }
}