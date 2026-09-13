import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UtilityPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-blue-600"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            ⚡ Utility
          </h2>

          <p className="mt-2 text-gray-600">
            Electricity, Postpaid और FASTag utility services।
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* ELECTRICITY */}
          <Link
            href="/service1/electricity"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">⚡</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Electricity Bill Payment
            </h3>

            <p className="mt-2 text-gray-500">
              अपना electricity bill online pay करें।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Pay Electricity Bill →
            </p>
          </Link>

          {/* MOBILE POSTPAID */}
          <Link
            href="/service1/mobile-postpaid"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">📱</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Mobile Postpaid Bill
            </h3>

            <p className="mt-2 text-gray-500">
              Postpaid mobile bill payment करें।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Pay Postpaid Bill →
            </p>
          </Link>

          {/* FASTAG */}
          <Link
            href="/service1/fastag"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">🚘</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              FASTag Recharge
            </h3>

            <p className="mt-2 text-gray-500">
              Vehicle FASTag recharge service।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Recharge FASTag →
            </p>
          </Link>
        </div>

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white hover:bg-gray-900"
          >
            ← Dashboard पर वापस जाएँ
          </Link>
        </div>
      </div>
    </main>
  );
}