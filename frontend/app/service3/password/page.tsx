"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function PasswordChangePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    if (newPassword.length < 6) {
      setMessage("New Password कम से कम 6 characters का होना चाहिए।");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New Password और Confirm Password match नहीं कर रहे हैं।");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Password change नहीं हो पाया।");
        return;
      }

      setMessage("Password successfully change हो गया।");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("CHANGE_PASSWORD_ERROR:", error);
      setMessage("Server से connect नहीं हो पाया।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
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


      {/* Content */}
      <div className="max-w-xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          Change Password 🔐
        </h2>

        <p className="text-gray-600 mt-2">
          अपने account का password सुरक्षित रूप से बदलें।
        </p>


        <div className="bg-white rounded-2xl shadow p-8 mt-8">

          <form onSubmit={handleSubmit}>

            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current Password
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password डालें"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>


            {/* New Password */}
            <div className="mt-5">

              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password डालें"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            {/* Confirm Password */}
            <div className="mt-5">

              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="New password फिर से डालें"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            {/* Message */}
            {message && (
              <div className="mt-5 bg-gray-100 rounded-lg px-4 py-3 text-center text-gray-700">
                {message}
              </div>
            )}


            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-7 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>

          </form>

        </div>


        {/* Back */}
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
