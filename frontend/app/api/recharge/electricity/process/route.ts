import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  electricityProvider,
} from "@/lib/providers/bbps/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ElectricityDescription = {
  bookingType?: string;

  electricity?: {
    consumerNumber?: string;
    operator?: string;
  };

  payment?: {
    amount?: number;
    currency?: string;
  };
};

// ======================================================
// PARSE DESCRIPTION
// ======================================================

function parseElectricityDescription(
  description: string | null
): ElectricityDescription {
  if (!description) {
    return {};
  }

  try {
    return JSON.parse(
      description
    ) as ElectricityDescription;
  } catch {
    return {};
  }
}

// ======================================================
// ELECTRICITY PROCESS
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("ELECTRICITY PROCESS API CALLED");
    console.log("================================");

    // ==================================================
    // USER CHECK
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
    // FIND ELECTRICITY TRANSACTION
    // ==================================================

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          transactionId,
          userId: user.id,
          service: "ELECTRICITY_BILL",
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Electricity transaction not found.",
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
      parseElectricityDescription(
        transaction.description
      );

    const consumerNumber = String(
      details.electricity?.consumerNumber ||
        transaction.referenceId ||
        ""
    ).trim();

    const providerFallback =
      transaction.provider &&
      transaction.provider.toUpperCase() !==
        "RAZORPAY"
        ? transaction.provider
        : "";

    const operator = String(
      details.electricity?.operator ||
        providerFallback ||
        ""
    ).trim();

    const amount =
      Number(details.payment?.amount) ||
      Number(transaction.amount);

    const currency =
      details.payment?.currency || "INR";

    // ==================================================
    // ALREADY PROCESSED
    // ==================================================

    if (status === "ELECTRICITY_SUCCESS") {
      return NextResponse.json(
        {
          success: true,

          message:
            "Electricity bill already processed successfully.",

          transactionId:
            transaction.transactionId,

          amount:
            transaction.amount.toString(),

          status:
            transaction.status,

          processed: true,
          alreadyProcessed: true,

          electricity: {
            consumerNumber,
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
    // PAYMENT MUST BE VERIFIED FIRST
    //
    // SUCCESS = Razorpay payment verified.
    // It does NOT mean BBPS bill payment succeeded.
    // ==================================================

    if (status !== "SUCCESS") {
      return NextResponse.json(
        {
          success: false,

          message:
            `Payment is not successful yet. Current status: ${transaction.status}`,

          code:
            "PAYMENT_NOT_VERIFIED",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // TRANSACTION DATA VALIDATION
    // ==================================================

    if (!consumerNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Electricity consumer number is missing.",
          code:
            "INVALID_ELECTRICITY_DATA",
        },
        {
          status: 400,
        }
      );
    }

    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Electricity operator information is missing.",
          code:
            "INVALID_ELECTRICITY_DATA",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Electricity bill amount is invalid.",
          code:
            "INVALID_ELECTRICITY_DATA",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // BBPS PROVIDER HEALTH CHECK
    // ==================================================

    const providerHealth =
      await electricityProvider.healthCheck();

    const providerReady =
      providerHealth.success === true &&
      providerHealth.data?.configured === true &&
      providerHealth.data?.available === true &&
      providerHealth.data?.status === "ACTIVE";

    // ==================================================
    // PROVIDER NOT READY
    //
    // Payment may already be verified.
    // Never mark ELECTRICITY_SUCCESS here.
    // ==================================================

    if (!providerReady) {
      console.warn(
        "ELECTRICITY BBPS PROVIDER NOT ACTIVE:",
        {
          transactionId:
            transaction.transactionId,

          providerStatus:
            providerHealth.data?.status,
        }
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Payment verified है, लेकिन Electricity BBPS provider अभी active नहीं है। Bill को successful mark नहीं किया गया है।",

          code:
            "ELECTRICITY_PROVIDER_NOT_ACTIVE",

          paymentVerified: true,
          processed: false,

          provider: {
            configured:
              providerHealth.data
                ?.configured ?? false,

            available:
              providerHealth.data
                ?.available ?? false,

            status:
              providerHealth.data
                ?.status ?? "ERROR",

            message:
              providerHealth.data
                ?.message ||
              providerHealth.message,
          },

          transaction: {
            transactionId:
              transaction.transactionId,

            status:
              transaction.status,

            amount:
              transaction.amount.toString(),
          },

          electricity: {
            consumerNumber,
            operator,
          },

          payment: {
            amount:
              transaction.amount.toString(),
            currency,
          },
        },
        {
          status: 503,
        }
      );
    }

    // ==================================================
    // LIVE BBPS WORKFLOW NOT IMPLEMENTED YET
    //
    // ACTIVE registry status alone must never create
    // ELECTRICITY_SUCCESS.
    //
    // Future authorized BBPS workflow:
    //
    // 1. Fetch/validate bill from BBPS
    // 2. Verify consumer/operator/bill amount
    // 3. Send bill payment request
    // 4. Receive provider transaction/reference ID
    // 5. Verify final provider result
    // 6. Only then update ELECTRICITY_SUCCESS
    // ==================================================

    console.warn(
      "ELECTRICITY BBPS WORKFLOW NOT IMPLEMENTED:",
      transaction.transactionId
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Payment verified है, लेकिन live Electricity BBPS workflow अभी configured नहीं है। Bill को successful mark नहीं किया गया है।",

        code:
          "ELECTRICITY_WORKFLOW_NOT_IMPLEMENTED",

        paymentVerified: true,
        processed: false,

        provider: {
          configured:
            providerHealth.data
              ?.configured ?? false,

          available:
            providerHealth.data
              ?.available ?? false,

          status:
            providerHealth.data
              ?.status ?? "ERROR",

          message:
            providerHealth.data
              ?.message ||
            providerHealth.message,
        },

        transaction: {
          transactionId:
            transaction.transactionId,

          status:
            transaction.status,

          amount:
            transaction.amount.toString(),
        },

        electricity: {
          consumerNumber,
          operator,
        },

        payment: {
          amount:
            transaction.amount.toString(),
          currency,
        },
      },
      {
        status: 503,
      }
    );
  } catch (error) {
    console.error(
      "ELECTRICITY PROCESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Electricity bill processing failed.",

        code:
          "ELECTRICITY_PROCESS_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}