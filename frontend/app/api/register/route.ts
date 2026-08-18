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

    // सभी fields check
    if (!name || !mobile || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "सभी fields भरना जरूरी है।" },
        { status: 400 }
      );
    }

    // Mobile validation
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { message: "Mobile number 10 digits का होना चाहिए।" },
        { status: 400 }
      );
    }

    // Password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password कम से कम 6 characters का होना चाहिए।" },
        { status: 400 }
      );
    }

    // Password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Password और Confirm Password match नहीं कर रहे हैं।" },
        { status: 400 }
      );
    }

    // पहले check करें user मौजूद है या नहीं
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

    // Password को hash करें
    const hashedPassword = await bcrypt.hash(password, 10);

    // User को database में save करें
    const user = await prisma.user.create({
      data: {
        name,
        mobile,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "Account successfully create हो गया।",
        user: {
          id: user.id,
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
      { message: "Server error. कृपया बाद में फिर कोशिश करें।" },
      { status: 500 }
    );
  }
}