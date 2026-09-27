import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/provider";

import type { KycDocumentType } from "@/lib/storage/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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
    // AUTH
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
    // FORM DATA
    // ==========================================
    const formData = await request.formData();

    const fileValue = formData.get("file");
    const documentTypeValue = formData.get("documentType");

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
    // FILE VALIDATION
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

    // Profile photo must be an image.
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
    // CURRENT KYC
    // ==========================================
    const existingKyc = await prisma.kyc.findUnique({
      where: {
        userId: user.id,
      },
    });

    const databaseField =
      DOCUMENT_FIELD_MAP[documentType];

    const previousStorageKey =
      existingKyc?.[databaseField] ?? null;

    // ==========================================
    // PRIVATE STORAGE UPLOAD
    // ==========================================
    const uploaded =
      await storageProvider.upload({
        file,
        userId: user.id,
        documentType,
      });

    try {
      // ========================================
      // SAVE PRIVATE OBJECT KEY IN DATABASE
      // ========================================
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

          // If user replaces a document after
          // rejection, it must be reviewed again.
          status:
            existingKyc?.status === "REJECTED"
              ? "NOT_SUBMITTED"
              : existingKyc?.status,
          rejectionReason:
            existingKyc?.status === "REJECTED"
              ? null
              : existingKyc?.rejectionReason,
        },
      });
    } catch (databaseError) {
      // Database save failed, so remove the newly
      // uploaded object to avoid an orphaned file.
      try {
        await storageProvider.delete(uploaded.key);
      } catch (cleanupError) {
        console.error(
          "KYC STORAGE CLEANUP ERROR:",
          cleanupError
        );
      }

      throw databaseError;
    }

    // ==========================================
    // DELETE REPLACED OLD DOCUMENT
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
        // New document is already safely saved.
        // Do not fail the whole request only because
        // old-file cleanup failed.
        console.error(
          "OLD KYC DOCUMENT DELETE ERROR:",
          deleteError
        );
      }
    }

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