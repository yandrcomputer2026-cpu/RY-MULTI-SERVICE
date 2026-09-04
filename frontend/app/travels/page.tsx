import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TravelsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

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
            ✈️ Travels
          </h2>

          <p className="mt-2 text-gray-600">
            Train, Bus, Flight और Hotel booking services।
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/service2/train"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">🚆</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Rail Ticket Booking
            </h3>

            <p className="mt-2 text-gray-500">
              Train search और ticket booking करें।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Book Train →
            </p>
          </Link>

          <Link
            href="/service2/bus"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">🚌</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Bus Ticket Booking
            </h3>

            <p className="mt-2 text-gray-500">
              Bus search और ticket booking करें।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Book Bus →
            </p>
          </Link>

          <Link
            href="/service2/flight"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">✈️</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Flight Ticket Booking
            </h3>

            <p className="mt-2 text-gray-500">
              Domestic और international flight booking।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Book Flight →
            </p>
          </Link>

          <Link
            href="/service2/hotel"
            className="block rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">🏨</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Hotel Booking
            </h3>

            <p className="mt-2 text-gray-500">
              Hotel search और room booking करें।
            </p>

            <p className="mt-5 font-semibold text-blue-600">
              Book Hotel →
            </p>
          </Link>
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