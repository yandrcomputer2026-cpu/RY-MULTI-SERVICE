import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

// ======================================================
// ALLOWED FASTAG PROVIDERS
// ======================================================

const ALLOWED_PROVIDERS = [
  "HDFC_BANK",
  "ICICI_BANK",
  "IDFC_FIRST_BANK",
  "AXIS_BANK",
  "SBI",
  "KOTAK_BANK",
  "OTHER",
] as const;

// ======================================================
// POST
// ======================================================

export async function POST(request: Request) {
  try {
    console.log("================================");
    console.log("FASTAG RECHARGE API CALLED");
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
      vehicleNumber?: unknown;
      provider?: unknown;
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

    const vehicleNumber = String(
      body.vehicleNumber ?? ""
    )
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    const provider = String(
      body.provider ?? ""
    )
      .trim()
      .toUpperCase();

    const amount = Number(body.amount);

    console.log("FASTAG DATA:", {
      vehicleNumber,
      provider,
      amount,
    });

    // ==================================================
    // VEHICLE NUMBER VALIDATION
    // ==================================================

    if (!vehicleNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter Vehicle Number.",
        },
        {
          status: 400,
        }
      );
    }

    if (vehicleNumber.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Vehicle Number.",
        },
        {
          status: 400,
        }
      );
    }

    if (vehicleNumber.length > 15) {
      return NextResponse.json(
        {
          success: false,
          message: "Vehicle Number is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[A-Z0-9-]+$/.test(vehicleNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Vehicle Number.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // FASTAG PROVIDER VALIDATION
    // ==================================================

    if (
      !ALLOWED_PROVIDERS.includes(
        provider as (typeof ALLOWED_PROVIDERS)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid FASTag provider selected.",
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

    if (amount < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum FASTag recharge amount is ₹1.",
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
      `RYFTG-${Date.now()}-${crypto
        .randomUUID()
        .slice(0, 8)}`;

    // ==================================================
    // STRUCTURED FASTAG DATA
    // ==================================================

    const fastagData = {
      bookingType: "FASTAG_RECHARGE",

      fastag: {
        vehicleNumber,
        provider,
      },

      payment: {
        amount,
        currency: "INR",
      },
    };

    const description = JSON.stringify(fastagData);

    // ==================================================
    // CREATE DATABASE TRANSACTION
    // ==================================================

    const transaction = await prisma.transaction.create({
      data: {
        transactionId,

        userId: user.id,

        service: "FASTAG_RECHARGE",

        category: "FASTAG",

        description,

        referenceId: vehicleNumber,

        provider,

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
          "FASTag recharge transaction created successfully.",

        transactionId: transaction.transactionId,

        transaction: {
          id: transaction.id,

          transactionId: transaction.transactionId,

          amount: transaction.amount.toString(),

          status: transaction.status,
        },

        fastag: fastagData,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("FASTAG RECHARGE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}