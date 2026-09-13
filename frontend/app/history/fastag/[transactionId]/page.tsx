import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type FastagDescription = {
  bookingType?: string;

  fastag?: {
    vehicleNumber?: string;
    provider?: string;
  };

  payment?: {
    amount?: number;
    currency?: string;
  };
};

function parseDescription(
  description: string | null
): FastagDescription {
  if (!description) return {};

  try {
    return JSON.parse(description) as FastagDescription;
  } catch {
    return {};
  }
}

function formatValue(value?: string) {
  if (!value) return "-";

  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
    )
    .join(" ");
}

export default async function FastagHistoryDetailsPage({
  params,
}: {
  params: Promise<{
    transactionId: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { transactionId } = await params;

  const transaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,
        userId: user.id,
        service: "FASTAG_RECHARGE",
      },
    });

  if (!transaction) {
    notFound();
  }

  const details = parseDescription(
    transaction.description
  );

  const vehicleNumber =
    details.fastag?.vehicleNumber ||
    transaction.referenceId ||
    "-";

  const fastagProvider =
    details.fastag?.provider ||
    transaction.provider ||
    "-";

  const amount = Number(transaction.amount);

  const status = String(
    transaction.status || "PENDING"
  ).toUpperCase();

  const isSuccess =
    status === "FASTAG_SUCCESS" ||
    status === "SUCCESS";

  const isFailed =
    status === "FASTAG_FAILED" ||
    status === "FAILED";

  const isPending =
    status === "PENDING" ||
    status === "PAYMENT_PENDING";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              RY MULTI SERVICE
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              🚗 FASTag Transaction Details
            </h1>
          </div>

          <Link
            href="/history"
            className="rounded-lg bg-gray-800 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-gray-900"
          >
            ← Back to History
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Transaction ID
              </p>

              <p className="mt-1 break-all font-semibold text-gray-900">
                {transaction.transactionId}
              </p>

              <p className="mt-4 text-sm text-gray-500">
                Service
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                FASTAG_RECHARGE
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-sm text-gray-500">
                Amount
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-600">
                ₹
                {Number.isFinite(amount)
                  ? amount.toFixed(2)
                  : "0.00"}
              </p>

              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  isSuccess
                    ? "bg-green-100 text-green-700"
                    : isFailed
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {isPending && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                ⏳ FASTag Provider Integration Pending
              </p>

              <p className="mt-1 text-sm text-amber-700">
                इस transaction की entry successfully create हो चुकी है,
                लेकिन live FASTag recharge अभी complete नहीं किया गया है।
                Authorized FASTag provider API integration बाकी है।
              </p>
            </div>
          )}

          {isFailed && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-700">
                ❌ FASTag Transaction Failed
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-700">
                ✅ FASTag Recharge Successful
              </p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Detail
              label="Vehicle Number"
              value={vehicleNumber}
            />

            <Detail
              label="FASTag Provider"
              value={formatValue(
                fastagProvider
              )}
            />

            <Detail
              label="Category"
              value={
                transaction.category ||
                "FASTAG"
              }
            />

            <Detail
              label="Currency"
              value={
                details.payment?.currency ||
                "INR"
              }
            />

            <Detail
              label="Reference ID"
              value={
                transaction.referenceId ||
                "-"
              }
            />

            <Detail
              label="Created At"
              value={transaction.createdAt.toLocaleString(
                "en-IN"
              )}
            />

            <Detail
              label="Payment Provider"
              value={
                transaction.razorpayPaymentId
                  ? "RAZORPAY"
                  : "-"
              }
            />

            <Detail
              label="Payment ID"
              value={
                transaction.razorpayPaymentId ||
                "-"
              }
            />

            <Detail
              label="Order ID"
              value={
                transaction.razorpayOrderId ||
                "-"
              }
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200 pt-6">
            <Link
              href="/history"
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              📋 My History
            </Link>

            <Link
              href="/service1/fastag"
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              🚗 FASTag Recharge
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-all font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}