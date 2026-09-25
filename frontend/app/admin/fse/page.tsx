"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type FseUser = {
  id: number;
  userCode: string | null;
  name: string;
  mobile: string;
  email: string;
  role: string;
  createdAt: string;

  _count: {
    onboardedUsers: number;
  };
};

export default function FseManagementPage() {
  const [fseList, setFseList] = useState<FseUser[]>([]);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD FSE LIST
  // ==========================================
  const loadFse = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/fse", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "FSE list load नहीं हो सकी।"
        );
      }

      setFseList(data.fse || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "FSE list load नहीं हो सकी।";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFse();
  }, [loadFse]);

  // ==========================================
  // CREATE FSE
  // ==========================================
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !name.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("सभी fields भरना जरूरी है।");
      return;
    }

    if (!/^\d{10}$/.test(mobile.trim())) {
      setError(
        "Mobile number 10 digits का होना चाहिए।"
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password कम से कम 6 characters का होना चाहिए।"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Password और Confirm Password match नहीं कर रहे हैं।"
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/fse", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "FSE create नहीं हो सका।"
        );
      }

      setMessage(
        `${
          data.fse?.name || "FSE"
        } successfully create हो गया। Code: ${
          data.fse?.userCode || "-"
        }`
      );

      // Clear form
      setName("");
      setMobile("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Refresh FSE list
      await loadFse();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "FSE create नहीं हो सका।";

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* ======================================
          HEADER
      ======================================= */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div>
            <Link
              href="/admin"
              className="text-lg font-black text-blue-700 sm:text-xl"
            >
              RY MULTI SERVICE
            </Link>

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-600">
              FSE MANAGEMENT
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* ======================================
            PAGE TITLE
        ======================================= */}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-600">
            FIELD SALES EXECUTIVE
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            🧑‍💻 FSE Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            FSE accounts बनाएँ, working area manage करें
            और उनके द्वारा onboard किए गए members देखें।
          </p>
        </div>

        {/* ======================================
            SUMMARY
        ======================================= */}
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Total FSE
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {fseList.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Total Members Added
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {fseList.reduce(
                (total, fse) =>
                  total +
                  (fse._count?.onboardedUsers ?? 0),
                0
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
              FSE Role
            </p>

            <p className="mt-2 font-black text-emerald-800">
              Onboarding Network
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              Retailer / Distributor / Master Distributor
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ======================================
              ADD NEW FSE
          ======================================= */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                ➕ Add New FSE
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                नया Field Sales Executive account बनाएँ।
              </p>
            </div>

            {message && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-5 space-y-4"
            >
              {/* NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="FSE का नाम"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              {/* MOBILE */}
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  placeholder="10 digit mobile"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="fse@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Password दोबारा डालें"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-purple-700 px-4 py-3 text-sm font-black text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "FSE Create हो रहा है..."
                  : "Create FSE"}
              </button>
            </form>
          </div>

          {/* ======================================
              FSE LIST
          ======================================= */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-black text-slate-900">
                FSE List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                सभी registered FSE accounts
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm font-bold text-slate-400">
                FSE list loading...
              </div>
            ) : fseList.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-4xl">🧑‍💻</div>

                <p className="mt-3 font-black text-slate-700">
                  अभी कोई FSE नहीं है
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  बाईं तरफ form से पहला FSE create करें।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3">
                        FSE
                      </th>

                      <th className="px-5 py-3">
                        Code
                      </th>

                      <th className="px-5 py-3">
                        Mobile
                      </th>

                      <th className="px-5 py-3">
                        Members
                      </th>

                      <th className="px-5 py-3">
                        Joined
                      </th>

                      <th className="px-5 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {fseList.map((fse) => (
                      <tr
                        key={fse.id}
                        className="hover:bg-slate-50"
                      >
                        {/* FSE */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-slate-800">
                            {fse.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {fse.email}
                          </p>
                        </td>

                        {/* CODE */}
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-black text-purple-700">
                            {fse.userCode || "-"}
                          </span>
                        </td>

                        {/* MOBILE */}
                        <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                          {fse.mobile}
                        </td>

                        {/* MEMBERS */}
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                            {fse._count?.onboardedUsers ?? 0}
                          </span>
                        </td>

                        {/* JOINED */}
                        <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                          {new Date(
                            fse.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/fse/${fse.id}/area`}
                              className="whitespace-nowrap rounded-lg bg-purple-50 px-3 py-2 text-xs font-black text-purple-700 transition hover:bg-purple-100"
                            >
                              📍 Manage Area
                            </Link>

                            <Link
                              href={`/admin/fse/${fse.id}/members`}
                              className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                            >
                              👥 Members
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ======================================
            FOOTER
        ======================================= */}
        <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} RY MULTI SERVICE •
          FSE Management
        </footer>
      </section>
    </main>
  );
}