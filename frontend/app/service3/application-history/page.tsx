import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function ApplicationHistoryPage() {
  const user = await getCurrentUser();

  // Login नहीं है तो Login page पर भेजें
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
              href="/service3"
              className="text-gray-600 hover:text-blue-600"
            >
              Account
            </Link>

            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

          </div>
        </div>
      </header>


      {/* ================= CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          Application History 📋
        </h2>

        <p className="text-gray-600 mt-2">
          {user.name}, आपकी applications की history यहाँ दिखाई जाएगी।
        </p>


        {/* ================= EMPTY STATE ================= */}
        <div className="bg-white rounded-2xl shadow mt-8 p-10 text-center">

          <div className="text-6xl">
            📋
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mt-5">
            No Applications Found
          </h3>

          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            अभी आपके account में कोई application उपलब्ध नहीं है।
            जब आप कोई application submit करेंगे, उसकी जानकारी यहाँ दिखाई देगी।
          </p>

          <Link
            href="/dashboard"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Dashboard पर जाएँ
          </Link>

        </div>


        {/* ================= FUTURE HISTORY TABLE ================= */}
        <div className="bg-white rounded-2xl shadow mt-8 p-6">

          <h3 className="text-xl font-bold text-gray-900">
            Application Records
          </h3>

          <div className="overflow-x-auto mt-5">

            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="border-b text-left">

                  <th className="py-3 px-4 text-gray-600">
                    Application ID
                  </th>

                  <th className="py-3 px-4 text-gray-600">
                    Service
                  </th>

                  <th className="py-3 px-4 text-gray-600">
                    Date
                  </th>

                  <th className="py-3 px-4 text-gray-600">
                    Amount
                  </th>

                  <th className="py-3 px-4 text-gray-600">
                    Status
                  </th>

                  <th className="py-3 px-4 text-gray-600">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    अभी कोई application record नहीं है।
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>


        {/* ================= BACK ================= */}
        <div className="mt-8">

          <Link
            href="/service3"
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Account पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}