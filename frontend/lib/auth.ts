import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "ry_session";

// ======================================================
// CREATE SESSION
// ======================================================

export async function createSession(
  userId: number
) {
  try {
    const cookieStore =
      await cookies();

    cookieStore.set(
      COOKIE_NAME,
      String(userId),
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/",
        maxAge:
          60 * 60 * 24 * 7, // 7 days
      }
    );
  } catch (error) {
    console.error(
      "CREATE SESSION ERROR:",
      error
    );

    throw error;
  }
}

// ======================================================
// GET SESSION
// ======================================================

export async function getSession() {
  try {
    const cookieStore =
      await cookies();

    const session =
      cookieStore.get(
        COOKIE_NAME
      );

    return (
      session?.value || null
    );
  } catch (error) {
    console.error(
      "GET SESSION ERROR:",
      error
    );

    return null;
  }
}

// ======================================================
// GET CURRENT USER
// ======================================================

export async function getCurrentUser() {
  try {
    const session =
      await getSession();

    // Login नहीं है
    if (!session) {
      return null;
    }

    const userId =
      Number(session);

    // Invalid session
    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {
      console.warn(
        "INVALID SESSION USER ID:",
        session
      );

      return null;
    }

    const user =
      await prisma.user.findUnique(
        {
          where: {
            id: userId,
          },

          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        }
      );

    // User database में नहीं है
    if (!user) {
      console.warn(
        "SESSION USER NOT FOUND:",
        userId
      );

      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return null;
  }
}

// ======================================================
// CLEAR SESSION / LOGOUT
// ======================================================

export async function clearSession() {
  try {
    const cookieStore =
      await cookies();

    cookieStore.delete(
      COOKIE_NAME
    );
  } catch (error) {
    console.error(
      "CLEAR SESSION ERROR:",
      error
    );
  }
}