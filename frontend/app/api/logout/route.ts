import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      {
        status: 500,
      }
    );
  }
}