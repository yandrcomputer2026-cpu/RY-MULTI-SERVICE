import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import RechargeForm from "./RechargeForm";

export default async function MobilePrepaidPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}

      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <div className="flex items-center gap-6">

            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/service1"
              className="text-gray-600 hover:text-blue-600"
            >
              Online Payments
            </Link>

          </div>
        </div>
      </header>


      {/* ================= MAIN ================= */}

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* ================= PAGE HEADING ================= */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">
            📱 Mobile Prepaid Recharge
          </h2>

          <p className="text-gray-600 mt-2">
            Welcome {user.name} 👋
          </p>

          <p className="text-gray-500 mt-1">
            अपने मोबाइल नंबर पर prepaid recharge करें।
          </p>

        </div>


        {/* ================= RECHARGE FORM ================= */}

        <RechargeForm />


        {/* ================= INFORMATION ================= */}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">

          <h3 className="text-lg font-bold text-blue-900">
            Recharge Instructions
          </h3>

          <ul className="mt-3 space-y-2 text-blue-800">

            <li>
              • अपना सही 10 digit mobile number दर्ज करें।
            </li>

            <li>
              • सही mobile operator select करें।
            </li>

            <li>
              • अपना सही circle select करें।
            </li>

            <li>
              • Recharge amount डालकर details verify करें।
            </li>

            <li>
              • Successful recharge की जानकारी Payment History में दिखाई देगी।
            </li>

          </ul>

        </div>


        {/* ================= BACK ================= */}

        <div className="mt-8">

          <Link
            href="/service1"
            className="inline-block bg-gray-800 text-white
              px-6 py-3 rounded-lg hover:bg-gray-900"
          >
            ← Online Payments पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}
