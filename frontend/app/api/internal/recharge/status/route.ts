import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  prepaidRechargeProvider,
  dthRechargeProvider,
} from "@/lib/providers/recharge/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access.",
        },
        {
          status: 401,
        }
      );
    }

    const [prepaid, dth] =
      await Promise.all([
        prepaidRechargeProvider.healthCheck(),
        dthRechargeProvider.healthCheck(),
      ]);

    return NextResponse.json(
      {
        success: true,
        message:
          "Recharge provider status checked successfully.",
        services: {
          mobilePrepaid: prepaid,
          dth,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "RECHARGE INTERNAL STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to check recharge provider status.",
        errorCode:
          "RECHARGE_STATUS_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}