// ======================================================
// RY MULTI SERVICE
// Internal BBPS Provider Status API
// Mobile Postpaid + Electricity
// ======================================================

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

import {
  electricityProvider,
  mobilePostpaidProvider,
} from "@/lib/providers/bbps/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ================= AUTH CHECK =================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // ================= PROVIDER HEALTH =================

    const [
      mobilePostpaid,
      electricity,
    ] = await Promise.all([
      mobilePostpaidProvider.healthCheck(),
      electricityProvider.healthCheck(),
    ]);

    // ================= RESPONSE =================

    return NextResponse.json({
      success: true,
      message:
        "BBPS provider status checked successfully.",
      services: {
        mobilePostpaid,
        electricity,
      },
    });
  } catch (error) {
    console.error(
      "BBPS PROVIDER STATUS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "BBPS provider status check नहीं हो पाया।",
        code: "BBPS_STATUS_ERROR",
      },
      {
        status: 500,
      },
    );
  }
}