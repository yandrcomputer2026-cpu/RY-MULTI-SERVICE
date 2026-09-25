import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    const response = await fetch(
      `${baseUrl.replace(/\/+$/, "")}/balance`,
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

    let providerResponse: unknown;

    try {
      providerResponse = JSON.parse(text);
    } catch {
      providerResponse = {
        rawResponse: text.slice(0, 500),
      };
    }

    return NextResponse.json(
      {
        success: response.ok,

        message: response.ok
          ? "Pay2All wallet balance response received."
          : "Pay2All wallet balance request failed.",

        mode:
          process.env.PAY2ALL_MODE || "UAT",

        httpStatus: response.status,

        providerResponse,
      },
      {
        status: response.ok ? 200 : 502,
      }
    );
  } catch (error) {
    console.error(
      "PAY2ALL BALANCE TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Pay2All wallet balance check failed.",
      },
      { status: 500 }
    );
  }
}