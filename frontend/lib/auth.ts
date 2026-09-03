import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "ry_session";

// ======================================================
// CREATE SESSION
// ======================================================

export async function createSession(userId: number) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// ======================================================
// GET SESSION
// ======================================================

export async function getSession() {
  const cookieStore = await cookies();

  const session = cookieStore.get(COOKIE_NAME);

  return session?.value || null;
}

// ======================================================
// GET CURRENT USER
// ======================================================

export async function getCurrentUser() {
  const session = await getSession();

  // Login नहीं है
  if (!session) {
    return null;
  }

  const userId = Number(session);

  // Invalid session
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
    },
  });

  // User database में नहीं है
  if (!user) {
    return null;
  }

  return user;
}

// ======================================================
// CLEAR SESSION / LOGOUT
// ======================================================

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}