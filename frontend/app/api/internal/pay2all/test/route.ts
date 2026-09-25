import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ================================================
    // AUTH
    // ================================================

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

    // केवल ADMIN को test endpoint use करने दें
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // ================================================
    // ENV
    // ================================================

    const apiToken =
      process.env.PAY2ALL_API_TOKEN?.trim();

    const baseUrl =
      process.env.PAY2ALL_BASE_URL?.trim() ||
      "https://pay2all.in/api/v1";

    if (!apiToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "PAY2ALL_API_TOKEN is not configured.",
        },
        { status: 500 }
      );
    }

    // ================================================
    // SAFE PROVIDER CATALOGUE TEST
    // No recharge / no wallet debit
    // ================================================

    const response = await fetch(
      `${baseUrl}/providers`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: "application/json",
        },

        cache: "no-store",
      }
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        rawResponse: text.slice(0, 500),
      };
    }

    if (!response.ok) {
      console.error(
        "PAY2ALL PROVIDER TEST FAILED:",
        response.status,
        data
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Pay2All API connection failed.",
          httpStatus: response.status,
          providerResponse: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Pay2All API connection successful.",

      mode:
        process.env.PAY2ALL_MODE || "UAT",

      providerResponse: data,
    });
  } catch (error) {
    console.error(
      "PAY2ALL TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Pay2All connection test failed.",
      },
      { status: 500 }
    );
  }
}