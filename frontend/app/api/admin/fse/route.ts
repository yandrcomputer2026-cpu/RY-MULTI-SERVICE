import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// GET ALL FSE
// =====================================================
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Login required." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const fseUsers = await prisma.user.findMany({
        
      where: {
        role: "FSE",
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        userCode: true,
        name: true,
        mobile: true,
        email: true,
        role: true,
        createdAt: true,

        _count: {
          select: {
            onboardedUsers: true,
          },
        },
      },
    });

    return NextResponse.json({
      fse: fseUsers,
    });
  } catch (error) {
    console.error("GET_FSE_ERROR:", error);

    return NextResponse.json(
      {
        message: "FSE list load नहीं हो सकी।",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// CREATE FSE
// =====================================================
export async function POST(request: Request) {
  try {
    // =================================================
    // ADMIN SECURITY
    // =================================================
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Login required." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { message: "केवल Admin FSE बना सकता है।" },
        { status: 403 }
      );
    }

    // =================================================
    // REQUEST BODY
    // =================================================
    const body = await request.json();

    const name = body.name?.trim();
    const mobile = body.mobile?.trim();
    const email = body.email?.trim().toLowerCase();

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    // =================================================
    // REQUIRED FIELDS
    // =================================================
    if (
      !name ||
      !mobile ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          message: "सभी fields भरना जरूरी है।",
        },
        { status: 400 }
      );
    }

    // =================================================
    // MOBILE VALIDATION
    // =================================================
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        {
          message: "Mobile number 10 digits का होना चाहिए।",
        },
        { status: 400 }
      );
    }

    // =================================================
    // EMAIL BASIC VALIDATION
    // =================================================
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          message: "Valid email address डालें।",
        },
        { status: 400 }
      );
    }

    // =================================================
    // PASSWORD VALIDATION
    // =================================================
    if (password.length < 6) {
      return NextResponse.json(
        {
          message:
            "Password कम से कम 6 characters का होना चाहिए।",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          message:
            "Password और Confirm Password match नहीं कर रहे हैं।",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CHECK DUPLICATE USER
    // =================================================
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            mobile,
          },
        ],
      },

      select: {
        email: true,
        mobile: true,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          {
            message: "यह email पहले से registered है।",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message:
            "यह mobile number पहले से registered है।",
        },
        { status: 409 }
      );
    }

    // =================================================
    // HASH PASSWORD
    // =================================================
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // =================================================
    // CREATE UNIQUE FSE CODE
    // Example: RYFSE000001
    // =================================================
    let userCode = "";

    for (let attempt = 0; attempt < 5; attempt++) {
      const lastFse = await prisma.user.findFirst({
        where: {
          role: "FSE",
        },

        orderBy: {
          id: "desc",
        },

        select: {
          id: true,
        },
      });

      const nextNumber =
        (lastFse?.id ?? 0) + attempt + 1;

      userCode = `RYFSE${String(
        nextNumber
      ).padStart(6, "0")}`;

      const codeExists =
        await prisma.user.findUnique({
          where: {
            userCode,
          },

          select: {
            id: true,
          },
        });

      if (!codeExists) {
        break;
      }

      userCode = "";
    }

    if (!userCode) {
      return NextResponse.json(
        {
          message:
            "FSE code generate नहीं हो सका। दोबारा कोशिश करें।",
        },
        { status: 500 }
      );
    }

    // =================================================
    // CREATE FSE
    // =================================================
    const fse = await prisma.user.create({
      data: {
        userCode,
        name,
        mobile,
        email,
        password: hashedPassword,
        role: "FSE",
      },

      select: {
        id: true,
        userCode: true,
        name: true,
        mobile: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // =================================================
    // SUCCESS
    // =================================================
    return NextResponse.json(
      {
        message: "FSE successfully create हो गया।",
        fse,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE_FSE_ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Server error. FSE create नहीं हो सका।",
      },
      {
        status: 500,
      }
    );
  }
}