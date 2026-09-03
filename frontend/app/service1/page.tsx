import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function Service1Page() {
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
            Online Payments 💳
          </h2>

          <p className="text-gray-600 mt-2">
            Welcome {user.name} 👋
          </p>

          <p className="text-gray-500 mt-1">
            Recharge, bill payment और payment history की सुविधा।
          </p>
        </div>


        {/* ================= SERVICES ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">


          {/* 1. PREPAID RECHARGE */}
          <Link href="/service1/mobile-prepaid">

            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                📱
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Mobile Prepaid Recharge
              </h3>

              <p className="text-gray-500 mt-2">
                Mobile prepaid number पर recharge करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Recharge करें →
              </p>

            </div>

          </Link>


          {/* 2. POSTPAID RECHARGE */}
          <Link href="/service1/mobile-postpaid">

            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                📱
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Mobile Postpaid Recharge
              </h3>

              <p className="text-gray-500 mt-2">
                Mobile postpaid bill का payment करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Payment करें →
              </p>

            </div>

          </Link>


          {/* 3. DTH RECHARGE */}
          <Link href="/service1/dth">

            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                📺
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                DTH Recharge
              </h3>

              <p className="text-gray-500 mt-2">
                DTH connection को आसानी से recharge करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Recharge करें →
              </p>

            </div>

          </Link>


          {/* 4. ELECTRICITY */}
          <Link href="/service1/electricity">

            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                💡
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Electricity Bill Payment
              </h3>

              <p className="text-gray-500 mt-2">
                अपना electricity bill online pay करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Bill Pay करें →
              </p>

            </div>

          </Link>


          {/* 5. PAYMENT HISTORY */}
          <Link href="/history">

            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                📊
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-4">
                Payment History
              </h3>

              <p className="text-gray-500 mt-2">
                अपने सभी payment और recharge की history देखें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                History देखें →
              </p>

            </div>

          </Link>

        </div>


        {/* ================= BACK BUTTON ================= */}
        <div className="mt-10">

          <Link
            href="/dashboard"
            className="inline-block bg-gray-800 text-white px-6 py-3
              rounded-lg hover:bg-gray-900"
          >
            ← Dashboard पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}