import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
      console.log(
        "ELECTRICITY PROCESS: USER NOT LOGGED IN"
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
      "ELECTRICITY PROCESS USER:",
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
      "ELECTRICITY PROCESS TRANSACTION:",
      transactionId
    );

    // ==================================================
    // TRANSACTION ID VALIDATION
    // ==================================================

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
        },
      });

    if (!transaction) {
      console.log(
        "ELECTRICITY PROCESS: TRANSACTION NOT FOUND"
      );

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

    console.log(
      "ELECTRICITY TRANSACTION FOUND:",
      transaction.transactionId
    );

    // ==================================================
    // SERVICE VALIDATION
    // ==================================================

    if (
      transaction.service !==
      "ELECTRICITY_BILL"
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
        "ELECTRICITY PROCESS: TRANSACTION ALREADY SUCCESS"
      );

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

          consumerNumber:
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
        "ELECTRICITY PROCESS: INVALID STATUS:",
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
    // ELECTRICITY DATA
    // ==================================================

    const consumerNumber =
      transaction.referenceId;

    const operator =
      transaction.provider;

    const amount =
      Number(transaction.amount);

    console.log(
      "ELECTRICITY BILL DATA:",
      {
        consumerNumber,
        operator,
        amount,
      }
    );

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
    // ==================================================

    console.log(
      "ELECTRICITY PROVIDER PROCESS STARTED"
    );

    /*
      =====================================================
      IMPORTANT

      यहाँ बाद में actual Electricity Bill API लगानी है।

      Example:

      const providerResponse =
        await fetch(
          "ELECTRICITY_PROVIDER_API_URL",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${process.env.ELECTRICITY_API_KEY}`,
            },

            body: JSON.stringify({
              consumerNumber,
              operator,
              amount,
              transactionId,
            }),
          }
        );

      const providerData =
        await providerResponse.json();

      अगर provider success देता है तभी
      transaction को SUCCESS करें।
    */

    // ==================================================
    // TEST MODE
    // ==================================================

    const testMode =
      process.env.ELECTRICITY_TEST_MODE ===
      "true";

    if (!testMode) {
      console.log(
        "ELECTRICITY TEST MODE DISABLED"
      );

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
      "ELECTRICITY TEST MODE: SUCCESS"
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
      "ELECTRICITY TRANSACTION SUCCESS:",
      updatedTransaction.transactionId
    );

    // ==================================================
    // RESPONSE
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

        consumerNumber:
          updatedTransaction.referenceId,

        operator:
          updatedTransaction.provider,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "ELECTRICITY PROCESS ERROR:",
      error
    );

    console.error(
      "================================"
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