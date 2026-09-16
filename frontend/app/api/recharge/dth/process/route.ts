import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dthRechargeProvider } from "@/lib/providers/recharge/provider";

export const runtime = "nodejs";

type DthDescription = {
  bookingType?: string;

  dth?: {
    customerId?: string;
    operator?: string;
  };

  payment?: {
    amount?: number;
    currency?: string;
  };
};

function parseDthDescription(
  description: string | null
): DthDescription {
  if (!description) {
    return {};
  }

  try {
    return JSON.parse(
      description
    ) as DthDescription;
  } catch {
    return {};
  }
}

// ======================================================
// DTH PROCESS
// ======================================================

export async function POST(
  request: Request
) {
  try {
    console.log("================================");
    console.log("DTH PROCESS API CALLED");
    console.log("================================");

    // ==================================================
    // AUTH
    // ==================================================

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

    // ==================================================
    // REQUEST BODY
    // ==================================================

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
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // FIND TRANSACTION
    // ==================================================

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          transactionId,
          userId: user.id,
          service: "DTH_RECHARGE",
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "DTH transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    const status = String(
      transaction.status || ""
    ).toUpperCase();

    const details =
      parseDthDescription(
        transaction.description
      );

    const customerId =
      details.dth?.customerId ||
      transaction.referenceId ||
      "";

    const providerFallback =
      transaction.provider &&
      transaction.provider.toUpperCase() !==
        "RAZORPAY"
        ? transaction.provider
        : "";

    const operator =
      details.dth?.operator ||
      providerFallback;

    const currency =
      details.payment?.currency ||
      "INR";

    const amount = Number(
      transaction.amount
    );

    // ==================================================
    // ALREADY COMPLETED
    // ==================================================

    if (status === "DTH_SUCCESS") {
      return NextResponse.json(
        {
          success: true,

          message:
            "DTH recharge already processed successfully.",

          transactionId:
            transaction.transactionId,

          amount:
            transaction.amount.toString(),

          status:
            transaction.status,

          processed: true,
          alreadyProcessed: true,

          dth: {
            customerId,
            operator,
          },

          payment: {
            currency,

            provider:
              transaction.razorpayPaymentId
                ? "RAZORPAY"
                : transaction.provider,

            razorpayOrderId:
              transaction.razorpayOrderId,

            razorpayPaymentId:
              transaction.razorpayPaymentId,
          },
        },
        {
          status: 200,
        }
      );
    }

    // ==================================================
    // PAYMENT MUST BE VERIFIED
    // ==================================================

    if (status !== "SUCCESS") {
      return NextResponse.json(
        {
          success: false,

          message:
            `Payment is not successful yet. Current status: ${transaction.status}`,
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // TRANSACTION DATA CHECK
    // ==================================================

    if (
      !customerId ||
      !operator ||
      !Number.isFinite(amount)
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "DTH transaction data is incomplete.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // INTERNAL PROVIDER STATUS
    // ==================================================

    const providerHealth =
      await dthRechargeProvider.healthCheck();

    const providerReady =
      providerHealth.success &&
      providerHealth.data?.configured ===
        true &&
      providerHealth.data?.available ===
        true &&
      providerHealth.data?.status ===
        "ACTIVE";

    // ==================================================
    // PROVIDER NOT ACTIVE
    // ==================================================

    if (!providerReady) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Payment verified है, लेकिन DTH provider अभी active नहीं है। DTH recharge process नहीं किया गया है.",

          errorCode:
            "DTH_PROVIDER_NOT_ACTIVE",

          paymentVerified: true,

          processed: false,

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

            amount:
              transaction.amount.toString(),

            status:
              transaction.status,
          },

          dth: {
            customerId,
            operator,
          },

          payment: {
            currency,

            provider:
              transaction.razorpayPaymentId
                ? "RAZORPAY"
                : transaction.provider,

            razorpayOrderId:
              transaction.razorpayOrderId,

            razorpayPaymentId:
              transaction.razorpayPaymentId,
          },
        },
        {
          status: 503,
        }
      );
    }

    // ==================================================
    // LIVE PROVIDER WORKFLOW NOT IMPLEMENTED
    //
    // IMPORTANT:
    // Provider ACTIVE होने का मतलब recharge SUCCESS
    // नहीं है.
    //
    // Future flow:
    //
    // 1. Send recharge request to authorized provider
    // 2. Receive provider reference
    // 3. Verify provider transaction status
    // 4. Only verified SUCCESS may update:
    //
    //       status = "DTH_SUCCESS"
    //
    // DTH_TEST_MODE intentionally removed from this
    // production-safe processing route.
    // ==================================================

    return NextResponse.json(
      {
        success: false,

        message:
          "DTH provider active है, लेकिन live DTH recharge workflow अभी enabled नहीं है.",

        errorCode:
          "DTH_WORKFLOW_NOT_IMPLEMENTED",

        paymentVerified: true,

        processed: false,

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

          amount:
            transaction.amount.toString(),

          status:
            transaction.status,
        },

        dth: {
          customerId,
          operator,
        },

        payment: {
          currency,

          provider:
            transaction.razorpayPaymentId
              ? "RAZORPAY"
              : transaction.provider,

          razorpayOrderId:
            transaction.razorpayOrderId,

          razorpayPaymentId:
            transaction.razorpayPaymentId,
        },
      },
      {
        status: 503,
      }
    );
  } catch (error) {
    console.error(
      "DTH PROCESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "DTH recharge processing failed. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}