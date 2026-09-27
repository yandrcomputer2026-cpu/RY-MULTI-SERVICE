import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedDocumentTypes = [
  "PAN",
  "AADHAAR_FRONT",
  "AADHAAR_BACK",
  "PROFILE_PHOTO",
] as const;

type DocumentType = (typeof allowedDocumentTypes)[number];

function isDocumentType(value: string): value is DocumentType {
  return allowedDocumentTypes.includes(value as DocumentType);
}

export async function GET(request: Request) {
  try {
    // ==========================================
    // 1. LOGIN + ADMIN CHECK
    // ==========================================
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Login required.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==========================================
    // 2. READ QUERY PARAMETERS
    // ==========================================
    const { searchParams } = new URL(request.url);

    const userIdValue = searchParams.get("userId");
    const documentTypeValue =
      searchParams.get("documentType");

    if (!userIdValue || !documentTypeValue) {
      return NextResponse.json(
        {
          success: false,
          message:
            "userId और documentType required हैं।",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const userId = Number(userIdValue);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid userId.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!isDocumentType(documentTypeValue)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document type.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==========================================
    // 3. GET USER KYC
    // ==========================================
    const kyc = await prisma.kyc.findUnique({
      where: {
        userId,
      },
      select: {
        userId: true,
        panDocumentUrl: true,
        aadhaarFrontUrl: true,
        aadhaarBackUrl: true,
        profilePhotoUrl: true,
      },
    });

    if (!kyc) {
      return NextResponse.json(
        {
          success: false,
          message: "KYC record नहीं मिला।",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==========================================
    // 4. GET PRIVATE STORAGE KEY
    // ==========================================
    let storageKey: string | null = null;

    switch (documentTypeValue) {
      case "PAN":
        storageKey = kyc.panDocumentUrl;
        break;

      case "AADHAAR_FRONT":
        storageKey = kyc.aadhaarFrontUrl;
        break;

      case "AADHAAR_BACK":
        storageKey = kyc.aadhaarBackUrl;
        break;

      case "PROFILE_PHOTO":
        storageKey = kyc.profilePhotoUrl;
        break;
    }

    if (!storageKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "यह document अभी upload नहीं किया गया है।",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==========================================
    // 5. OWNERSHIP SAFETY CHECK
    // ==========================================
    const expectedPrefix = `kyc/${userId}/`;

    if (!storageKey.startsWith(expectedPrefix)) {
      console.error(
        "KYC STORAGE KEY OWNERSHIP ERROR"
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid document reference.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ==========================================
    // 6. GENERATE SHORT-LIVED PRIVATE URL
    // ==========================================
    const privateUrl =
      await storageProvider.getPrivateUrl(
        storageKey
      );

    // ==========================================
    // 7. REDIRECT DIRECTLY TO PRIVATE DOCUMENT
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
      "ADMIN KYC DOCUMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Private KYC document खोलने में समस्या आई।",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}