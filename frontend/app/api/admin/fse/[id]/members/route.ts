import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// GET FSE + ONBOARDED MEMBERS
// =====================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // ==========================================
    // ADMIN SECURITY
    // ==========================================

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Login required.",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // FSE ID
    // ==========================================

    const { id } = await context.params;

    const fseId = Number(id);

    if (!Number.isInteger(fseId) || fseId <= 0) {
      return NextResponse.json(
        {
          message: "Invalid FSE ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // LOAD FSE
    // ==========================================

    const fse = await prisma.user.findFirst({
      where: {
        id: fseId,
        role: "FSE",
      },

      select: {
        id: true,
        userCode: true,
        name: true,
        mobile: true,
        email: true,
        role: true,
        createdAt: true,

        fseAreas: {
          where: {
            isActive: true,
          },

          orderBy: {
            pincode: "asc",
          },

          select: {
            id: true,
            pincode: true,
            isActive: true,
          },
        },

        onboardedUsers: {
          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            userCode: true,
            name: true,
            mobile: true,
            email: true,
            role: true,
            pincode: true,
            registrationSource: true,
            assignmentStatus: true,
            distributorId: true,
            masterDistributorId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!fse) {
      return NextResponse.json(
        {
          message: "FSE नहीं मिला।",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // SUMMARY
    // ==========================================

    const members = fse.onboardedUsers;

    const summary = {
      total: members.length,

      retailers: members.filter(
        (member) => member.role === "RETAILER"
      ).length,

      distributors: members.filter(
        (member) => member.role === "DISTRIBUTOR"
      ).length,

      masterDistributors: members.filter(
        (member) =>
          member.role === "MASTER_DISTRIBUTOR"
      ).length,

      assigned: members.filter(
        (member) =>
          member.assignmentStatus === "ASSIGNED"
      ).length,

      pending: members.filter(
        (member) =>
          member.assignmentStatus === "PENDING"
      ).length,
    };

    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json({
      fse: {
        id: fse.id,
        userCode: fse.userCode,
        name: fse.name,
        mobile: fse.mobile,
        email: fse.email,
        role: fse.role,
        createdAt: fse.createdAt,
        areas: fse.fseAreas,
      },

      members,

      summary,
    });
  } catch (error) {
    console.error("GET_FSE_MEMBERS_ERROR:", error);

    return NextResponse.json(
      {
        message:
          "FSE members load नहीं हो सके।",
      },
      {
        status: 500,
      }
    );
  }
}