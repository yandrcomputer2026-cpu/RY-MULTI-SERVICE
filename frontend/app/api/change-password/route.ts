import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Logged-in user check
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "आप Login नहीं हैं।" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;

    // Fields check
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "सभी fields भरना जरूरी है।" },
        { status: 400 }
      );
    }

    // New password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New Password कम से कम 6 characters का होना चाहिए।" },
        { status: 400 }
      );
    }

    // Database से user लें
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: "User नहीं मिला।" },
        { status: 404 }
      );
    }

    // Current password check
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      dbUser.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Current Password गलत है।" },
        { status: 401 }
      );
    }

    // New password hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Database update
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "Password successfully change हो गया।",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);

    return NextResponse.json(
      {
        message: "Server error. कृपया बाद में फिर कोशिश करें।",
      },
      { status: 500 }
    );
  }
}