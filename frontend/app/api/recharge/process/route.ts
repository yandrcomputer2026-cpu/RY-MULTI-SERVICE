import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // ================= USER CHECK =================

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

    // ================= REQUEST DATA =================

    const body = await request.json();

    const transactionId = String(
      body.transactionId || ""
    ).trim();

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction ID is required.",
        },
        { status: 400 }
      );
    }

    // ================= FIND TRANSACTION =================

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          transactionId,
          userId: user.id,
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found.",
        },
        { status: 404 }
      );
    }

    // ================= ALREADY RECHARGED =================

    if (transaction.status === "RECHARGE_SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Recharge already completed.",

        recharge: {
          transactionId:
            transaction.transactionId,

          mobile:
            transaction.referenceId,

          operator:
            transaction.provider,

          amount:
            transaction.amount.toString(),

          status:
            transaction.status,
        },
      });
    }

    // ================= PAYMENT CHECK =================

    if (transaction.status !== "SUCCESS") {
      return NextResponse.json(
        {
          success: false,

          message:
            `Payment is not successful yet. Current status: ${transaction.status}`,
        },
        { status: 400 }
      );
    }

    // ================= TEST RECHARGE =================
    //
    // अभी यह TEST recharge है.
    // बाद में वास्तविक recharge provider API
    // यहाँ लगाया जाएगा.

    const updatedTransaction =
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },

        data: {
          status: "RECHARGE_SUCCESS",
        },
      });

    // ================= RESPONSE =================

    return NextResponse.json({
      success: true,

      message:
        "Recharge successful.",

      recharge: {
        transactionId:
          updatedTransaction.transactionId,

        mobile:
          updatedTransaction.referenceId,

        operator:
          updatedTransaction.provider,

        amount:
          updatedTransaction.amount.toString(),

        status:
          updatedTransaction.status,
      },
    });
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