import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
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


      {/* ================= PROFILE ================= */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          My Profile 👤
        </h2>

        <p className="text-gray-600 mt-2">
          आपकी account information
        </p>


        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow p-8 mt-8">

          {/* Avatar */}
          <div className="flex items-center gap-5 pb-6 border-b">

            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl">
              👤
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {user.name}
              </h3>

              <p className="text-gray-500 mt-1">
                Registered User
              </p>
            </div>

          </div>


          {/* User Details */}
          <div className="mt-8 space-y-6">

            {/* User ID */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                User ID
              </p>

              <p className="text-lg font-semibold text-gray-900 mt-1">
                {user.id}
              </p>
            </div>


            {/* Name */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                Full Name
              </p>

              <p className="text-lg font-semibold text-gray-900 mt-1">
                {user.name}
              </p>
            </div>


            {/* Email */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                Email Address
              </p>

              <p className="text-lg font-semibold text-gray-900 mt-1">
                {user.email}
              </p>
            </div>


            {/* Mobile */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                Mobile Number
              </p>

              <p className="text-lg font-semibold text-gray-900 mt-1">
                {user.mobile}
              </p>
            </div>

          </div>

        </div>


        {/* Back */}
        <div className="mt-8">

          <Link
            href="/service3"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900"
          >
            ← Account पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}
