import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    // ================= GET TRANSACTIONS =================

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
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
        razorpayOrderId: true,
        razorpayPaymentId: true,
      },
    });

    // ================= RESPONSE =================

    return NextResponse.json({
      success: true,

      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        transactionId: transaction.transactionId,

        service: transaction.service,
        category: transaction.category,

        description: transaction.description,

        amount: transaction.amount.toString(),

        status: transaction.status,

        referenceId: transaction.referenceId,
        provider: transaction.provider,

        createdAt: transaction.createdAt.toISOString(),

        razorpayOrderId: transaction.razorpayOrderId,
        razorpayPaymentId: transaction.razorpayPaymentId,
      })),
    });
  } catch (error) {
    console.error("PAYMENT HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load payment history.",
      },
      { status: 500 }
    );
  }
}