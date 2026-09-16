import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepaidRechargeProvider } from "@/lib/providers/recharge/provider";

export const runtime = "nodejs";

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
    return JSON.parse(
      description
    ) as RechargeDescription;
  } catch {
    return {};
  }
}

export async function POST(
  request: Request
) {
  try {
    // ================================================
    // AUTH
    // ================================================

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

    // ================================================
    // REQUEST
    // ================================================

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
          message:
            "Transaction ID is required.",
        },
        { status: 400 }
      );
    }

    // ================================================
    // TRANSACTION
    // ================================================

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
          message:
            "Prepaid recharge transaction not found.",
        },
        { status: 404 }
      );
    }

    const details =
      parseRechargeDescription(
        transaction.description
      );

    const mobile =
      details.recharge?.mobile ||
      transaction.referenceId ||
      "";

    const providerFallback =
      transaction.provider &&
      transaction.provider.toUpperCase() !==
        "RAZORPAY"
        ? transaction.provider
        : "";

    const operator =
      details.recharge?.operator ||
      providerFallback;

    const circle =
      details.recharge?.circle || "";

    const currency =
      details.payment?.currency || "INR";

    const amount = Number(
      transaction.amount
    );

    // ================================================
    // ALREADY COMPLETED
    // ================================================

    if (
      transaction.status ===
      "RECHARGE_SUCCESS"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Recharge already completed.",

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

    // ================================================
    // PAYMENT MUST BE VERIFIED
    // ================================================

    if (
      transaction.status !== "SUCCESS"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            `Payment is not successful yet. Current status: ${transaction.status}`,
        },
        { status: 400 }
      );
    }

    // ================================================
    // TRANSACTION DATA CHECK
    // ================================================

    if (
      !mobile ||
      !operator ||
      !circle ||
      !Number.isFinite(amount)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Prepaid recharge transaction data is incomplete.",
        },
        { status: 400 }
      );
    }

    // ================================================
    // INTERNAL PROVIDER STATUS
    // ================================================

    const providerHealth =
      await prepaidRechargeProvider.healthCheck();

    const providerReady =
      providerHealth.success &&
      providerHealth.data?.configured ===
        true &&
      providerHealth.data?.available ===
        true &&
      providerHealth.data?.status ===
        "ACTIVE";

    if (!providerReady) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Payment verified है, लेकिन Mobile Prepaid provider अभी active नहीं है। Recharge process नहीं किया गया है.",

          errorCode:
            "RECHARGE_PROVIDER_NOT_ACTIVE",

          paymentVerified: true,

          provider: {
            name:
              providerHealth.provider ||
              "Recharge Provider",

            status:
              providerHealth.data
                ?.status ||
              "NOT_CONFIGURED",

            configured:
              providerHealth.data
                ?.configured ??
              false,

            available:
              providerHealth.data
                ?.available ??
              false,
          },

          transaction: {
            transactionId:
              transaction.transactionId,

            status:
              transaction.status,

            amount:
              transaction.amount.toString(),
          },
        },
        { status: 503 }
      );
    }

    // ================================================
    // LIVE PROVIDER WORKFLOW NOT IMPLEMENTED YET
    //
    // IMPORTANT:
    // Provider ACTIVE होना अकेले recharge success का
    // प्रमाण नहीं है.
    //
    // Future flow:
    // 1. Send recharge request to authorized provider
    // 2. Receive provider reference
    // 3. Verify provider transaction status
    // 4. Only verified SUCCESS may update DB to
    //    RECHARGE_SUCCESS
    // ================================================

    return NextResponse.json(
      {
        success: false,

        message:
          "Recharge provider active है, लेकिन live Mobile Prepaid recharge workflow अभी enabled नहीं है.",

        errorCode:
          "RECHARGE_WORKFLOW_NOT_IMPLEMENTED",

        paymentVerified: true,

        provider: {
          name:
            providerHealth.provider ||
            "Recharge Provider",

          status:
            providerHealth.data?.status,
        },

        transaction: {
          transactionId:
            transaction.transactionId,

          status:
            transaction.status,

          amount:
            transaction.amount.toString(),
        },
      },
      { status: 503 }
    );
  } catch (error) {
    console.error(
      "RECHARGE PROCESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Recharge processing failed.",
      },
      { status: 500 }
    );
  }
}