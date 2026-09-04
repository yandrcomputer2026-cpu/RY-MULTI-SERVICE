import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <p className="mt-1 text-xs font-semibold text-gray-500">
              ADMIN
            </p>
          </div>

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
            🛡️ Admin Panel
          </h2>

          <p className="mt-2 text-gray-600">
            Retailer, Distributor और Master Distributor management।
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800">
            Admin Access Protected
          </p>

          <p className="mt-1 text-sm text-green-700">
            यह page केवल ADMIN role वाले account के लिए उपलब्ध है।
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">🧑‍💼</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Retailer
            </h3>

            <p className="mt-2 text-gray-500">
              Retailer accounts, KYC, wallet और transaction access manage करें।
            </p>

            <p className="mt-5 font-semibold text-gray-400">
              Management Coming Soon
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">👥</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Distributor
            </h3>

            <p className="mt-2 text-gray-500">
              Distributor network और linked retailers manage करें।
            </p>

            <p className="mt-5 font-semibold text-gray-400">
              Management Coming Soon
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-4xl">🏢</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Master Distributor
            </h3>

            <p className="mt-2 text-gray-500">
              Distributor hierarchy और high-level account management।
            </p>

            <p className="mt-5 font-semibold text-gray-400">
              Management Coming Soon
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="font-semibold text-blue-800">
            आगे क्या जोड़ा जाएगा?
          </p>

          <p className="mt-2 text-sm text-blue-700">
            Retailer/Distributor hierarchy, KYC approval, wallet controls,
            settlement review, transaction monitoring और permission management।
          </p>
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