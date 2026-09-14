"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentPassword) {
      alert("Current Password भरें।");
      return;
    }

    if (newPassword.length < 6) {
      alert("New Password कम से कम 6 characters का होना चाहिए।");
      return;
    }

    if (currentPassword === newPassword) {
      alert("New Password, Current Password से अलग होना चाहिए।");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New Password और Confirm Password match नहीं कर रहे।");
      return;
    }

    try {
      setLoading(true);

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
        alert(data.message || "Password change नहीं हो पाया।");
        return;
      }

      alert("Password successfully change हो गया।");

      router.push("/account");
      router.refresh();
    } catch (error) {
      console.error("CHANGE PASSWORD ERROR:", error);
      alert("Server error आया।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>

            <p className="text-xs text-gray-500">
              Account Security
            </p>
          </div>

          <Link
            href="/account"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            ← Account
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
              🔐
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Change Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Account security के लिए अपना current password verify करके नया
              password set करें।
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm leading-6 text-blue-700">
              Password बदलने के लिए account में login होना आवश्यक है।
              आपका email यहाँ दोबारा enter करने की जरूरत नहीं है।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loading ? "Password बदल रहा है..." : "🔐 Change Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/account"
              className="text-sm font-semibold text-gray-600 hover:text-blue-600"
            >
              ← Back to Account Details
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}