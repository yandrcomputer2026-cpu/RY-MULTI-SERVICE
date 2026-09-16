import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  mobilePostpaidProvider,
} from "@/lib/providers/bbps/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PostpaidDescription = {
  bookingType?: string;

  bill?: {
    mobile?: string;
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

function parsePostpaidDescription(
  description: string | null
): PostpaidDescription {
  if (!description) {
    return {};
  }

  try {
    return JSON.parse(
      description
    ) as PostpaidDescription;
  } catch {
    return {};
  }
}

// ======================================================
// POST
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("POSTPAID PROCESS API CALLED");
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
    // FIND TRANSACTION
    // ==================================================

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          transactionId,
          userId: user.id,
          service: "MOBILE_POSTPAID",
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Postpaid transaction not found.",
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
      parsePostpaidDescription(
        transaction.description
      );

    const mobile = String(
      details.bill?.mobile ||
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
      details.bill?.operator ||
        providerFallback ||
        ""
    )
      .trim()
      .toLowerCase();

    const amount =
      Number(details.payment?.amount) ||
      Number(transaction.amount);

    const currency =
      details.payment?.currency || "INR";

    // ==================================================
    // ALREADY PROCESSED
    // ==================================================

    if (status === "POSTPAID_SUCCESS") {
      return NextResponse.json(
        {
          success: true,

          message:
            "Postpaid bill has already been processed successfully.",

          transactionId:
            transaction.transactionId,

          status:
            transaction.status,

          processed: true,
          alreadyProcessed: true,

          bill: {
            mobile,
            operator,
            amount:
              transaction.amount.toString(),
            currency,
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
    // SUCCESS here means Razorpay payment verified.
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

    if (
      !/^[6-9][0-9]{9}$/.test(mobile)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Postpaid transaction contains an invalid mobile number.",
          code:
            "INVALID_POSTPAID_DATA",
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
            "Postpaid operator information is missing.",
          code:
            "INVALID_POSTPAID_DATA",
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
            "Postpaid bill amount is invalid.",
          code:
            "INVALID_POSTPAID_DATA",
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
      await mobilePostpaidProvider.healthCheck();

    const providerReady =
      providerHealth.success === true &&
      providerHealth.data?.configured === true &&
      providerHealth.data?.available === true &&
      providerHealth.data?.status === "ACTIVE";

    // ==================================================
    // PROVIDER NOT READY
    //
    // IMPORTANT:
    // Razorpay payment is already verified.
    // Do NOT change transaction to POSTPAID_SUCCESS.
    // ==================================================

    if (!providerReady) {
      console.warn(
        "POSTPAID BBPS PROVIDER NOT ACTIVE:",
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
            "Payment verified है, लेकिन Mobile Postpaid BBPS provider अभी active नहीं है। Bill को successful mark नहीं किया गया है।",

          code:
            "POSTPAID_PROVIDER_NOT_ACTIVE",

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

          bill: {
            mobile,
            operator,
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
    // Registry ACTIVE alone is NOT enough to mark the
    // bill successful.
    //
    // Future authorized BBPS workflow:
    //
    // 1. Fetch/validate bill
    // 2. Send payment request to BBPS provider
    // 3. Receive provider transaction/reference ID
    // 4. Verify provider response
    // 5. Only then update POSTPAID_SUCCESS
    // ==================================================

    console.warn(
      "POSTPAID BBPS WORKFLOW NOT IMPLEMENTED:",
      transaction.transactionId
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Payment verified है, लेकिन live Mobile Postpaid BBPS workflow अभी configured नहीं है। Bill को successful mark नहीं किया गया है।",

        code:
          "POSTPAID_WORKFLOW_NOT_IMPLEMENTED",

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

        bill: {
          mobile,
          operator,
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
      "POSTPAID PROCESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Postpaid bill processing failed.",

        code:
          "POSTPAID_PROCESS_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}