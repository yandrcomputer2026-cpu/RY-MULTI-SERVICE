import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
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
    // GET CURRENT KYC
    // ==========================================
    const kyc = await prisma.kyc.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!kyc) {
      return NextResponse.json(
        {
          success: false,
          message:
            "पहले सभी required KYC documents upload करें।",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // ALREADY VERIFIED
    // ==========================================
    if (kyc.status === "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          message: "KYC पहले से verified है।",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // ALREADY PENDING
    // ==========================================
    if (kyc.status === "PENDING") {
      return NextResponse.json(
        {
          success: true,
          message:
            "KYC पहले से verification review में है।",
        }
      );
    }

    // ==========================================
    // REQUIRED DOCUMENT CHECK
    // ==========================================
    const missingDocuments: string[] = [];

    if (!kyc.panDocumentUrl) {
      missingDocuments.push("PAN Card");
    }

    if (!kyc.aadhaarFrontUrl) {
      missingDocuments.push("Aadhaar Front");
    }

    if (!kyc.aadhaarBackUrl) {
      missingDocuments.push("Aadhaar Back");
    }

    if (!kyc.profilePhotoUrl) {
      missingDocuments.push("Profile Photo");
    }

    if (missingDocuments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `इन documents को पहले upload करें: ${missingDocuments.join(
            ", "
          )}.`,
          missingDocuments,
        },
        { status: 400 }
      );
    }

    // ==========================================
    // SUBMIT FOR ADMIN REVIEW
    // ==========================================
    await prisma.kyc.update({
      where: {
        userId: user.id,
      },
      data: {
        status: "PENDING",
        rejectionReason: null,
        verifiedAt: null,
        verifiedBy: null,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "KYC successfully verification के लिए submit हो गया है।",
    });
  } catch (error) {
    console.error("KYC SUBMIT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "KYC submit नहीं हो सका। कृपया दोबारा कोशिश करें।",
      },
      { status: 500 }
    );
  }
}