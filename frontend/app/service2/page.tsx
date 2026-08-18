import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function Service2Page() {
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
            Travel & AEPS ✈️
          </h2>

          <p className="text-gray-600 mt-2">
            Welcome {user.name} 👋
          </p>

          <p className="text-gray-500 mt-1">
            Travel booking और AEPS transaction की सुविधा।
          </p>
        </div>


        {/* ================= TRAVEL SERVICES ================= */}
        <h3 className="text-2xl font-bold text-gray-900 mt-8">
          Travel Services
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">

          {/* BUS */}
          <Link href="/service2/bus">
            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                🚌
              </div>

              <h4 className="text-xl font-bold text-gray-900 mt-4">
                Bus Booking
              </h4>

              <p className="text-gray-500 mt-2">
                Bus ticket search और booking करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Book Bus →
              </p>

            </div>
          </Link>


          {/* TRAIN */}
          <Link href="/service2/train">
            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                🚆
              </div>

              <h4 className="text-xl font-bold text-gray-900 mt-4">
                Train Booking
              </h4>

              <p className="text-gray-500 mt-2">
                Train ticket search और booking करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Book Train →
              </p>

            </div>
          </Link>


          {/* FLIGHT */}
          <Link href="/service2/flight">
            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                ✈️
              </div>

              <h4 className="text-xl font-bold text-gray-900 mt-4">
                Flight Booking
              </h4>

              <p className="text-gray-500 mt-2">
                Domestic और international flight booking।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Book Flight →
              </p>

            </div>
          </Link>


          {/* HOTEL */}
          <Link href="/service2/hotel">
            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                🏨
              </div>

              <h4 className="text-xl font-bold text-gray-900 mt-4">
                Hotel Booking
              </h4>

              <p className="text-gray-500 mt-2">
                Hotel search और room booking करें।
              </p>

              <p className="text-blue-600 font-semibold mt-5">
                Book Hotel →
              </p>

            </div>
          </Link>

        </div>


        {/* ================= AEPS ================= */}
        <h3 className="text-2xl font-bold text-gray-900 mt-10">
          AEPS Transaction 🏦
        </h3>

        <p className="text-gray-500 mt-2">
          Aadhaar Enabled Payment System की सुविधाएँ।
        </p>


        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">

          {/* WITHDRAW */}
          <Link href="/service2/aeps/withdraw">
            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                💵
              </div>

              <h4 className="text-xl font-bold text-gray-900 mt-4">
                Cash Withdrawal
              </h4>

              <p className="text-gray-500 mt-2">
                AEPS से cash withdrawal करें।
              </p>

              <p className="text-green-600 font-semibold mt-5">
                Withdraw →
              </p>

            </div>
          </Link>


          {/* MINI STATEMENT */}
          <Link href="/service2/aeps/mini-statement">
            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                📄
              </div>

              <h4 className="text-xl font-bold text-gray-900 mt-4">
                Mini Statement
              </h4>

              <p className="text-gray-500 mt-2">
                Last transactions की जानकारी देखें।
              </p>

              <p className="text-green-600 font-semibold mt-5">
                View Statement →
              </p>

            </div>
          </Link>


          {/* DEPOSIT */}
          <Link href="/service2/aeps/deposit">
            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                💰
              </div>

              <h4 className="text-xl font-bold text-gray-900 mt-4">
                Cash Deposit
              </h4>

              <p className="text-gray-500 mt-2">
                AEPS deposit service।
              </p>

              <p className="text-green-600 font-semibold mt-5">
                Deposit →
              </p>

            </div>
          </Link>


          {/* BALANCE */}
          <Link href="/service2/aeps/balance">
            <div className="bg-white rounded-xl shadow p-6 h-full
              hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="text-4xl">
                💳
              </div>

              <h4 className="text-xl font-bold text-gray-900 mt-4">
                Balance Enquiry
              </h4>

              <p className="text-gray-500 mt-2">
                Bank account balance check करें।
              </p>

              <p className="text-green-600 font-semibold mt-5">
                Check Balance →
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