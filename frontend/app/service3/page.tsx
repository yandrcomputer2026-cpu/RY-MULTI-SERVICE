import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function Service3Page() {
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
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600"
            >
              Home
            </Link>

          </div>
        </div>
      </header>


      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Account & Reports 👤
          </h2>

          <p className="text-gray-600 mt-2">
            Welcome {user.name} 👋
          </p>

          <p className="text-gray-500 mt-1">
            आपकी profile, account settings और सभी reports की सुविधा।
          </p>
        </div>


        {/* ================= ACCOUNT SERVICES ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

          {/* PROFILE */}
          <Link href="/service3/profile">
            <div className="bg-white rounded-xl shadow p-6 h-full hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                👤
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Profile
              </h3>

              <p className="text-gray-500 mt-2">
                अपनी personal और account information देखें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Profile देखें →
              </p>

            </div>
          </Link>


          {/* PASSWORD */}
          <Link href="/service3/password">
            <div className="bg-white rounded-xl shadow p-6 h-full hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                🔐
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Password Change
              </h3>

              <p className="text-gray-500 mt-2">
                अपने account का password बदलें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Password बदलें →
              </p>

            </div>
          </Link>


          {/* APPLICATION HISTORY */}
          <Link href="/service3/application-history">
            <div className="bg-white rounded-xl shadow p-6 h-full hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                📋
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Application History
              </h3>

              <p className="text-gray-500 mt-2">
                अपनी applications की पूरी history देखें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                History देखें →
              </p>

            </div>
          </Link>


          {/* DOCUMENTS */}
          <Link href="/service3/documents">
            <div className="bg-white rounded-xl shadow p-6 h-full hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                📄
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Documents
              </h3>

              <p className="text-gray-500 mt-2">
                अपने जरूरी documents देखें और manage करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Documents देखें →
              </p>

            </div>
          </Link>


          {/* HELP SUPPORT */}
          <Link href="/service3/support">
            <div className="bg-white rounded-xl shadow p-6 h-full hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                🆘
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Help / Support
              </h3>

              <p className="text-gray-500 mt-2">
                किसी समस्या के लिए support से संपर्क करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Help लें →
              </p>

            </div>
          </Link>


          {/* ACCOUNT SETTINGS */}
          <Link href="/service3/settings">
            <div className="bg-white rounded-xl shadow p-6 h-full hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                ⚙️
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Account Settings
              </h3>

              <p className="text-gray-500 mt-2">
                अपने account की settings manage करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Settings खोलें →
              </p>

            </div>
          </Link>


          {/* ALL TRANSACTION REPORTS */}
          <Link href="/service3/reports">
            <div className="bg-white rounded-xl shadow p-6 h-full hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                📊
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                All Transaction Reports
              </h3>

              <p className="text-gray-500 mt-2">
                सभी recharge, bill payment और AEPS transactions की reports देखें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Reports देखें →
              </p>

            </div>
          </Link>

        </div>


        {/* ================= USER SUMMARY ================= */}
        <div className="bg-white rounded-xl shadow p-6 mt-10">

          <h3 className="text-2xl font-bold text-gray-900">
            Account Summary
          </h3>

          <div className="grid md:grid-cols-3 gap-6 mt-5">

            <div>
              <p className="text-gray-500">
                Name
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Email
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Mobile
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {user.mobile}
              </p>
            </div>

          </div>

        </div>


        {/* ================= BACK BUTTON ================= */}
        <div className="mt-10">

          <Link
            href="/dashboard"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900"
          >
            ← Dashboard पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}
