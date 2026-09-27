import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

import BrandLogo from "@/components/BrandLogo";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import IdCardPrintButton from "./IdCardPrintButton";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

export default async function IdCardPage() {
  // ==========================================
  // 1. LOGIN CHECK
  // ==========================================
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // ==========================================
  // 2. GET USER + VERIFIED KYC
  // ==========================================
  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
      userCode: true,
      name: true,
      mobile: true,
      email: true,
      role: true,

      kyc: {
        select: {
          status: true,
          profilePhotoUrl: true,
          verifiedAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isVerified = user.kyc?.status === "VERIFIED";

  // ==========================================
  // 3. KYC NOT VERIFIED
  // ==========================================
  if (!isVerified) {
    return (
      <main className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <BrandLogo href="/dashboard" />

            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              ← Dashboard
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <section className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              🪪
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              ID Card Not Available
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              आपका RY MULTI SERVICE ID Card KYC verification
              complete होने के बाद automatically available होगा।
            </p>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-800">
                Current KYC Status:{" "}
                {user.kyc?.status?.replaceAll("_", " ") ??
                  "NOT SUBMITTED"}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/kyc"
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Go to KYC
              </Link>

              <Link
                href="/dashboard"
                className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900"
              >
                Dashboard
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // ==========================================
  // 4. VERIFIED USER ID CARD
  // ==========================================
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo href="/dashboard" />

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900">
            My ID Card
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            KYC verified digital service identity card
          </p>
        </div>

        {/* ID CARD */}
        <section
  id="printable-id-card"
  className="mx-auto mt-8 max-w-xl overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-xl"
>
          {/* CARD HEADER */}
          <div className="bg-blue-700 px-6 py-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm">
    <Image
      src="/ry-logo.jpg"
      alt="RY MULTI SERVICE Logo"
      width={44}
      height={44}
      className="h-full w-full object-contain"
      priority
    />
  </div>

  <div>
    <p className="text-xl font-black tracking-wide">
      RY MULTI SERVICE
    </p>

    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
      Digital Services Platform
    </p>
  </div>
</div>

              <div className="rounded-full bg-green-500 px-3 py-1 text-xs font-black">
                ✓ KYC VERIFIED
              </div>
            </div>
          </div>

          {/* CARD BODY */}
          <div className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              {/* VERIFIED KYC PROFILE PHOTO */}
<div className="h-32 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100">
  <img
    src="/api/id-card/photo"
    alt={`${user.name} Profile Photo`}
    className="h-full w-full object-cover"
  />
</div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Card Holder
                </p>

                <h2 className="mt-1 break-words text-2xl font-black text-slate-900">
                  {user.name}
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <CardInfo
                    label="User ID"
                    value={
                      user.userCode ||
                      `RY${String(user.id).padStart(6, "0")}`
                    }
                  />

                  <CardInfo
                    label="Role"
                    value={user.role}
                  />

                  <CardInfo
                    label="Mobile"
                    value={user.mobile || "-"}
                  />

                  <CardInfo
                    label="Issue Date"
                    value={formatDate(
                      user.kyc?.verifiedAt ?? null
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-dashed border-slate-300 pt-4">
              <p className="text-center text-xs leading-5 text-slate-500">
                This card identifies a KYC verified account on
                RY MULTI SERVICE.
              </p>
            </div>
          </div>

          {/* CARD FOOTER */}
          <div className="flex items-center justify-between gap-4 bg-slate-900 px-6 py-4 text-white">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Verification
              </p>

              <p className="mt-1 text-xs font-bold">
                KYC VERIFIED
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Account
              </p>

              <p className="mt-1 text-xs font-bold">
                ACTIVE
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm leading-6 text-blue-800">
            🔒 ID Card पर PAN या Aadhaar number display नहीं
            किया जाता। Card केवल verified account information
            दिखाता है।
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
  <IdCardPrintButton />

  <Link
    href="/dashboard"
    className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900"
  >
    ← Back to Dashboard
  </Link>
</div>
      </div>
    </main>
  );
}

function CardInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}