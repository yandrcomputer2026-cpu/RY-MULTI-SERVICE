import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

// ======================================================
// ALLOWED ELECTRICITY BOARDS
// ======================================================

const ALLOWED_OPERATORS = [
  "bses-rajdhani",
  "bses-yamuna",
  "tata-power-delhi",
  "uppcl",
  "msedcl",
  "mpwz",
  "jvvnl",
] as const;

// ======================================================
// POST
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("ELECTRICITY BILL API CALLED");
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
      consumerNumber?: unknown;
      operator?: unknown;
      amount?: unknown;
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

    // ==================================================
    // CLEAN DATA
    // ==================================================

    const consumerNumber = String(
      body.consumerNumber ?? ""
    )
      .trim()
      .toUpperCase();

    const operator = String(
      body.operator ?? ""
    )
      .trim()
      .toLowerCase();

    const amount = Number(body.amount);

    console.log("ELECTRICITY DATA:", {
      consumerNumber,
      operator,
      amount,
    });

    // ==================================================
    // CONSUMER NUMBER VALIDATION
    // ==================================================

    if (!consumerNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter Electricity Consumer Number.",
        },
        {
          status: 400,
        }
      );
    }

    if (consumerNumber.length < 4) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid Consumer Number.",
        },
        {
          status: 400,
        }
      );
    }

    if (consumerNumber.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Consumer Number is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[A-Z0-9/_-]+$/.test(consumerNumber)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Electricity Consumer Number.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // ELECTRICITY BOARD VALIDATION
    // ==================================================

    if (
      !ALLOWED_OPERATORS.includes(
        operator as (typeof ALLOWED_OPERATORS)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Electricity Board selected.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // AMOUNT VALIDATION
    // ==================================================

    if (!Number.isFinite(amount)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid bill amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (amount < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Minimum electricity bill payment is ₹10.",
        },
        {
          status: 400,
        }
      );
    }

    const decimalPlaces =
      (String(amount).split(".")[1] || "").length;

    if (decimalPlaces > 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bill amount can have maximum 2 decimal places.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // UNIQUE TRANSACTION ID
    // ==================================================

    const transactionId =
      `RYELE-${Date.now()}-${crypto
        .randomUUID()
        .slice(0, 8)}`;

    // ==================================================
    // STRUCTURED ELECTRICITY DATA
    // ==================================================

    const electricityData = {
      bookingType: "ELECTRICITY_BILL_PAYMENT",

      electricity: {
        consumerNumber,
        operator,
      },

      payment: {
        amount,
        currency: "INR",
      },
    };

    const description =
      JSON.stringify(electricityData);

    // ==================================================
    // CREATE DATABASE TRANSACTION
    // ==================================================

    const transaction =
      await prisma.transaction.create({
        data: {
          transactionId,

          userId: user.id,

          service: "ELECTRICITY_BILL",

          category: "ELECTRICITY",

          description,

          referenceId: consumerNumber,

          provider: operator,

          amount,

          status: "PENDING",

          updatedAt: new Date(),
        },
      });

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Electricity bill transaction created successfully.",

        transactionId:
          transaction.transactionId,

        transaction: {
          id: transaction.id,

          transactionId:
            transaction.transactionId,

          amount:
            transaction.amount.toString(),

          status:
            transaction.status,
        },

        bill: electricityData,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ELECTRICITY BILL ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
