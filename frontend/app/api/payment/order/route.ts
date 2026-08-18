import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction ID is required.",
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

    // ================= CHECK STATUS =================

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: `Transaction is already ${transaction.status}.`,
        },
        { status: 400 }
      );
    }

    // ================= AMOUNT =================

    const amountInPaise = Math.round(
      Number(transaction.amount) * 100
    );

    if (
      !Number.isInteger(amountInPaise) ||
      amountInPaise <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid transaction amount.",
        },
        { status: 400 }
      );
    }

    // ================= RAZORPAY =================

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // ================= EXISTING ORDER =================

    if (transaction.razorpayOrderId) {
      try {
        const existingOrder =
          await razorpay.orders.fetch(
            transaction.razorpayOrderId
          );

        if (
          existingOrder &&
          existingOrder.status !== "paid" &&
          Number(existingOrder.amount) === amountInPaise
        ) {
          return NextResponse.json({
            success: true,

            order: {
              id: existingOrder.id,
              amount: existingOrder.amount,
              currency: existingOrder.currency,
            },

            transaction: {
              transactionId: transaction.transactionId,
              amount: transaction.amount.toString(),
            },

            keyId,
          });
        }
      } catch (error) {
        console.warn(
          "Existing Razorpay order could not be fetched. Creating a new order.",
          error
        );
      }
    }

    // ================= CREATE NEW ORDER =================

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: transaction.transactionId,

      notes: {
        transactionId: transaction.transactionId,
        userId: String(user.id),
        service: transaction.service,
      },
    });

    // ================= SAVE RAZORPAY DETAILS =================

    await prisma.transaction.update({
      where: {
        id: transaction.id,
      },

      data: {
        razorpayOrderId: order.id,
        provider: "RAZORPAY",
      },
    });

    // ================= RESPONSE =================

    return NextResponse.json({
      success: true,

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      transaction: {
        transactionId: transaction.transactionId,
        amount: transaction.amount.toString(),
      },

      // केवल public Key ID frontend को जाएगी.
      // Secret कभी frontend को नहीं भेजना है.
      keyId,
    });
  } catch (error) {
    console.error(
      "RAZORPAY ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}