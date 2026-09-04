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
// ALLOWED CIRCLES
// ======================================================

const ALLOWED_CIRCLES = [
  "andhra-pradesh",
  "bihar",
  "delhi",
  "gujarat",
  "haryana",
  "jharkhand",
  "karnataka",
  "kerala",
  "madhya-pradesh",
  "maharashtra",
  "odisha",
  "punjab",
  "rajasthan",
  "tamil-nadu",
  "telangana",
  "uttar-pradesh",
  "uttarakhand",
  "west-bengal",
] as const;

// ======================================================
// POST
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("PREPAID RECHARGE API CALLED");
    console.log("================================");

    // ==================================================
    // USER CHECK
    // ==================================================

    const user = await getCurrentUser();

    if (!user) {
      console.log("PREPAID RECHARGE: USER NOT LOGGED IN");

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
      circle?: unknown;
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
    const circle = String(body.circle ?? "")
      .trim()
      .toLowerCase();
    const amount = Number(body.amount);

    console.log("RECHARGE DATA:", {
      mobile,
      operator,
      circle,
      amount,
    });

    // ==================================================
    // MOBILE VALIDATION
    // ==================================================

    if (!/^[0-9]{10}$/.test(mobile)) {
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
    // CIRCLE VALIDATION
    // ==================================================

    if (
      !ALLOWED_CIRCLES.includes(
        circle as (typeof ALLOWED_CIRCLES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid circle selected.",
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
          message: "Please enter a valid recharge amount.",
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
          message: "Minimum recharge amount is ₹10.",
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
          message: "Invalid recharge amount.",
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
      `RYPR-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    console.log("TRANSACTION ID:", transactionId);

    // ==================================================
    // STRUCTURED RECHARGE DATA
    // ==================================================

    const rechargeData = {
      bookingType: "MOBILE_PREPAID_RECHARGE",

      recharge: {
        mobile,
        operator,
        circle,
      },

      payment: {
        amount,
        currency: "INR",
      },
    };

    const description =
      JSON.stringify(rechargeData);

    // ==================================================
    // CREATE DATABASE TRANSACTION
    // ==================================================

    const transaction = await prisma.transaction.create({
      data: {
        transactionId,

        userId: user.id,

        service: "MOBILE_PREPAID",

        category: "PREPAID_RECHARGE",

        description,

        referenceId: mobile,

        provider: operator,

        amount,

        status: "PENDING",

        updatedAt: new Date(),
      },
    });

    console.log(
      "TRANSACTION CREATED:",
      transaction.transactionId
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Recharge request created successfully.",

        transaction: {
          id: transaction.id,

          transactionId:
            transaction.transactionId,

          amount:
            transaction.amount.toString(),

          status:
            transaction.status,
        },

        recharge: rechargeData,
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
      "PREPAID RECHARGE ERROR:",
      error
    );

    console.error(
      "================================"
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
