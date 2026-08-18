"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    // Password check
    if (form.password !== form.confirmPassword) {
      setMessage("Password और Confirm Password समान नहीं हैं।");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage("Account successfully create हो गया।");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      setMessage("Server से connect नहीं हो पाया।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <p className="text-gray-600 mt-2">
            Create your account
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Create Account
          </h2>

          <p className="text-gray-500 mt-2">
            Enter your details to register.
          </p>

          {/* IMPORTANT: FORM START */}
          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="mt-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Mobile */}
            <div className="mt-5">
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mobile Number
              </label>

              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter 10 digit mobile number"
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div className="mt-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div className="mt-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
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
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Message */}
            {message && (
              <div className="mt-5 p-3 rounded-lg bg-gray-100 text-center text-sm">
                {message}
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-7 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>
          {/* IMPORTANT: FORM END */}

          {/* Login */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}

            <a
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </a>
          </p>

        </div>

        {/* Back Home */}
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