import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <div className="flex items-center gap-6">

            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/history"
              className="text-gray-600 hover:text-blue-600"
            >
              My History
            </Link>

            <LogoutButton />

          </div>
        </div>
      </header>


      {/* ================= DASHBOARD ================= */}
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Welcome */}
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome {user.name} 👋
        </h2>

        <p className="mt-2 text-gray-600">
          आपका Login सफल हो गया है।
        </p>


        {/* ================= PROFILE ================= */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">

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


        {/* ================= MY HISTORY ================= */}
        <Link
          href="/history"
          className="mt-8 block rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="text-3xl">
                📋
              </div>

              <h3 className="mt-2 text-2xl font-bold">
                My History
              </h3>

              <p className="mt-2 text-blue-100">
                अपनी सभी bookings और transactions एक ही जगह देखें।
              </p>
            </div>

            <div className="text-lg font-semibold">
              View History →
            </div>

          </div>
        </Link>


        {/* ================= SERVICES ================= */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">

          {/* Service 1 */}
          <Link
            href="/service1"
            className="block cursor-pointer rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900">
              Service 1
            </h3>

            <p className="mt-2 text-gray-500">
              यहाँ आपकी पहली service आएगी।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              Service 1 खोलें →
            </p>
          </Link>


          {/* Service 2 */}
          <Link
            href="/service2"
            className="block cursor-pointer rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900">
              Service 2
            </h3>

            <p className="mt-2 text-gray-500">
              यहाँ आपकी दूसरी service आएगी।
            </p>

            <p className="mt-4 font-semibold text-blue-600">
              Service 2 खोलें →
            </p>
          </Link>


          {/* Service 3 */}
          <div className="rounded-xl bg-white p-6 shadow">

            <h3 className="text-xl font-bold text-gray-900">
              Service 3
            </h3>

            <p className="mt-2 text-gray-500">
              यहाँ आपकी तीसरी service आएगी।
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}