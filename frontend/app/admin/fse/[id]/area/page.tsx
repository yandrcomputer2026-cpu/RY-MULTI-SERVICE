"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type FseArea = {
  id: number;
  pincode: string;
  isActive: boolean;
  createdAt: string;
};

type FseDetails = {
  id: number;
  userCode: string | null;
  name: string;
  mobile: string;
  email: string;
};

export default function FseAreaPage() {
  const params = useParams();

  const fseId = String(params.id);

  const [fse, setFse] = useState<FseDetails | null>(null);
  const [areas, setAreas] = useState<FseArea[]>([]);

  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD FSE + AREA
  // =====================================================

  const loadAreas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/fse/${fseId}/area`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "FSE area load नहीं हो सका।"
        );
      }

      setFse(data.fse || null);
      setAreas(data.areas || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "FSE area load नहीं हो सका।"
      );
    } finally {
      setLoading(false);
    }
  }, [fseId]);

  useEffect(() => {
    void loadAreas();
  }, [loadAreas]);

  // =====================================================
  // ASSIGN PINCODE
  // =====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanPincode = pincode.trim();

    if (!/^\d{6}$/.test(cleanPincode)) {
      setError("PIN code 6 digits का होना चाहिए।");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/admin/fse/${fseId}/area`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            pincode: cleanPincode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "PIN code assign नहीं हो सका।"
        );
      }

      setMessage(
        data.message || "PIN code successfully assign हो गया।"
      );

      setPincode("");

      await loadAreas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "PIN code assign नहीं हो सका।"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // REMOVE PINCODE
  // =====================================================

  async function removeArea(area: FseArea) {
    const confirmed = window.confirm(
      `${area.pincode} PIN code remove करना चाहते हैं?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      setRemovingId(area.id);

      const response = await fetch(
        `/api/admin/fse/${fseId}/area`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            areaId: area.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "PIN code remove नहीं हो सका।"
        );
      }

      setMessage(
        data.message || "PIN code remove कर दिया गया।"
      );

      await loadAreas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "PIN code remove नहीं हो सका।"
      );
    } finally {
      setRemovingId(null);
    }
  }

  const activeAreas = areas.filter(
    (area) => area.isActive
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div>
            <Link
              href="/admin"
              className="text-lg font-black text-blue-700 sm:text-xl"
            >
              RY MULTI SERVICE
            </Link>

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-600">
              FSE AREA MANAGEMENT
            </p>
          </div>

          <Link
            href="/admin/fse"
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
          >
            ← FSE Management
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        {/* TITLE */}

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-600">
            WORKING AREA
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            📍 FSE Area Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            FSE को working PIN codes assign और manage करें।
          </p>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-400 shadow-sm">
            FSE details loading...
          </div>
        ) : fse ? (
          <>
            {/* FSE DETAILS */}

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400">
                  FSE
                </p>

                <p className="mt-2 text-xl font-black text-slate-900">
                  {fse.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {fse.email}
                </p>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
                <p className="text-xs font-black uppercase text-purple-500">
                  FSE Code
                </p>

                <p className="mt-2 text-xl font-black text-purple-800">
                  {fse.userCode || "-"}
                </p>

                <p className="mt-1 text-xs text-purple-600">
                  {fse.mobile}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-black uppercase text-emerald-600">
                  Active PIN Codes
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-800">
                  {activeAreas.length}
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  Working areas assigned
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[360px_1fr]">
              {/* ASSIGN PIN */}

              <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">
                  📌 Assign PIN Code
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  इस FSE का नया working area जोड़ें।
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-5"
                >
                  <label className="mb-2 block text-xs font-black text-slate-700">
                    PIN Code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={pincode}
                    onChange={(event) =>
                      setPincode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="6 digit PIN code"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 w-full rounded-xl bg-purple-700 px-4 py-3 text-sm font-black text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Assign हो रहा है..."
                      : "Assign PIN Code"}
                  </button>
                </form>
              </div>

              {/* AREA LIST */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                  <h2 className="text-lg font-black text-slate-900">
                    Assigned PIN Codes
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    FSE के सभी working areas
                  </p>
                </div>

                {activeAreas.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="text-4xl">📍</div>

                    <p className="mt-3 font-black text-slate-700">
                      कोई PIN code assigned नहीं है
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      बाईं तरफ से पहला PIN code assign करें।
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <th className="px-5 py-3">
                            PIN Code
                          </th>

                          <th className="px-5 py-3">
                            Status
                          </th>

                          <th className="px-5 py-3">
                            Assigned
                          </th>

                          <th className="px-5 py-3">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {activeAreas.map((area) => (
                          <tr
                            key={area.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <span className="font-black text-slate-800">
                                📍 {area.pincode}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                                ACTIVE
                              </span>
                            </td>

                            <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                              {new Date(
                                area.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  void removeArea(area)
                                }
                                disabled={
                                  removingId === area.id
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                {removingId === area.id
                                  ? "Removing..."
                                  : "Remove"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}

        <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} RY MULTI SERVICE •
          FSE Area Management
        </footer>
      </section>
    </main>
  );
}