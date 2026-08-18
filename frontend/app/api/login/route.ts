import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    console.log("=================================");
    console.log("LOGIN API CALLED");
    console.log("=================================");

    // =========================================
    // 1. REQUEST BODY
    // =========================================

    const body = await request.json();

    console.log("LOGIN BODY:", {
      email: body?.email,
      passwordReceived: !!body?.password,
    });

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    // =========================================
    // 2. VALIDATION
    // =========================================

    if (!email || !password) {
      console.log("LOGIN VALIDATION FAILED");

      return NextResponse.json(
        {
          success: false,
          message: "Email और Password भरना जरूरी है।",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 3. FIND USER
    // =========================================

    console.log("SEARCHING USER:", email);

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      console.log("USER NOT FOUND:", email);

      return NextResponse.json(
        {
          success: false,
          message: "Email या Password गलत है।",
        },
        {
          status: 401,
        }
      );
    }

    console.log("USER FOUND:", {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // =========================================
    // 4. PASSWORD CHECK
    // =========================================

    console.log("CHECKING PASSWORD...");

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      console.log("PASSWORD DOES NOT MATCH");

      return NextResponse.json(
        {
          success: false,
          message: "Email या Password गलत है।",
        },
        {
          status: 401,
        }
      );
    }

    console.log("PASSWORD MATCHED");

    // =========================================
    // 5. CREATE SESSION
    // =========================================

    console.log("CREATING SESSION...");

    await createSession(user.id);

    console.log("SESSION CREATED SUCCESSFULLY");

    // =========================================
    // 6. LOGIN SUCCESS
    // =========================================

    console.log("LOGIN SUCCESS:", user.email);

    return NextResponse.json(
      {
        success: true,

        message: "Login successfully हो गया।",

        user: {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
        },
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    // =========================================
    // SERVER ERROR
    // =========================================

    console.error("=================================");
    console.error("LOGIN API ERROR");
    console.error("=================================");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Login के दौरान server error हुआ। कृपया terminal देखें।",
      },
      {
        status: 500,
      }
    );
  }
}