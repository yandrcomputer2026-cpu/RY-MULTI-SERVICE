import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// HELPER - CHECK ADMIN
// =====================================================

async function requireAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: NextResponse.json(
        { message: "Login required." },
        { status: 401 }
      ),
      user: null,
    };
  }

  if (currentUser.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      ),
      user: null,
    };
  }

  return {
    error: null,
    user: currentUser,
  };
}

// =====================================================
// GET FSE + ASSIGNED AREAS
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
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

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

    // -----------------------------------------
    // CHECK FSE
    // -----------------------------------------

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

        fseAreas: {
          orderBy: {
            createdAt: "desc",
          },

          select: {
            id: true,
            pincode: true,
            isActive: true,
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

    return NextResponse.json({
      fse,
      areas: fse.fseAreas,
    });
  } catch (error) {
    console.error("GET_FSE_AREA_ERROR:", error);

    return NextResponse.json(
      {
        message: "FSE area load नहीं हो सका।",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// ADD PINCODE TO FSE
// =====================================================

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

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

    // -----------------------------------------
    // REQUEST BODY
    // -----------------------------------------

    const body = await request.json();

    const pincode =
      typeof body.pincode === "string"
        ? body.pincode.trim()
        : "";

    // -----------------------------------------
    // PINCODE VALIDATION
    // -----------------------------------------

    if (!pincode) {
      return NextResponse.json(
        {
          message: "PIN code डालना जरूरी है।",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          message: "PIN code 6 digits का होना चाहिए।",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // CHECK FSE
    // -----------------------------------------

    const fse = await prisma.user.findFirst({
      where: {
        id: fseId,
        role: "FSE",
      },

      select: {
        id: true,
        name: true,
        userCode: true,
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

    // -----------------------------------------
    // CHECK EXISTING PINCODE FOR SAME FSE
    // -----------------------------------------

    const existingArea =
      await prisma.fseArea.findUnique({
        where: {
          fseId_pincode: {
            fseId,
            pincode,
          },
        },
      });

    if (existingArea) {
      // पहले inactive किया गया था तो वापस active करें
      if (!existingArea.isActive) {
        const restoredArea =
          await prisma.fseArea.update({
            where: {
              id: existingArea.id,
            },

            data: {
              isActive: true,
            },
          });

        return NextResponse.json({
          message: `${pincode} PIN code फिर से active कर दिया गया।`,
          area: restoredArea,
        });
      }

      return NextResponse.json(
        {
          message:
            "यह PIN code इस FSE को पहले से assigned है।",
        },
        {
          status: 409,
        }
      );
    }

    // -----------------------------------------
    // CREATE FSE AREA
    // -----------------------------------------

    const area = await prisma.fseArea.create({
      data: {
        fseId,
        pincode,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        message: `${pincode} PIN code successfully assign हो गया।`,
        area,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE_FSE_AREA_ERROR:", error);

    return NextResponse.json(
      {
        message: "PIN code assign नहीं हो सका।",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// REMOVE / DEACTIVATE PINCODE
// =====================================================

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

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

    // -----------------------------------------
    // REQUEST BODY
    // -----------------------------------------

    const body = await request.json();

    const areaId = Number(body.areaId);

    if (!Number.isInteger(areaId) || areaId <= 0) {
      return NextResponse.json(
        {
          message: "Invalid Area ID.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // CHECK AREA BELONGS TO THIS FSE
    // -----------------------------------------

    const area = await prisma.fseArea.findFirst({
      where: {
        id: areaId,
        fseId,
      },
    });

    if (!area) {
      return NextResponse.json(
        {
          message: "Assigned area नहीं मिला।",
        },
        {
          status: 404,
        }
      );
    }

    if (!area.isActive) {
      return NextResponse.json({
        message: "यह PIN code पहले से inactive है।",
      });
    }

    // -----------------------------------------
    // SOFT DELETE
    // -----------------------------------------

    const updatedArea = await prisma.fseArea.update({
      where: {
        id: area.id,
      },

      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      message: `${area.pincode} PIN code remove कर दिया गया।`,
      area: updatedArea,
    });
  } catch (error) {
    console.error("DELETE_FSE_AREA_ERROR:", error);

    return NextResponse.json(
      {
        message: "PIN code remove नहीं हो सका।",
      },
      {
        status: 500,
      }
    );
  }
}