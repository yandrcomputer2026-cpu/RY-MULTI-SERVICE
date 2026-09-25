import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { pay2AllRecharge } from "@/lib/providers/pay2all/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// PAY2ALL MOBILE PROVIDER IDS
// Confirmed from Pay2All /providers response
// ======================================================

const MOBILE_PROVIDER_IDS = {
  airtel: 1,
  jio: 2,
  vi: 3,
  bsnl: 4,
} as const;

type MobileOperator =
  keyof typeof MOBILE_PROVIDER_IDS;

export async function POST(
  request: Request
) {
  try {
    // ==================================================
    // AUTH - ADMIN ONLY
    // ==================================================

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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // ==================================================
    // UAT SAFETY CHECK
    // ==================================================

    const mode =
      process.env.PAY2ALL_MODE
        ?.trim()
        .toUpperCase();

    if (mode !== "UAT") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Recharge test endpoint केवल PAY2ALL_MODE=UAT में allowed है.",
        },
        { status: 403 }
      );
    }

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
        { status: 400 }
      );
    }

    const mobile = String(
      body.mobile ?? ""
    ).trim();

    const operator = String(
      body.operator ?? ""
    )
      .trim()
      .toLowerCase() as MobileOperator;

    const amount = Number(body.amount);

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid 10 digit mobile number required.",
        },
        { status: 400 }
      );
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        MOBILE_PROVIDER_IDS,
        operator
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Operator must be airtel, jio, vi or bsnl.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid recharge amount required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // UNIQUE UAT CLIENT ID
    // ==================================================

    const clientId =
      `UAT-${Date.now()}-${crypto
        .randomUUID()
        .slice(0, 8)}`;

    const providerId =
      MOBILE_PROVIDER_IDS[operator];

    // ==================================================
    // PAY2ALL UAT RECHARGE
    // ==================================================

    const providerResponse =
      await pay2AllRecharge({
        clientId,
        providerId,
        number: mobile,
        amount,
      });

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      message:
        "Pay2All UAT recharge request completed.",

      mode: "UAT",

      request: {
        clientId,
        operator,
        providerId,
        mobile,
        amount,
      },

      providerResponse,
    });
  } catch (error) {
    console.error(
      "PAY2ALL UAT RECHARGE TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Pay2All UAT recharge test failed.",
      },
      { status: 500 }
    );
  }
}