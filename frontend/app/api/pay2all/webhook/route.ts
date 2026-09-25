import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// =====================================================
// PAY2ALL WEBHOOK
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // -------------------------------------------------
    // READ PAY2ALL CALLBACK
    // -------------------------------------------------

    const body = await request.json();

    console.log("PAY2ALL WEBHOOK RECEIVED:", body);

    // -------------------------------------------------
    // BASIC DATA
    // -------------------------------------------------

    const statusId = Number(body?.status_id);

    const data =
      body?.data &&
      typeof body.data === "object"
        ? body.data
        : {};

    const clientId =
      data?.client_id ??
      body?.client_id ??
      null;

    const providerTransactionId =
      data?.txn_id ??
      body?.txn_id ??
      null;

    const utr =
      data?.utr ??
      body?.utr ??
      null;

    const reportId =
      data?.report_id ??
      body?.report_id ??
      null;

    const message =
      typeof body?.message === "string"
        ? body.message
        : "Pay2All status update";

    // -------------------------------------------------
    // CLIENT ID IS REQUIRED
    // -------------------------------------------------

    if (!clientId) {
      console.error(
        "PAY2ALL WEBHOOK: client_id missing"
      );

      return NextResponse.json(
        {
          success: false,
          message: "client_id is required",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // FIND OUR LOCAL TRANSACTION
    // client_id = our transactionId
    // -------------------------------------------------

    const transaction =
      await prisma.transaction.findUnique({
        where: {
          transactionId: String(clientId),
        },
      });

    if (!transaction) {
      console.error(
        "PAY2ALL WEBHOOK: transaction not found:",
        clientId
      );

      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found",
        },
        {
          status: 404,
        }
      );
    }

    // -------------------------------------------------
    // ONLY PAY2ALL RECHARGE TRANSACTIONS
    // -------------------------------------------------

    if (transaction.service !== "MOBILE_PREPAID") {
      console.error(
        "PAY2ALL WEBHOOK: invalid service:",
        transaction.service
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid transaction service",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // MAP PAY2ALL STATUS
    //
    // 1 = SUCCESS
    // 2 = FAILED
    // 3 = PENDING
    // -------------------------------------------------

    let rechargeStatus:
      | "RECHARGE_SUCCESS"
      | "RECHARGE_FAILED"
      | "RECHARGE_PENDING";

    if (statusId === 1) {
      rechargeStatus = "RECHARGE_SUCCESS";
    } else if (statusId === 2) {
      rechargeStatus = "RECHARGE_FAILED";
    } else {
      rechargeStatus = "RECHARGE_PENDING";
    }

    // -------------------------------------------------
    // DON'T DOWNGRADE FINAL SUCCESS
    // -------------------------------------------------

    if (
      transaction.status ===
        "RECHARGE_SUCCESS" &&
      rechargeStatus !== "RECHARGE_SUCCESS"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Transaction already completed successfully",
      });
    }

    // -------------------------------------------------
    // STORE PROVIDER REFERENCE
    // -------------------------------------------------

    const providerReference =
      providerTransactionId ||
      utr ||
      reportId ||
      transaction.referenceId ||
      null;

    // -------------------------------------------------
    // UPDATE TRANSACTION
    // -------------------------------------------------

    await prisma.transaction.update({
      where: {
        id: transaction.id,
      },

      data: {
        status: rechargeStatus,

        provider: "PAY2ALL",

        referenceId: providerReference,
      },
    });

    // -------------------------------------------------
    // SUCCESS RESPONSE TO PAY2ALL
    // -------------------------------------------------

    console.log(
      "PAY2ALL WEBHOOK UPDATED:",
      {
        transactionId:
          transaction.transactionId,
        status: rechargeStatus,
        providerTransactionId,
        utr,
        reportId,
        message,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error(
      "PAY2ALL WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// OPTIONAL GET CHECK
// Browser से endpoint verify करने के लिए
// =====================================================

export async function GET() {
  return NextResponse.json({
    success: true,
    provider: "PAY2ALL",
    webhook: "READY",
    message:
      "RY MULTI SERVICE Pay2All webhook is ready.",
  });
}