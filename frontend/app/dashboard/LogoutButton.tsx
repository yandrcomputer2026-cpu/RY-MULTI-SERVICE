"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("LOGOUT FAILED:", data);
        alert(data.message || "Logout failed.");
        return;
      }

      // Session cookie delete हो चुकी है
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      alert("Logout नहीं हो पाया। कृपया दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-red-600 hover:text-red-700 disabled:text-gray-400 font-medium"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}