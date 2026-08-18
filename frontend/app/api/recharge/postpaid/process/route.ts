import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

    console.log(
      "POSTPAID PROCESS USER:",
      user.id,
      user.email
    );

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

    console.log(
      "POSTPAID PROCESS TRANSACTION:",
      transactionId
    );

    // ======================================================
    // TRANSACTION ID VALIDATION
    // ======================================================

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
    // FIND TRANSACTION
    // ======================================================

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          transactionId,
          userId: user.id,
        },
      });

    if (!transaction) {
      console.log(
        "POSTPAID PROCESS: TRANSACTION NOT FOUND"
      );

      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "POSTPAID TRANSACTION FOUND:",
      transaction.transactionId
    );

    console.log(
      "TRANSACTION STATUS:",
      transaction.status
    );

    // ======================================================
    // PAYMENT VERIFICATION CHECK
    // ======================================================

    if (
      String(transaction.status).toUpperCase() ===
      "PENDING"
    ) {
      console.log(
        "POSTPAID PROCESS: PAYMENT NOT VERIFIED"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment is not verified yet.",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================================
    // ALREADY SUCCESS
    //
    // IMPORTANT:
    // अगर transaction पहले से SUCCESS है,
    // तो दोबारा process करने की जरूरत नहीं।
    // ======================================================

    if (
      String(transaction.status).toUpperCase() ===
      "SUCCESS"
    ) {
      console.log(
        "POSTPAID PROCESS: TRANSACTION ALREADY SUCCESS"
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Postpaid bill has already been processed successfully.",
          transactionId:
            transaction.transactionId,
          status: transaction.status,
          processed: true,
          alreadyProcessed: true,
        },
        {
          status: 200,
        }
      );
    }

    // ======================================================
    // POSTPAID BILL PROCESSING
    //
    // CURRENTLY TEST MODE
    //
    // यहाँ future में Airtel/Jio/Vi/BSNL का actual
    // bill payment API लगाया जा सकता है।
    // ======================================================

    console.log(
      "================================"
    );

    console.log(
      "POSTPAID BILL PROCESSING STARTED"
    );

    console.log({
      transactionId:
        transaction.transactionId,

      amount:
        transaction.amount.toString(),

      provider:
        transaction.provider,

      referenceId:
        transaction.referenceId,
    });

    // ======================================================
    // MARK TRANSACTION SUCCESS
    //
    // NOTE:
    // Razorpay verification पहले हो चुकी है।
    // इसलिए यहाँ postpaid processing successful
    // होने पर transaction को SUCCESS किया जा रहा है।
    // ======================================================

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
      "POSTPAID TRANSACTION UPDATED:",
      updatedTransaction.transactionId
    );

    console.log(
      "POSTPAID FINAL STATUS:",
      updatedTransaction.status
    );

    console.log(
      "================================"
    );

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
      "POSTPAID PROCESS ERROR:",
      error
    );

    console.error(
      "================================"
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