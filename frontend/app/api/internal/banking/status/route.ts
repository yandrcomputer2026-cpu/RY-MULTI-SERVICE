import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

import {
  aepsProvider,
  moneyTransferProvider,
  payoutProvider,
  upiCashProvider,
} from "@/lib/providers/banking/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const [
      aeps,
      moneyTransfer,
      upiCash,
      payout,
    ] = await Promise.all([
      aepsProvider.healthCheck(),
      moneyTransferProvider.healthCheck(),
      upiCashProvider.healthCheck(),
      payoutProvider.healthCheck(),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Banking provider status checked successfully.",
      services: {
        aeps,
        moneyTransfer,
        upiCash,
        payout,
      },
    });
  } catch (error) {
    console.error(
      "BANKING PROVIDER STATUS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Banking provider status check नहीं हो पाया।",
        code: "BANKING_STATUS_ERROR",
      },
      { status: 500 },
    );
  }
}