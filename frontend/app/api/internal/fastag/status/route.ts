import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { fastagProvider } from "@/lib/providers/fastag/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // केवल logged-in RY MULTI SERVICE user access कर सकता है
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access.",
        },
        {
          status: 401,
        },
      );
    }

    // Internal FASTag provider adapter से status लें
    const result = await fastagProvider.healthCheck();

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error) {
    console.error("FASTAG INTERNAL STATUS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "FASTag provider status check failed.",
        errorCode: "FASTAG_STATUS_ERROR",
      },
      {
        status: 500,
      },
    );
  }
}