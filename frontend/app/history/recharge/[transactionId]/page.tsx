import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RechargeDescription = {
  bookingType?: string;

  recharge?: {
    mobile?: string;
    operator?: string;
    circle?: string;
  };

  payment?: {
    amount?: number;
    currency?: string;
  };

  // Old / flat support
  mobile?: string;
  operator?: string;
  circle?: string;
};

function parseDescription(
  description: string | null
): RechargeDescription {
  if (!description) {
    return {};
  }

  const value = description.trim();

  if (value.startsWith("{")) {
    try {
      return JSON.parse(
        value
      ) as RechargeDescription;
    } catch {
      return {};
    }
  }

  const mobileMatch =
    value.match(/Mobile:\s*([^,]+)/i);

  const operatorMatch =
    value.match(/Operator:\s*([^,]+)/i);

  const circleMatch =
    value.match(/Circle:\s*([^,]+)/i);

  return {
    mobile: mobileMatch?.[1]?.trim(),
    operator: operatorMatch?.[1]?.trim(),
    circle: circleMatch?.[1]?.trim(),
  };
}

function formatValue(value?: string) {
  if (!value) {
    return "-";
  }

  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

export default async function RechargeReceiptPage({
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

  const { transactionId } =
    await params;

  const transaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,
        userId: user.id,
      },
    });

  if (!transaction) {
    notFound();
  }

  const isRecharge =
    transaction.service === "MOBILE_PREPAID" ||
    transaction.service === "PREPAID_RECHARGE" ||
    transaction.service === "MOBILE_RECHARGE" ||
    transaction.category === "PREPAID_RECHARGE";

  if (!isRecharge) {
    notFound();
  }

  const details =
    parseDescription(
      transaction.description
    );

  const mobile =
    details.recharge?.mobile ||
    details.mobile ||
    transaction.referenceId ||
    "-";

  const providerFallback =
    transaction.provider &&
    transaction.provider.toUpperCase() !==
      "RAZORPAY"
      ? transaction.provider
      : "";

  const operator =
    details.recharge?.operator ||
    details.operator ||
    providerFallback ||
    "-";

  const circle =
    details.recharge?.circle ||
    details.circle ||
    "-";

  const currency =
    details.payment?.currency ||
    "INR";

  const amount =
    Number(transaction.amount);

  const status =
    String(
      transaction.status ||
      "PENDING"
    ).toUpperCase();

  const success =
    status === "RECHARGE_SUCCESS";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              RY MULTI SERVICE
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              📱 Recharge Receipt
            </h1>
          </div>

          <Link
            href="/history"
            className="rounded-lg bg-gray-800 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-900"
          >
            ← My History
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div
            className={`p-6 text-center ${
              success
                ? "bg-green-50"
                : "bg-yellow-50"
            }`}
          >
            <div className="text-5xl">
              {success
                ? "✅"
                : "⏳"}
            </div>

            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {success
                ? "Recharge Successful"
                : status}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Transaction ID:{" "}
              <span className="font-semibold">
                {
                  transaction.transactionId
                }
              </span>
            </p>
          </div>

          <div className="p-6">

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <p className="text-xs text-gray-500">
                  Mobile Number
                </p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {mobile}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Operator
                </p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatValue(
                    operator
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Circle
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {formatValue(
                    circle
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Recharge Amount
                </p>

                <p className="mt-1 text-xl font-bold text-blue-600">
                  ₹
                  {Number.isFinite(amount)
                    ? amount.toFixed(2)
                    : "0.00"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Currency
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {currency}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p
                  className={`mt-1 font-bold ${
                    success
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {status}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Payment Provider
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {transaction.razorpayPaymentId
                    ? "RAZORPAY"
                    : transaction.provider ||
                      "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Date
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {transaction.createdAt.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">

              <div>
                <p className="text-xs text-gray-500">
                  Razorpay Order ID
                </p>

                <p className="mt-1 break-all text-sm font-medium text-gray-900">
                  {transaction.razorpayOrderId ||
                    "-"}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  Razorpay Payment ID
                </p>

                <p className="mt-1 break-all text-sm font-medium text-gray-900">
                  {transaction.razorpayPaymentId ||
                    "-"}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">

              <Link
                href="/history"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                📋 My History
              </Link>

              <Link
                href="/service1/mobile-prepaid"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                📱 Recharge Again
              </Link>

              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
