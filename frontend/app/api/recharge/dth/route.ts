import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

// ======================================================
// ALLOWED DTH OPERATORS
// ======================================================

const ALLOWED_OPERATORS = [
  "tata-play",
  "airtel-digital-tv",
  "dish-tv",
  "d2h",
  "sun-direct",
  "videocon-d2h",
] as const;

// ======================================================
// POST
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("DTH RECHARGE API CALLED");
    console.log("================================");

    // ==================================================
    // USER CHECK
    // ==================================================

    const user = await getCurrentUser();

    if (!user) {
      console.log("DTH: USER NOT LOGGED IN");

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
      customerId?: unknown;
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

    const customerId = String(
      body.customerId ?? ""
    )
      .trim()
      .toUpperCase();

    const operator = String(
      body.operator ?? ""
    )
      .trim()
      .toLowerCase();

    const amount = Number(body.amount);

    console.log("DTH DATA:", {
      customerId,
      operator,
      amount,
    });

    // ==================================================
    // CUSTOMER ID VALIDATION
    // ==================================================

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter DTH Customer ID / Subscriber Number.",
        },
        {
          status: 400,
        }
      );
    }

    if (customerId.length < 4) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid DTH Customer ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (customerId.length > 20) {
      return NextResponse.json(
        {
          success: false,
          message:
            "DTH Customer ID is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[A-Z0-9]+$/.test(customerId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid DTH Customer ID.",
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
          message:
            "Invalid DTH operator selected.",
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
            "Please enter a valid recharge amount.",
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
            "Minimum DTH recharge amount is ₹10.",
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
            "Recharge amount can have maximum 2 decimal places.",
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
      `RYDTH-${Date.now()}-${crypto
        .randomUUID()
        .slice(0, 8)}`;

    console.log(
      "DTH TRANSACTION ID:",
      transactionId
    );

    // ==================================================
    // STRUCTURED DTH DATA
    // ==================================================

    const dthData = {
      bookingType: "DTH_RECHARGE",

      dth: {
        customerId,
        operator,
      },

      payment: {
        amount,
        currency: "INR",
      },
    };

    const description =
      JSON.stringify(dthData);

    // ==================================================
    // CREATE DATABASE TRANSACTION
    // ==================================================

    const transaction =
      await prisma.transaction.create({
        data: {
          transactionId,

          userId: user.id,

          service: "DTH_RECHARGE",

          category: "DTH",

          description,

          referenceId: customerId,

          provider: operator,

          amount,

          status: "PENDING",

          updatedAt: new Date(),
        },
      });

    console.log(
      "DTH TRANSACTION CREATED:",
      transaction.transactionId
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "DTH recharge transaction created successfully.",

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

        recharge: dthData,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("================================");
    console.error("DTH RECHARGE ERROR:", error);
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
