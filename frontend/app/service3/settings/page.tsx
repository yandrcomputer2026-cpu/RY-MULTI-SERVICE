"use client";

import Link from "next/link";
import { useState } from "react";

export default function AccountSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("Hindi");

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
      <div className="max-w-4xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          Account Settings ⚙️
        </h2>

        <p className="text-gray-600 mt-2">
          अपने account की settings यहाँ manage करें।
        </p>


        {/* ================= ACCOUNT ================= */}
        <div className="bg-white rounded-2xl shadow p-6 mt-8">

          <h3 className="text-xl font-bold text-gray-900">
            Account Information
          </h3>

          <p className="text-gray-500 mt-2">
            आपकी account information Profile section में manage की जाएगी।
          </p>

          <Link
            href="/service3/profile"
            className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg"
          >
            View Profile
          </Link>

        </div>


        {/* ================= NOTIFICATIONS ================= */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Notifications 🔔
              </h3>

              <p className="text-gray-500 mt-1">
                Payment और account updates की notifications।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-8 rounded-full transition ${
                notifications
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
              aria-label="Toggle notifications"
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition ${
                  notifications
                    ? "left-7"
                    : "left-1"
                }`}
              />
            </button>

          </div>

          <p className="text-sm mt-4 text-gray-600">
            Status:{" "}
            <span className="font-semibold">
              {notifications ? "Enabled" : "Disabled"}
            </span>
          </p>

        </div>


        {/* ================= LANGUAGE ================= */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">

          <h3 className="text-xl font-bold text-gray-900">
            Language 🌐
          </h3>

          <p className="text-gray-500 mt-1">
            Portal की preferred language चुनें।
          </p>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full mt-5 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Hindi">
              Hindi
            </option>

            <option value="English">
              English
            </option>

          </select>

        </div>


        {/* ================= SECURITY ================= */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">

          <h3 className="text-xl font-bold text-gray-900">
            Security 🔐
          </h3>

          <p className="text-gray-500 mt-1">
            अपने account की security settings manage करें।
          </p>

          <Link
            href="/service3/password"
            className="inline-block mt-5 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-5 py-3 rounded-lg"
          >
            Change Password
          </Link>

        </div>


        {/* ================= ACCOUNT STATUS ================= */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">

          <h3 className="text-xl font-bold text-gray-900">
            Account Status
          </h3>

          <div className="flex items-center gap-3 mt-4">

            <span className="w-3 h-3 bg-green-500 rounded-full" />

            <span className="font-semibold text-green-700">
              Active
            </span>

          </div>

          <p className="text-gray-500 mt-2 text-sm">
            आपका account अभी active है।
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
