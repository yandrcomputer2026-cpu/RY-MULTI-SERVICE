import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PostpaidDescription = {
  bookingType?: string;

  bill?: {
    mobile?: string;
    operator?: string;
  };

  payment?: {
    amount?: number;
    currency?: string;
  };

  // Legacy / flat support
  mobile?: string;
  operator?: string;
};

function parseDescription(
  description: string | null
): PostpaidDescription {
  if (!description) {
    return {};
  }

  const value = description.trim();

  if (value.startsWith("{")) {
    try {
      return JSON.parse(value) as PostpaidDescription;
    } catch {
      return {};
    }
  }

  // Old format support:
  // "Mobile: 9876543210, Operator: airtel"
  const mobileMatch =
    value.match(/Mobile:\s*([^,]+)/i);

  const operatorMatch =
    value.match(/Operator:\s*([^,]+)/i);

  return {
    mobile: mobileMatch?.[1]?.trim(),
    operator: operatorMatch?.[1]?.trim(),
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

function isPostpaidTransaction(
  service: string,
  category: string | null
) {
  return (
    service === "MOBILE_POSTPAID" ||
    service === "POSTPAID_BILL" ||
    category === "POSTPAID_BILL"
  );
}

export default async function PostpaidReceiptPage({
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
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">
            ❌
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Transaction Not Found
          </h1>

          <p className="mt-2 text-gray-600">
            यह postpaid transaction उपलब्ध नहीं है।
          </p>

          <Link
            href="/history"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            ← My History
          </Link>
        </div>
      </main>
    );
  }

  if (
    !isPostpaidTransaction(
      transaction.service,
      transaction.category
    )
  ) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Invalid Postpaid Transaction
          </h1>

          <p className="mt-2 text-gray-600">
            यह transaction Mobile Postpaid Bill Payment से संबंधित नहीं है।
          </p>

          <Link
            href="/history"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            ← My History
          </Link>
        </div>
      </main>
    );
  }

  const details =
    parseDescription(
      transaction.description
    );

  const providerFallback =
    transaction.provider &&
    transaction.provider.toUpperCase() !==
      "RAZORPAY"
      ? transaction.provider
      : "";

  const mobile =
    details.bill?.mobile ||
    details.mobile ||
    transaction.referenceId ||
    "-";

  const operator =
    details.bill?.operator ||
    details.operator ||
    providerFallback ||
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

  const paymentProvider =
    transaction.razorpayPaymentId
      ? "RAZORPAY"
      : transaction.provider ||
        "-";

  const successful =
    status === "POSTPAID_SUCCESS";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              RY MULTI SERVICE
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              📱 Mobile Postpaid Receipt
            </h1>
          </div>

          <Link
            href="/history"
            className="rounded-lg bg-gray-800 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-gray-900"
          >
            ← My History
          </Link>
        </div>

        {/* RECEIPT */}

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          {/* STATUS */}

          <div
            className={`rounded-xl border p-5 ${
              successful
                ? "border-green-200 bg-green-50"
                : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p
                  className={`text-lg font-bold ${
                    successful
                      ? "text-green-700"
                      : "text-yellow-800"
                  }`}
                >
                  {successful
                    ? "✅ Postpaid Bill Paid Successfully"
                    : "⏳ Postpaid Bill Status"}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    successful
                      ? "text-green-600"
                      : "text-yellow-700"
                  }`}
                >
                  Transaction ID:{" "}
                  {transaction.transactionId}
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  successful
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* BILL DETAILS */}

          <h2 className="mt-8 text-lg font-bold text-gray-900">
            Bill Details
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">

            <div>
              <p className="text-xs text-gray-500">
                Mobile Number
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {mobile}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Operator
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
          </div>

          {/* PAYMENT DETAILS */}

          <h2 className="mt-8 text-lg font-bold text-gray-900">
            Payment Details
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">

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
                {transaction.category ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Razorpay Order ID
              </p>

              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {transaction.razorpayOrderId ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Razorpay Payment ID
              </p>

              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {transaction.razorpayPaymentId ||
                  "-"}
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

          {/* ACTIONS */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

            <Link
              href="/history"
              className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              📋 My History
            </Link>

            <Link
              href="/service1/mobile-postpaid"
              className="rounded-lg bg-gray-800 px-5 py-3 text-center font-semibold text-white hover:bg-gray-900"
            >
              📱 Pay Another Bill
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
