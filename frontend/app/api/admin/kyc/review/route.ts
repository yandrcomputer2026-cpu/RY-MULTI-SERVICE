import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReviewAction = "VERIFY" | "REJECT";

type ReviewBody = {
  userId?: number;
  action?: ReviewAction;
  rejectionReason?: string;
};

export async function POST(request: Request) {
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
        { status: 401 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // 2. READ REQUEST
    // ==========================================
    const body = (await request.json()) as ReviewBody;

    const userId = Number(body.userId);
    const action = body.action;

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid userId.",
        },
        { status: 400 }
      );
    }

    if (action !== "VERIFY" && action !== "REJECT") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid review action.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. GET KYC RECORD
    // ==========================================
    const kyc = await prisma.kyc.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        status: true,

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
        { status: 404 }
      );
    }

    // ==========================================
    // 4. ONLY PENDING KYC CAN BE REVIEWED
    // ==========================================
    if (kyc.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message:
            "केवल PENDING KYC को Verify या Reject किया जा सकता है।",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 5. VERIFY
    // ==========================================
    if (action === "VERIFY") {
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
            message: `KYC verify नहीं किया जा सकता। Missing documents: ${missingDocuments.join(
              ", "
            )}.`,
            missingDocuments,
          },
          { status: 400 }
        );
      }

      await prisma.kyc.update({
        where: {
          userId,
        },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy: currentUser.id,
          rejectionReason: null,
        },
      });

      return NextResponse.json({
        success: true,
        status: "VERIFIED",
        message: "KYC successfully verified हो गया है।",
      });
    }

    // ==========================================
    // 6. REJECT
    // ==========================================
    const rejectionReason =
      body.rejectionReason?.trim() ?? "";

    if (rejectionReason.length < 5) {
      return NextResponse.json(
        {
          success: false,
          message:
            "KYC reject करने के लिए कम से कम 5 characters का reason लिखें।",
        },
        { status: 400 }
      );
    }

    if (rejectionReason.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rejection reason अधिकतम 500 characters का हो सकता है।",
        },
        { status: 400 }
      );
    }

    await prisma.kyc.update({
      where: {
        userId,
      },
      data: {
        status: "REJECTED",
        rejectionReason,
        verifiedAt: null,
        verifiedBy: null,
      },
    });

    return NextResponse.json({
      success: true,
      status: "REJECTED",
      message: "KYC reject कर दिया गया है।",
    });
  } catch (error) {
    console.error("ADMIN KYC REVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "KYC review process में समस्या आई। कृपया दोबारा कोशिश करें।",
      },
      { status: 500 }
    );
  }
}