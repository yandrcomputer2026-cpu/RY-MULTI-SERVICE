"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type FseArea = {
  id: number;
  pincode: string;
  isActive: boolean;
};

type Fse = {
  id: number;
  userCode: string | null;
  name: string;
  mobile: string;
  email: string;
  role: string;
  createdAt: string;
  areas: FseArea[];
};

type Member = {
  id: number;
  userCode: string | null;
  name: string;
  mobile: string;
  email: string;
  role: string;
  pincode: string | null;
  registrationSource: string;
  assignmentStatus: string;
  distributorId: number | null;
  masterDistributorId: number | null;
  createdAt: string;
};

type Summary = {
  total: number;
  retailers: number;
  distributors: number;
  masterDistributors: number;
  assigned: number;
  pending: number;
};

export default function FseMembersPage() {
  const params = useParams();

  const fseId = String(params.id);

  const [fse, setFse] = useState<Fse | null>(null);

  const [members, setMembers] = useState<Member[]>(
    []
  );

  const [summary, setSummary] =
    useState<Summary>({
      total: 0,
      retailers: 0,
      distributors: 0,
      masterDistributors: 0,
      assigned: 0,
      pending: 0,
    });

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/fse/${fseId}/members`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "FSE members load नहीं हो सके।"
        );
      }

      setFse(data.fse || null);
      setMembers(data.members || []);

      setSummary(
        data.summary || {
          total: 0,
          retailers: 0,
          distributors: 0,
          masterDistributors: 0,
          assigned: 0,
          pending: 0,
        }
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "FSE members load नहीं हो सके।";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fseId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  // ==========================================
  // FILTER MEMBERS
  // ==========================================

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesRole =
        roleFilter === "ALL" ||
        member.role === roleFilter;

      const matchesSearch =
        !query ||
        member.name
          .toLowerCase()
          .includes(query) ||
        member.mobile.includes(query) ||
        member.email
          .toLowerCase()
          .includes(query) ||
        (member.userCode || "")
          .toLowerCase()
          .includes(query) ||
        (member.pincode || "").includes(query);

      return matchesRole && matchesSearch;
    });
  }, [members, roleFilter, search]);

  // ==========================================
  // ROLE LABEL
  // ==========================================

  function getRoleLabel(role: string) {
    if (role === "MASTER_DISTRIBUTOR") {
      return "Master Distributor";
    }

    if (role === "DISTRIBUTOR") {
      return "Distributor";
    }

    if (role === "RETAILER") {
      return "Retailer";
    }

    return role;
  }

  // ==========================================
  // ROLE STYLE
  // ==========================================

  function getRoleStyle(role: string) {
    if (role === "MASTER_DISTRIBUTOR") {
      return "bg-purple-50 text-purple-700";
    }

    if (role === "DISTRIBUTOR") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-emerald-50 text-emerald-700";
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* HEADER */}

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
              FSE MEMBERS
            </p>
          </div>

          <Link
            href="/admin/fse"
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
          >
            ← FSE Management
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* TITLE */}

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-600">
            ONBOARDED NETWORK
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            👥 FSE Members
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            इस FSE द्वारा onboard किए गए users
            देखें।
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {/* FSE DETAILS */}

        {fse && (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                FSE
              </p>

              <p className="mt-2 text-lg font-black text-slate-900">
                {fse.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {fse.email}
              </p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-purple-500">
                FSE Code
              </p>

              <p className="mt-2 text-lg font-black text-purple-700">
                {fse.userCode || "-"}
              </p>

              <p className="mt-1 text-xs text-purple-500">
                {fse.mobile}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                Working PIN Codes
              </p>

              <p className="mt-2 text-lg font-black text-emerald-800">
                {fse.areas.length}
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                {fse.areas.length > 0
                  ? fse.areas
                      .map(
                        (area) => area.pincode
                      )
                      .join(", ")
                  : "कोई PIN assigned नहीं है"}
              </p>
            </div>
          </div>
        )}

        {/* SUMMARY */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Members"
            value={summary.total}
          />

          <SummaryCard
            label="Retailers"
            value={summary.retailers}
          />

          <SummaryCard
            label="Distributors"
            value={summary.distributors}
          />

          <SummaryCard
            label="Master Distributors"
            value={summary.masterDistributors}
          />
        </div>

        {/* FILTER */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Name, mobile, email, code या PIN search करें..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
            />

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
            >
              <option value="ALL">
                All Roles
              </option>

              <option value="RETAILER">
                Retailer
              </option>

              <option value="DISTRIBUTOR">
                Distributor
              </option>

              <option value="MASTER_DISTRIBUTOR">
                Master Distributor
              </option>
            </select>
          </div>
        </div>

        {/* MEMBERS TABLE */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Members List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredMembers.length} member(s)
                दिखाई दे रहे हैं
              </p>
            </div>

            <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-black text-purple-700">
              Total {summary.total}
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-bold text-slate-400">
              Members loading...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl">
                👥
              </div>

              <p className="mt-3 font-black text-slate-700">
                कोई member नहीं मिला
              </p>

              <p className="mt-1 text-xs text-slate-400">
                इस FSE द्वारा onboard किया गया
                member यहाँ दिखाई देगा।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">
                      Member
                    </th>

                    <th className="px-5 py-3">
                      Code
                    </th>

                    <th className="px-5 py-3">
                      Mobile
                    </th>

                    <th className="px-5 py-3">
                      Role
                    </th>

                    <th className="px-5 py-3">
                      PIN
                    </th>

                    <th className="px-5 py-3">
                      Assignment
                    </th>

                    <th className="px-5 py-3">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map(
                    (member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-slate-800">
                            {member.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {member.email}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                            {member.userCode ||
                              "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                          {member.mobile}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${getRoleStyle(
                              member.role
                            )}`}
                          >
                            {getRoleLabel(
                              member.role
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-slate-700">
                          {member.pincode ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              member.assignmentStatus ===
                              "ASSIGNED"
                                ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                                : "rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700"
                            }
                          >
                            {
                              member.assignmentStatus
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                          {new Date(
                            member.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* STATUS SUMMARY */}

        <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold">
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">
            Assigned: {summary.assigned}
          </span>

          <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">
            Pending: {summary.pending}
          </span>
        </div>

        <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} RY MULTI
          SERVICE • FSE Members Management
        </footer>
      </section>
    </main>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}