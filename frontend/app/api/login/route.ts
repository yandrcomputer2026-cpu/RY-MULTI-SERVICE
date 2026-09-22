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

    const identifier =
      typeof body?.identifier === "string"
        ? body.identifier.trim()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    console.log("LOGIN BODY:", {
      identifier,
      passwordReceived: !!password,
    });

    // =========================================
    // 2. VALIDATION
    // =========================================

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User Code / Registered Mobile Number और Password भरना जरूरी है।",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 3. NORMALIZE IDENTIFIER
    // =========================================

    // User code को uppercase रखें:
    // ry100001 -> RY100001
    const normalizedUserCode = identifier.toUpperCase();

    // Mobile से spaces आदि हटाने की जरूरत नहीं,
    // क्योंकि registered mobile 10 digits में save है.
    const normalizedMobile = identifier.replace(/\D/g, "");

    // =========================================
    // 4. FIND USER BY USER CODE OR MOBILE
    // =========================================

    console.log("SEARCHING USER:", identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            userCode: normalizedUserCode,
          },
          {
            mobile: normalizedMobile,
          },
        ],
      },
    });

    // =========================================
    // 5. USER NOT FOUND
    // =========================================

    if (!user) {
      console.log("USER NOT FOUND:", identifier);

      return NextResponse.json(
        {
          success: false,
          message: "User Code / Mobile Number या Password गलत है।",
        },
        {
          status: 401,
        }
      );
    }

    console.log("USER FOUND:", {
      id: user.id,
      userCode: user.userCode,
      mobile: user.mobile,
      name: user.name,
    });

    // =========================================
    // 6. PASSWORD CHECK
    // =========================================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      console.log("PASSWORD DOES NOT MATCH");

      return NextResponse.json(
        {
          success: false,
          message: "User Code / Mobile Number या Password गलत है।",
        },
        {
          status: 401,
        }
      );
    }

    console.log("PASSWORD MATCHED");

    // =========================================
    // 7. CREATE SESSION
    // =========================================

    await createSession(user.id);

    console.log("SESSION CREATED SUCCESSFULLY");

    // =========================================
    // 8. LOGIN SUCCESS
    // =========================================

    console.log("LOGIN SUCCESS:", {
      id: user.id,
      userCode: user.userCode,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successfully हो गया।",

        user: {
          id: user.id,
          userCode: user.userCode,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
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