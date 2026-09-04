import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DthDescription = {
  bookingType?: string;

  dth?: {
    customerId?: string;
    operator?: string;
  };

  payment?: {
    amount?: number;
    currency?: string;
  };

  customerId?: string;
  operator?: string;
};

function parseDescription(
  description: string | null
): DthDescription {
  if (!description) {
    return {};
  }

  const value = description.trim();

  if (value.startsWith("{")) {
    try {
      return JSON.parse(value) as DthDescription;
    } catch {
      return {};
    }
  }

  const customerIdMatch = value.match(
    /DTH Customer ID:\s*([^,]+)/i
  );

  const operatorMatch = value.match(
    /Operator:\s*([^,]+)/i
  );

  return {
    customerId: customerIdMatch?.[1]?.trim(),
    operator: operatorMatch?.[1]?.trim(),
  };
}

function formatValue(value?: string | null) {
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

export default async function DthReceiptPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
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
      },
    });

  if (!transaction) {
    notFound();
  }

  const isDthTransaction =
    transaction.service === "DTH_RECHARGE" ||
    transaction.service === "DTH" ||
    transaction.category === "DTH";

  if (!isDthTransaction) {
    notFound();
  }

  const details =
    parseDescription(transaction.description);

  const providerFallback =
    transaction.provider &&
    transaction.provider.toUpperCase() !== "RAZORPAY"
      ? transaction.provider
      : "";

  const customerId =
    details.dth?.customerId ||
    details.customerId ||
    transaction.referenceId ||
    "-";

  const operator =
    details.dth?.operator ||
    details.operator ||
    providerFallback ||
    "-";

  const amount = Number(transaction.amount);

  const currency =
    details.payment?.currency || "INR";

  const status = String(
    transaction.status || "PENDING"
  ).toUpperCase();

  const paymentProvider =
    transaction.razorpayPaymentId
      ? "RAZORPAY"
      : transaction.provider || "-";

  const success = status === "DTH_SUCCESS";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div
            className={`px-6 py-8 text-center ${
              success ? "bg-green-50" : "bg-yellow-50"
            }`}
          >
            <div className="text-5xl">📺</div>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              RY MULTI SERVICE
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              DTH Recharge Receipt
            </h1>

            <p
              className={`mt-3 font-semibold ${
                success
                  ? "text-green-700"
                  : "text-yellow-700"
              }`}
            >
              {success
                ? "DTH Recharge Successful"
                : "DTH Recharge Status"}
            </p>

            <span
              className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-bold ${
                success
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500">
                Transaction ID
              </p>

              <p className="mt-1 break-all font-semibold text-blue-700">
                {transaction.transactionId}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Customer ID
                </p>
                <p className="mt-1 break-all font-semibold text-gray-900">
                  {customerId}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  DTH Operator
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatValue(operator)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Recharge Amount
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  ₹
                  {Number.isFinite(amount)
                    ? amount.toFixed(2)
                    : "0.00"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Currency
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {currency}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Payment Provider
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {paymentProvider}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Category
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {transaction.category || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                <p className="text-xs text-gray-500">
                  Razorpay Order ID
                </p>
                <p className="mt-1 break-all text-sm font-medium text-gray-900">
                  {transaction.razorpayOrderId || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                <p className="text-xs text-gray-500">
                  Razorpay Payment ID
                </p>
                <p className="mt-1 break-all text-sm font-medium text-gray-900">
                  {transaction.razorpayPaymentId || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Service
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {transaction.service}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
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

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                href="/history"
                className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                My History
              </Link>

              <Link
                href="/service1/dth"
                className="rounded-lg bg-gray-800 px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-900"
              >
                Recharge Again
              </Link>

              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
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
