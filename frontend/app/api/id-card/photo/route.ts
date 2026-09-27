import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}

export async function GET() {
  try {
    // ==========================================
    // 1. LOGIN CHECK
    // ==========================================
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("Login required.", 401);
    }

    // ==========================================
    // 2. GET CURRENT USER KYC
    // ==========================================
    const kyc = await prisma.kyc.findUnique({
      where: {
        userId: currentUser.id,
      },
      select: {
        status: true,
        profilePhotoUrl: true,
      },
    });

    if (!kyc) {
      return jsonError(
        "KYC record नहीं मिला।",
        404
      );
    }

    // ==========================================
    // 3. VERIFIED KYC ONLY
    // ==========================================
    if (kyc.status !== "VERIFIED") {
      return jsonError(
        "Verified KYC required.",
        403
      );
    }

    // ==========================================
    // 4. PROFILE PHOTO CHECK
    // ==========================================
    const storageKey = kyc.profilePhotoUrl;

    if (!storageKey) {
      return jsonError(
        "KYC profile photo उपलब्ध नहीं है।",
        404
      );
    }

    // ==========================================
    // 5. OWNERSHIP CHECK
    // ==========================================
    const expectedPrefix =
      `kyc/${currentUser.id}/profile_photo/`;

    if (!storageKey.startsWith(expectedPrefix)) {
      console.error(
        "ID CARD PROFILE PHOTO OWNERSHIP ERROR"
      );

      return jsonError(
        "Invalid profile photo reference.",
        403
      );
    }

    // ==========================================
    // 6. GENERATE PRIVATE SIGNED URL
    // ==========================================
    const privateUrl =
      await storageProvider.getPrivateUrl(
        storageKey
      );

    // ==========================================
    // 7. REDIRECT TO PRIVATE PHOTO
    // ==========================================
    const response =
      NextResponse.redirect(privateUrl);

    response.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0"
    );

    return response;
  } catch (error) {
    console.error(
      "ID CARD PROFILE PHOTO ERROR:",
      error
    );

    return jsonError(
      "Profile photo load करने में समस्या आई।",
      500
    );
  }
}