import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      transactionId: string;
    }>;
  }
) {
  try {
    // ===============================
    // LOGIN CHECK
    // ===============================

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

    // ===============================
    // GET TRANSACTION ID
    // ===============================

    const { transactionId } = await context.params;

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ===============================
    // FIND TRANSACTION
    // ===============================
    // IMPORTANT:
    // userId भी साथ में check किया गया है।
    // इससे कोई दूसरा user किसी और की transaction
    // URL बदलकर नहीं देख सकता।
    // ===============================

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          transactionId,
          userId: user.id,
        },

        select: {
          id: true,
          transactionId: true,
          service: true,
          category: true,
          description: true,
          amount: true,
          status: true,
          referenceId: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
        },
      });

    // ===============================
    // TRANSACTION NOT FOUND
    // ===============================

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction नहीं मिली।",
        },
        {
          status: 404,
        }
      );
    }

    // ===============================
    // RESPONSE
    // ===============================

    return NextResponse.json({
      success: true,

      transaction: {
        id: transaction.id,

        transactionId:
          transaction.transactionId,

        service:
          transaction.service,

        category:
          transaction.category,

        description:
          transaction.description,

        amount:
          transaction.amount.toString(),

        status:
          transaction.status,

        referenceId:
          transaction.referenceId,

        provider:
          transaction.provider,

        createdAt:
          transaction.createdAt.toISOString(),

        updatedAt:
          transaction.updatedAt.toISOString(),

        razorpayOrderId:
          transaction.razorpayOrderId,

        razorpayPaymentId:
          transaction.razorpayPaymentId,
      },
    });

  } catch (error) {
    console.error(
      "TRANSACTION DETAILS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}