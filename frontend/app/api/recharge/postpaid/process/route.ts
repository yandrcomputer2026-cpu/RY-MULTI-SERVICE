import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

function parsePostpaidDescription(
  description: string | null
): PostpaidDescription {
  if (!description) {
    return {};
  }

  try {
    return JSON.parse(description) as PostpaidDescription;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("POSTPAID PROCESS API CALLED");
    console.log("================================");

    // ======================================================
    // USER CHECK
    // ======================================================

    const user = await getCurrentUser();

    if (!user) {
      console.log("POSTPAID PROCESS: USER NOT LOGGED IN");

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

    // ======================================================
    // REQUEST BODY
    // ======================================================

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

    // ======================================================
    // FIND POSTPAID TRANSACTION
    // ======================================================

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
          message: "Postpaid transaction not found.",
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

    const mobile =
      details.bill?.mobile ||
      transaction.referenceId ||
      "";

    const providerFallback =
      transaction.provider &&
      transaction.provider.toUpperCase() !== "RAZORPAY"
        ? transaction.provider
        : "";

    const operator =
      details.bill?.operator ||
      providerFallback;

    const currency =
      details.payment?.currency ||
      "INR";

    // ======================================================
    // ALREADY PROCESSED
    // ======================================================

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

    // ======================================================
    // PAYMENT VERIFICATION CHECK
    //
    // Generic Razorpay verify route changes PENDING -> SUCCESS.
    // Therefore SUCCESS means payment verified and ready for
    // postpaid bill processing.
    // ======================================================

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

    // ======================================================
    // POSTPAID BILL PROCESSING - TEST MODE
    //
    // Future real operator API integration goes here.
    // ======================================================

    console.log("POSTPAID BILL PROCESSING STARTED", {
      transactionId:
        transaction.transactionId,
      mobile,
      operator,
      amount:
        transaction.amount.toString(),
    });

    // ======================================================
    // FINAL POSTPAID STATUS
    // ======================================================

    const updatedTransaction =
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "POSTPAID_SUCCESS",
          updatedAt: new Date(),
        },
      });

    // ======================================================
    // SUCCESS RESPONSE
    // ======================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Postpaid bill processed successfully.",

        transactionId:
          updatedTransaction.transactionId,

        status:
          updatedTransaction.status,

        processed: true,
        alreadyProcessed: false,

        bill: {
          mobile,
          operator,
          amount:
            updatedTransaction.amount.toString(),
          currency,
        },

        payment: {
          provider:
            updatedTransaction.razorpayPaymentId
              ? "RAZORPAY"
              : updatedTransaction.provider,

          razorpayOrderId:
            updatedTransaction.razorpayOrderId,

          razorpayPaymentId:
            updatedTransaction.razorpayPaymentId,
        },
      },
      {
        status: 200,
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
      },
      {
        status: 500,
      }
    );
  }
}
