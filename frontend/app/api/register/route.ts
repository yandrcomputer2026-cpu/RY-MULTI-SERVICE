import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const mobile = body.mobile?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const confirmPassword = body.confirmPassword;

    // ===============================
    // REQUIRED FIELDS
    // ===============================
    if (!name || !mobile || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "सभी fields भरना जरूरी है।" },
        { status: 400 }
      );
    }

    // ===============================
    // MOBILE VALIDATION
    // ===============================
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { message: "Mobile number 10 digits का होना चाहिए।" },
        { status: 400 }
      );
    }

    // ===============================
    // PASSWORD VALIDATION
    // ===============================
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password कम से कम 6 characters का होना चाहिए।" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Password और Confirm Password match नहीं कर रहे हैं।" },
        { status: 400 }
      );
    }

    // ===============================
    // CHECK EXISTING USER
    // ===============================
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { mobile }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: "यह email पहले से registered है।" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { message: "यह mobile number पहले से registered है।" },
        { status: 409 }
      );
    }

    // ===============================
    // PASSWORD HASH
    // ===============================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===============================
    // FIND NEXT USER CODE
    // ===============================
    const lastUser = await prisma.user.findFirst({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
      },
    });

    const nextNumber = (lastUser?.id ?? 0) + 100001;

    const userCode = `RY${nextNumber}`;

    // ===============================
    // CREATE USER
    // ===============================
    const user = await prisma.user.create({
      data: {
        userCode,
        name,
        mobile,
        email,
        password: hashedPassword,
      },
    });

    // ===============================
    // SUCCESS RESPONSE
    // ===============================
    return NextResponse.json(
      {
        message: "Account successfully create हो गया।",

        user: {
          id: user.id,
          userCode: user.userCode,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      {
        message: "Server error. कृपया बाद में फिर कोशिश करें।",
      },
      { status: 500 }
    );
  }
}