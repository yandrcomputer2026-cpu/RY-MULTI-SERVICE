import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RechargeDescription = {
  bookingType?: string;

  recharge?: {
    mobile?: string;
    operator?: string;
    circle?: string;
  };

  payment?: {
    amount?: number;
    currency?: string;
  };
};

function parseRechargeDescription(
  description: string | null
): RechargeDescription {
  if (!description) {
    return {};
  }

  try {
    return JSON.parse(description) as RechargeDescription;
  } catch {
    // Old prepaid transactions used plain-text descriptions.
    // They remain supported through referenceId/provider fallbacks below.
    return {};
  }
}

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

    // ================= REQUEST DATA =================

    let body: {
      transactionId?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    const transactionId = String(
      body.transactionId ?? ""
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
          service: "MOBILE_PREPAID",
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Prepaid recharge transaction not found.",
        },
        { status: 404 }
      );
    }

    // ================= READ RECHARGE DETAILS =================

    const details =
      parseRechargeDescription(
        transaction.description
      );

    const mobile =
      details.recharge?.mobile ||
      transaction.referenceId ||
      "";

    /*
     * New transactions keep the real mobile operator in description.
     * Old transactions may still have it in provider.
     * Do not use RAZORPAY as the mobile operator.
     */
    const providerFallback =
      transaction.provider &&
      transaction.provider.toUpperCase() !== "RAZORPAY"
        ? transaction.provider
        : "";

    const operator =
      details.recharge?.operator ||
      providerFallback;

    const circle =
      details.recharge?.circle || "";

    const currency =
      details.payment?.currency || "INR";

    // ================= ALREADY RECHARGED =================

    if (
      transaction.status ===
      "RECHARGE_SUCCESS"
    ) {
      return NextResponse.json({
        success: true,
        message: "Recharge already completed.",

        recharge: {
          transactionId:
            transaction.transactionId,

          mobile,

          operator,

          circle,

          amount:
            transaction.amount.toString(),

          currency,

          status:
            transaction.status,

          paymentProvider:
            transaction.razorpayPaymentId
              ? "RAZORPAY"
              : transaction.provider,

          razorpayOrderId:
            transaction.razorpayOrderId,

          razorpayPaymentId:
            transaction.razorpayPaymentId,
        },
      });
    }

    // ================= PAYMENT CHECK =================

    if (transaction.status !== "SUCCESS") {
      return NextResponse.json(
        {
          success: false,

          message:
            `Payment is not successful yet. Current status: ${transaction.status}`,
        },
        { status: 400 }
      );
    }

    // ================= TEST RECHARGE =================
    //
    // अभी यह TEST recharge है.
    // वास्तविक recharge provider API integration
    // बाद में इसी section में लगाया जाएगा.
    // =================================================

    const updatedTransaction =
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "RECHARGE_SUCCESS",
        },
      });

    // ================= RESPONSE =================

    return NextResponse.json({
      success: true,

      message: "Recharge successful.",

      recharge: {
        transactionId:
          updatedTransaction.transactionId,

        mobile,

        operator,

        circle,

        amount:
          updatedTransaction.amount.toString(),

        currency,

        status:
          updatedTransaction.status,

        paymentProvider:
          updatedTransaction.razorpayPaymentId
            ? "RAZORPAY"
            : updatedTransaction.provider,

        razorpayOrderId:
          updatedTransaction.razorpayOrderId,

        razorpayPaymentId:
          updatedTransaction.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error(
      "RECHARGE PROCESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Recharge processing failed.",
      },
      { status: 500 }
    );
  }
}
