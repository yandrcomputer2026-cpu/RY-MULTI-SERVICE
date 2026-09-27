import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/provider";
import type { KycDocumentType } from "@/lib/storage/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const DOCUMENT_FIELD_MAP = {
  PAN: "panDocumentUrl",
  AADHAAR_FRONT: "aadhaarFrontUrl",
  AADHAAR_BACK: "aadhaarBackUrl",
  PROFILE_PHOTO: "profilePhotoUrl",
} as const;

function isDocumentType(
  value: string
): value is KycDocumentType {
  return value in DOCUMENT_FIELD_MAP;
}

export async function POST(request: Request) {
  try {
    // ==========================================
    // 1. LOGIN CHECK
    // ==========================================
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. READ FORM DATA
    // ==========================================
    const formData = await request.formData();

    const fileValue = formData.get("file");
    const documentTypeValue =
      formData.get("documentType");

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Document file is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof documentTypeValue !== "string" ||
      !isDocumentType(documentTypeValue)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document type.",
        },
        { status: 400 }
      );
    }

    const file = fileValue;
    const documentType = documentTypeValue;

    // ==========================================
    // 3. FILE VALIDATION
    // ==========================================
    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum file size is 5 MB.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG and PDF documents are allowed.",
        },
        { status: 400 }
      );
    }

    if (
      documentType === "PROFILE_PHOTO" &&
      !["image/jpeg", "image/png"].includes(file.type)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Profile photo must be a JPG or PNG image.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 4. GET CURRENT KYC
    // ==========================================
    const existingKyc =
      await prisma.kyc.findUnique({
        where: {
          userId: user.id,
        },
      });

    // ==========================================
    // 5. SECURITY STATUS LOCK
    // ==========================================
    if (existingKyc?.status === "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message:
            "KYC review के लिए submit हो चुकी है। Review पूरा होने तक documents बदले नहीं जा सकते।",
        },
        { status: 409 }
      );
    }

    if (existingKyc?.status === "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verified KYC documents बदले नहीं जा सकते।",
        },
        { status: 409 }
      );
    }

    // केवल NOT_SUBMITTED / REJECTED आगे आएँगे

    const databaseField =
      DOCUMENT_FIELD_MAP[documentType];

    const previousStorageKey =
      existingKyc?.[databaseField] ?? null;

    // ==========================================
    // 6. UPLOAD TO PRIVATE STORAGE
    // ==========================================
    const uploaded =
      await storageProvider.upload({
        file,
        userId: user.id,
        documentType,
      });

    // ==========================================
    // 7. SAVE STORAGE KEY IN DATABASE
    // ==========================================
    try {
      await prisma.kyc.upsert({
        where: {
          userId: user.id,
        },

        create: {
          userId: user.id,
          [databaseField]: uploaded.key,
          status: "NOT_SUBMITTED",
        },

        update: {
          [databaseField]: uploaded.key,

          // Rejected KYC correction शुरू होते ही
          // वापस NOT_SUBMITTED हो जाएगी.
          status:
            existingKyc?.status === "REJECTED"
              ? "NOT_SUBMITTED"
              : "NOT_SUBMITTED",

          rejectionReason:
            existingKyc?.status === "REJECTED"
              ? null
              : existingKyc?.rejectionReason,
        },
      });
    } catch (databaseError) {
      // DB save fail होने पर नया uploaded file delete करें
      try {
        await storageProvider.delete(
          uploaded.key
        );
      } catch (cleanupError) {
        console.error(
          "KYC STORAGE CLEANUP ERROR:",
          cleanupError
        );
      }

      throw databaseError;
    }

    // ==========================================
    // 8. DELETE OLD DOCUMENT AFTER DB SUCCESS
    // ==========================================
    if (
      previousStorageKey &&
      previousStorageKey !== uploaded.key
    ) {
      try {
        await storageProvider.delete(
          previousStorageKey
        );
      } catch (deleteError) {
        console.error(
          "OLD KYC DOCUMENT DELETE ERROR:",
          deleteError
        );
      }
    }

    // ==========================================
    // 9. SUCCESS
    // ==========================================
    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully.",
      documentType,
      fileName: uploaded.fileName,
    });
  } catch (error) {
    console.error("KYC UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Document upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}