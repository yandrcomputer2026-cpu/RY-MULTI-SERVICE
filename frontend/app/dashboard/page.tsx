import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  // Current logged-in user
  const user = await getCurrentUser();

  // Login नहीं है तो login page पर भेजें
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          {/* Navigation */}
          <div className="flex items-center gap-6">

            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600"
            >
              Home
            </Link>

            <LogoutButton />

          </div>
        </div>
      </header>

      {/* ================= DASHBOARD ================= */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome */}
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome {user.name} 👋
        </h2>

        <p className="text-gray-600 mt-2">
          आपका Login सफल हो गया है।
        </p>


        {/* ================= PROFILE ================= */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h3 className="text-2xl font-bold text-gray-900">
            आपकी Profile
          </h3>

          <div className="mt-5 space-y-4 text-gray-700">

            <p>
              <span className="font-bold">
                Name:
              </span>{" "}
              {user.name}
            </p>

            <p>
              <span className="font-bold">
                Email:
              </span>{" "}
              {user.email}
            </p>

            <p>
              <span className="font-bold">
                Mobile:
              </span>{" "}
              {user.mobile}
            </p>

          </div>

        </div>


        {/* ================= SERVICES ================= */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">

       {/* Service 1 */}
<Link
  href="/service1"
  className="block bg-white rounded-xl shadow p-6 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
>
  <h3 className="text-xl font-bold text-gray-900">
    Service 1
  </h3>

  <p className="text-gray-500 mt-2">
    यहाँ आपकी पहली service आएगी।
  </p>

  <p className="text-blue-600 font-semibold mt-4">
    Service 1 खोलें →
  </p>
</Link>


          {/* Service 2 */}
          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="text-xl font-bold">
              Service 2
            </h3>

            <p className="text-gray-500 mt-2">
              यहाँ आपकी दूसरी service आएगी।
            </p>
<Link
    href="/service2"
    className="inline-block mt-5
      bg-blue-600 text-white
      px-5 py-2.5 rounded-lg
      font-semibold
      hover:bg-blue-700 transition"
  >
    Service 2 खोलें →
  </Link>

          </div>


          {/* Service 3 */}
          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="text-xl font-bold">
              Service 3
            </h3>

            <p className="text-gray-500 mt-2">
              यहाँ आपकी तीसरी service आएगी।
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}