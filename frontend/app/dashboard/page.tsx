import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // FSE का अपना अलग dashboard
  if (user.role === "FSE") {
    redirect("/fse/dashboard");
  }

  // User का live wallet balance
  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      availableBalance: true,
    },
  });

  const walletBalance = wallet
    ? Number(wallet.availableBalance)
    : 0;

  return (
    <DashboardClient
      user={{
        id: user.id,
        userCode: user.userCode,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      }}
      walletBalance={walletBalance}
    />
  );
}