"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    console.log("LOGIN BUTTON CLICKED");

    if (loading) return;

    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail) {
      setMessage("Email डालना जरूरी है।");
      return;
    }

    if (!cleanPassword) {
      setMessage("Password डालना जरूरी है।");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending login request...");

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      console.log("Login status:", response.status);

      const text = await response.text();

      console.log("LOGIN API RESPONSE:", text);

      let data: {
        message?: string;
        user?: {
          id: string;
          name: string;
          mobile: string;
          email: string;
        };
      };

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON response:", error);

        setMessage(
          "Login API ने सही response नहीं दिया। Browser Console और Terminal check करें।"
        );

        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Email या Password गलत है।");
        return;
      }

      console.log("LOGIN SUCCESS:", data);

      setMessage("Login successfully हो गया।");

      // Dashboard पर जाएँ
      router.push("/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setMessage(
        "Server से connect नहीं हो पाया। Terminal में error check करें।"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <p className="text-gray-600 mt-2">
            Login to your account
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>

          <p className="text-gray-500 mt-2">
            Please enter your details to continue.
          </p>

          {/* Email */}
          <div className="mt-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mobile Number / Email
            </label>

            <input
              id="email"
              name="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address"
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="mt-5">
            <div className="flex justify-between mb-2">

              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <a
                href="/change-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </a>

            </div>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-5 rounded-lg px-4 py-3 text-center ${
                message.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Login Button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="relative z-10 w-full mt-7 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg cursor-pointer disabled:cursor-not-allowed transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register */}
          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{" "}

            <a
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create Account
            </a>
          </p>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-gray-600 hover:text-blue-600"
          >
            ← Back to Home
          </a>
        </div>

      </div>
    </main>
  );
}