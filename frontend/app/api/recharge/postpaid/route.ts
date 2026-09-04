import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ======================================================
// ALLOWED OPERATORS
// ======================================================

const ALLOWED_OPERATORS = [
  "jio",
  "airtel",
  "vi",
  "bsnl",
] as const;

// ======================================================
// POST
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("POSTPAID BILL API CALLED");
    console.log("================================");

    // ==================================================
    // USER CHECK
    // ==================================================

    const user = await getCurrentUser();

    if (!user) {
      console.log("POSTPAID: USER NOT LOGGED IN");

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

    console.log("USER:", user.id, user.email);

    // ==================================================
    // REQUEST BODY
    // ==================================================

    let body: {
      mobile?: unknown;
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

    const mobile = String(body.mobile ?? "").trim();

    const operator = String(body.operator ?? "")
      .trim()
      .toLowerCase();

    const amount = Number(body.amount);

    console.log("POSTPAID DATA:", {
      mobile,
      operator,
      amount,
    });

    // ==================================================
    // MOBILE VALIDATION
    // ==================================================

    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10 digit mobile number.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // OPERATOR VALIDATION
    // ==================================================

    if (
      !ALLOWED_OPERATORS.includes(
        operator as (typeof ALLOWED_OPERATORS)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile operator selected.",
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
          message: "Please enter a valid bill amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Bill amount must be greater than ₹0.",
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
          message: "Invalid bill amount.",
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
      `RYPP-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    console.log("TRANSACTION ID:", transactionId);

    // ==================================================
    // STRUCTURED POSTPAID DATA
    // ==================================================

    const postpaidData = {
      bookingType: "MOBILE_POSTPAID_BILL",

      bill: {
        mobile,
        operator,
      },

      payment: {
        amount,
        currency: "INR",
      },
    };

    const description =
      JSON.stringify(postpaidData);

    // ==================================================
    // CREATE DATABASE TRANSACTION
    // ==================================================

    const transaction = await prisma.transaction.create({
      data: {
        transactionId,

        userId: user.id,

        service: "MOBILE_POSTPAID",

        category: "POSTPAID_BILL",

        description,

        referenceId: mobile,

        provider: operator,

        amount,

        status: "PENDING",

        updatedAt: new Date(),
      },
    });

    console.log(
      "POSTPAID TRANSACTION CREATED:",
      transaction.transactionId
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Postpaid bill transaction created successfully.",

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

        bill: postpaidData,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("================================");
    console.error(
      "POSTPAID BILL ERROR:",
      error
    );
    console.error("================================");

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
