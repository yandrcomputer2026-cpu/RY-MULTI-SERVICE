import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

function parseElectricityDescription(
  description: string | null
): ElectricityDescription {
  if (!description) {
    return {};
  }

  try {
    return JSON.parse(description) as ElectricityDescription;
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

    const consumerNumber =
      details.electricity?.consumerNumber ||
      transaction.referenceId ||
      "";

    const providerFallback =
      transaction.provider &&
      transaction.provider.toUpperCase() !== "RAZORPAY"
        ? transaction.provider
        : "";

    const operator =
      details.electricity?.operator ||
      providerFallback;

    const currency =
      details.payment?.currency ||
      "INR";

    const amount =
      Number(transaction.amount);

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
    // PAYMENT VERIFICATION CHECK
    //
    // Generic Razorpay verify route changes:
    // PENDING -> SUCCESS
    //
    // Therefore SUCCESS means payment is verified and
    // Electricity bill processing can now run.
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
    // DATA VALIDATION
    // ==================================================

    if (
      !consumerNumber ||
      !operator ||
      !Number.isFinite(amount)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Electricity transaction data is incomplete.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // ELECTRICITY PROVIDER
    //
    // Current project flow uses ELECTRICITY_TEST_MODE
    // for demo/test processing.
    //
    // Replace this block later with the real Electricity
    // / BBPS provider API.
    // ==================================================

    const testMode =
      process.env.ELECTRICITY_TEST_MODE === "true";

    if (!testMode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Electricity provider API अभी configure नहीं है.",
        },
        {
          status: 503,
        }
      );
    }

    console.log(
      "ELECTRICITY TEST MODE PROCESSING:",
      {
        transactionId:
          transaction.transactionId,
        consumerNumber,
        operator,
        amount,
      }
    );

    // ==================================================
    // FINAL ELECTRICITY STATUS
    // ==================================================

    const updatedTransaction =
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "ELECTRICITY_SUCCESS",
          updatedAt: new Date(),
        },
      });

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Electricity bill payment successful.",

        transactionId:
          updatedTransaction.transactionId,

        amount:
          updatedTransaction.amount.toString(),

        status:
          updatedTransaction.status,

        processed: true,
        alreadyProcessed: false,

        electricity: {
          consumerNumber,
          operator,
        },

        payment: {
          currency,

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
      "ELECTRICITY PROCESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Electricity bill processing failed. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
