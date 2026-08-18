import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
      console.log("ELECTRICITY: USER NOT LOGGED IN");

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
      "ELECTRICITY USER:",
      user.id,
      user.email
    );

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

    // ==================================================
    // CONSUMER NUMBER CHARACTER VALIDATION
    // ==================================================

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

    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select Electricity Board.",
        },
        {
          status: 400,
        }
      );
    }

    if (operator.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Electricity Board.",
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

    // ==================================================
    // MAXIMUM 2 DECIMAL PLACES
    // ==================================================

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

    console.log(
      "ELECTRICITY TRANSACTION ID:",
      transactionId
    );

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

          description:
            `Electricity Consumer Number: ${consumerNumber}, Board: ${operator}`,

          referenceId: consumerNumber,

          provider: operator,

          amount,

          status: "PENDING",

          updatedAt: new Date(),
        },
      });

    console.log(
      "ELECTRICITY TRANSACTION CREATED:",
      transaction.transactionId
    );

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
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("================================");
    console.error(
      "ELECTRICITY BILL ERROR:",
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