import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ElectricityDescription = {
  bookingType?: string;

  electricity?: {
    consumerNumber?: string;
    operator?: string;
  };

  payment?: {
    amount?: number;
    currency?: string;
  };

  consumerNumber?: string;
  operator?: string;
};

function parseDescription(
  description: string | null
): ElectricityDescription {
  if (!description) return {};

  const value = description.trim();

  if (value.startsWith("{")) {
    try {
      return JSON.parse(value) as ElectricityDescription;
    } catch {
      return {};
    }
  }

  const consumerMatch = value.match(
    /Electricity Consumer Number:\s*([^,]+)/i
  );

  const boardMatch = value.match(
    /Board:\s*([^,]+)/i
  );

  return {
    consumerNumber: consumerMatch?.[1]?.trim(),
    operator: boardMatch?.[1]?.trim(),
  };
}

function formatValue(value?: string) {
  if (!value) return "-";

  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

export default async function ElectricityReceiptPage({
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
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Electricity Transaction Not Found
          </h1>

          <p className="mt-2 text-gray-600">
            यह transaction उपलब्ध नहीं है।
          </p>

          <Link
            href="/history"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            ← My History
          </Link>
        </div>
      </main>
    );
  }

  const isElectricity =
    transaction.service === "ELECTRICITY_BILL" ||
    transaction.service === "ELECTRICITY" ||
    transaction.category === "ELECTRICITY";

  if (!isElectricity) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Invalid Electricity Transaction
          </h1>

          <p className="mt-2 text-gray-600">
            यह transaction Electricity Bill Payment से संबंधित नहीं है।
          </p>

          <Link
            href="/history"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            ← My History
          </Link>
        </div>
      </main>
    );
  }

  const details =
    parseDescription(transaction.description);

  const providerFallback =
    transaction.provider &&
    transaction.provider.toUpperCase() !== "RAZORPAY"
      ? transaction.provider
      : "";

  const consumerNumber =
    details.electricity?.consumerNumber ||
    details.consumerNumber ||
    transaction.referenceId ||
    "-";

  const operator =
    details.electricity?.operator ||
    details.operator ||
    providerFallback ||
    "-";

  const amount = Number(transaction.amount);

  const currency =
    details.payment?.currency || "INR";

  const paymentProvider =
    transaction.razorpayPaymentId
      ? "RAZORPAY"
      : transaction.provider || "-";

  const status = String(
    transaction.status || "PENDING"
  ).toUpperCase();

  const success =
    status === "ELECTRICITY_SUCCESS";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <div className="text-5xl">⚡</div>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              RY MULTI SERVICE
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Electricity Bill Receipt
            </h1>

            <span
              className={`mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold ${
                success
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="mt-8 rounded-xl bg-gray-50 p-5">
            <p className="text-xs text-gray-500">
              Transaction ID
            </p>

            <p className="mt-1 break-all font-semibold text-blue-700">
              {transaction.transactionId}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                Consumer Number
              </p>
              <p className="mt-1 break-all font-semibold text-gray-900">
                {consumerNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Electricity Board
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {formatValue(operator)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Bill Amount
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
                Payment Provider
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {paymentProvider}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Category
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {transaction.category || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Service
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {transaction.service}
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
                {transaction.razorpayOrderId || "-"}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Razorpay Payment ID
              </p>
              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {transaction.razorpayPaymentId || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/history"
              className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              📋 My History
            </Link>

            <Link
              href="/service1/electricity"
              className="rounded-lg bg-gray-800 px-5 py-3 text-center font-semibold text-white hover:bg-gray-900"
            >
              ⚡ Pay Another Bill
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
