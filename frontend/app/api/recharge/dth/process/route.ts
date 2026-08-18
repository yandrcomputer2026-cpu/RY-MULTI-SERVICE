import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ======================================================
// DTH PROCESS
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("DTH PROCESS API CALLED");
    console.log("================================");

    // ==================================================
    // USER CHECK
    // ==================================================

    const user = await getCurrentUser();

    if (!user) {
      console.log(
        "DTH PROCESS: USER NOT LOGGED IN"
      );

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

    console.log(
      "DTH PROCESS USER:",
      user.id,
      user.email
    );

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

    console.log(
      "DTH PROCESS TRANSACTION:",
      transactionId
    );

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Transaction ID is required.",
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
        },
      });

    if (!transaction) {
      console.log(
        "DTH PROCESS: TRANSACTION NOT FOUND"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "DTH transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "DTH TRANSACTION FOUND:",
      transaction.transactionId
    );

    // ==================================================
    // SERVICE VALIDATION
    // ==================================================

    if (
      transaction.service !==
      "DTH_RECHARGE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid transaction service.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // ALREADY SUCCESS
    // ==================================================

    if (
      transaction.status ===
      "SUCCESS"
    ) {
      console.log(
        "DTH PROCESS: TRANSACTION ALREADY SUCCESS"
      );

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

          customerId:
            transaction.referenceId,

          operator:
            transaction.provider,
        },
        {
          status: 200,
        }
      );
    }

    // ==================================================
    // ONLY PENDING TRANSACTION CAN PROCESS
    // ==================================================

    if (
      transaction.status !==
      "PENDING"
    ) {
      console.log(
        "DTH PROCESS: INVALID STATUS:",
        transaction.status
      );

      return NextResponse.json(
        {
          success: false,
          message:
            `Transaction cannot be processed because current status is ${transaction.status}.`,
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // DTH DATA
    // ==================================================

    const customerId =
      transaction.referenceId;

    const operator =
      transaction.provider;

    const amount =
      Number(transaction.amount);

    console.log(
      "DTH RECHARGE DATA:",
      {
        customerId,
        operator,
        amount,
      }
    );

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
    // DTH PROVIDER
    // ==================================================

    console.log(
      "DTH PROVIDER PROCESS STARTED"
    );

    /*
      =====================================================
      IMPORTANT

      यहाँ बाद में actual DTH API लगानी है।

      Example:

      const providerResponse =
        await fetch("DTH_PROVIDER_API_URL", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${process.env.DTH_API_KEY}`,
          },
          body: JSON.stringify({
            customerId,
            operator,
            amount,
            transactionId,
          }),
        });

      const providerData =
        await providerResponse.json();

      अगर provider success देता है तभी
      transaction SUCCESS करें।
    */

    // ==================================================
    // TEST MODE
    // ==================================================

    const testMode =
      process.env.DTH_TEST_MODE ===
      "true";

    if (!testMode) {
      console.log(
        "DTH TEST MODE DISABLED"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "DTH provider API अभी configure नहीं है.",
        },
        {
          status: 503,
        }
      );
    }

    console.log(
      "DTH TEST MODE: SUCCESS"
    );

    // ==================================================
    // UPDATE TRANSACTION
    // ==================================================

    const updatedTransaction =
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "SUCCESS",
          updatedAt: new Date(),
        },
      });

    console.log(
      "DTH TRANSACTION SUCCESS:",
      updatedTransaction.transactionId
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "DTH recharge successful.",

        transactionId:
          updatedTransaction.transactionId,

        amount:
          updatedTransaction.amount.toString(),

        status:
          updatedTransaction.status,

        customerId:
          updatedTransaction.referenceId,

        operator:
          updatedTransaction.provider,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("================================");
    console.error(
      "DTH PROCESS ERROR:",
      error
    );
    console.error("================================");

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