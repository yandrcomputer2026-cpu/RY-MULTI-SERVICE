import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // Logged-in user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // User का wallet ढूँढें
    let wallet = await prisma.wallet.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    // पहली बार wallet नहीं है तो ₹0 से create करें
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: currentUser.id,
          availableBalance: 0,
          lockedBalance: 0,
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        availableBalance: wallet.availableBalance.toString(),
        lockedBalance: wallet.lockedBalance.toString(),
        status: wallet.status,
      },
    });
  } catch (error) {
    console.error("GET WALLET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Wallet load नहीं हो सका।",
      },
      { status: 500 }
    );
  }
}