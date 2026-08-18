import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function DocumentsPage() {
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

        {/* Heading */}
        <h2 className="text-3xl font-bold text-gray-900">
          My Documents 📄
        </h2>

        <p className="text-gray-600 mt-2">
          {user.name}, अपने documents यहाँ manage करें।
        </p>


        {/* ================= DOCUMENT TYPES ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

          {/* Aadhaar */}
          <div className="bg-white rounded-xl shadow p-6">

            <div className="text-4xl">
              🪪
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-4">
              Aadhaar Card
            </h3>

            <p className="text-gray-500 mt-2">
              Aadhaar document upload और view करें।
            </p>

            <button
              type="button"
              className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              Upload Document
            </button>

          </div>


          {/* PAN */}
          <div className="bg-white rounded-xl shadow p-6">

            <div className="text-4xl">
              💳
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-4">
              PAN Card
            </h3>

            <p className="text-gray-500 mt-2">
              PAN Card document upload और view करें।
            </p>

            <button
              type="button"
              className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              Upload Document
            </button>

          </div>


          {/* Other Document */}
          <div className="bg-white rounded-xl shadow p-6">

            <div className="text-4xl">
              📄
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-4">
              Other Documents
            </h3>

            <p className="text-gray-500 mt-2">
              अन्य जरूरी documents manage करें।
            </p>

            <button
              type="button"
              className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              Upload Document
            </button>

          </div>

        </div>


        {/* ================= DOCUMENT STATUS ================= */}
        <div className="bg-white rounded-2xl shadow mt-8 p-6">

          <h3 className="text-2xl font-bold text-gray-900">
            Uploaded Documents
          </h3>

          <div className="mt-5 border rounded-lg">

            <div className="text-center py-10">

              <div className="text-5xl">
                📂
              </div>

              <p className="text-gray-500 mt-4">
                अभी कोई document upload नहीं किया गया है।
              </p>

            </div>

          </div>

        </div>


        {/* ================= SECURITY NOTE ================= */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-8">

          <h3 className="font-bold text-blue-900">
            🔒 Document Security
          </h3>

          <p className="text-blue-800 mt-2 text-sm">
            आपके documents को सुरक्षित रखने के लिए access केवल आपके
            logged-in account तक सीमित रखा जाएगा।
          </p>

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
