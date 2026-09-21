import crypto from "crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
          message:
            "Unauthorized transaction.",
        },
        { status: 403 }
      );
    }

    // ======================================================
    // IDEMPOTENCY
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
    //
    // Checkout response पर अकेले भरोसा नहीं करेंगे।
    // Server Razorpay API से actual payment verify करेगा।
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
    //
    // DB amount = rupees
    // Razorpay amount = paise
    // ======================================================

    const expectedAmountInPaise =
      Math.round(
        Number(walletTransaction.amount) * 100
      );

    const paidAmountInPaise =
      Number(payment.amount);

    if (
      !Number.isFinite(paidAmountInPaise) ||
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
    //
    // Wallet credit केवल captured payment पर होगा।
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
    // ATOMIC WALLET CREDIT
    //
    // 1. PENDING transaction claim
    // 2. Wallet credit
    // 3. Ledger SUCCESS
    //
    // एक ही DB transaction में।
    // ======================================================

    const result = await prisma.$transaction(
      async (tx) => {
        const claimed =
          await tx.walletTransaction.updateMany({
            where: {
              id: walletTransaction.id,
              userId: user.id,
              status: "PENDING",
            },

            data: {
              status: "PROCESSING",
            },
          });

        if (claimed.count !== 1) {
          throw new Error(
            "WALLET_TRANSACTION_ALREADY_PROCESSED"
          );
        }

        // ==================================================
        // CURRENT WALLET
        // ==================================================

        const currentWallet =
          await tx.wallet.findUnique({
            where: {
              id: walletTransaction.walletId,
            },
          });

        if (!currentWallet) {
          throw new Error(
            "WALLET_NOT_FOUND"
          );
        }

        if (currentWallet.userId !== user.id) {
          throw new Error(
            "WALLET_USER_MISMATCH"
          );
        }

        if (currentWallet.status !== "ACTIVE") {
          throw new Error(
            "WALLET_NOT_ACTIVE"
          );
        }

        const balanceBefore =
          currentWallet.availableBalance;

        // ==================================================
        // CREDIT WALLET
        // ==================================================

        const updatedWallet =
          await tx.wallet.update({
            where: {
              id: currentWallet.id,
            },

            data: {
              availableBalance: {
                increment:
                  walletTransaction.amount,
              },
            },
          });

        // ==================================================
        // UPDATE LEDGER
        // ==================================================

        const updatedTransaction =
          await tx.walletTransaction.update({
            where: {
              id: walletTransaction.id,
            },

            data: {
              status: "SUCCESS",

              balanceBefore,

              balanceAfter:
                updatedWallet.availableBalance,

              razorpayPaymentId,

              razorpaySignature,

              referenceId:
                razorpayPaymentId,
            },
          });

        return {
          wallet: updatedWallet,
          transaction:
            updatedTransaction,
        };
      }
    );

    // ======================================================
    // RESPONSE
    // ======================================================

    return NextResponse.json({
      success: true,

      message:
        "Payment Razorpay से verify हुई और wallet balance successfully credit हो गया।",

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
      error.message ===
        "WALLET_TRANSACTION_ALREADY_PROCESSED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "यह wallet transaction पहले ही process हो रही है या process हो चुकी है।",
        },
        { status: 409 }
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
            "Wallet अभी active नहीं है।",
        },
        { status: 403 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "WALLET_NOT_FOUND"
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
      error.message ===
        "WALLET_USER_MISMATCH"
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