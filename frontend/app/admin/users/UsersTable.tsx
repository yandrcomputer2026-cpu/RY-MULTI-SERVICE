"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type UserItem = {
  id: number;
  userCode: string | null;
  name: string;
  email: string;
  mobile: string;
  role: string;
  registrationSource: string;
  assignmentStatus: string;
  pincode: string | null;
  createdAt: string;

  wallet: {
    availableBalance: number;
    lockedBalance: number;
    status: string;
  } | null;
};

type UsersTableProps = {
  users: UserItem[];
};

function roleLabel(role: string) {
  switch (role) {
    case "RETAILER":
      return "Retailer";

    case "DISTRIBUTOR":
      return "Distributor";

    case "MASTER_DISTRIBUTOR":
      return "Master Distributor";

    case "FSE":
      return "FSE";

    case "ADMIN":
      return "Admin";

    default:
      return role;
  }
}

function roleStyle(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-red-50 text-red-700";

    case "FSE":
      return "bg-purple-50 text-purple-700";

    case "MASTER_DISTRIBUTOR":
      return "bg-amber-50 text-amber-700";

    case "DISTRIBUTOR":
      return "bg-cyan-50 text-cyan-700";

    default:
      return "bg-blue-50 text-blue-700";
  }
}

function formatMoney(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function UsersTable({
  users,
}: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");

  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        role === "ALL" ||
        user.role === role;

      const matchesSearch =
        !query ||
        user.name
          .toLowerCase()
          .includes(query) ||
        user.email
          .toLowerCase()
          .includes(query) ||
        user.mobile
          .toLowerCase()
          .includes(query) ||
        (user.userCode ?? "")
          .toLowerCase()
          .includes(query) ||
        (user.pincode ?? "")
          .toLowerCase()
          .includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, search, role]);

  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER + FILTERS */}

      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-black text-slate-900">
              Registered Users
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search, filter और manage registered
              accounts
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* SEARCH */}

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Search User
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Name, mobile, email, code..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 sm:w-64"
              />
            </div>

            {/* ROLE FILTER */}

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Role
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 sm:w-52"
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

                <option value="FSE">
                  FSE
                </option>

                <option value="ADMIN">
                  Admin
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-500">
            Showing{" "}
            <span className="font-black text-slate-900">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-black text-slate-900">
              {users.length}
            </span>{" "}
            users
          </p>

          {(search || role !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRole("ALL");
              }}
              className="text-xs font-black text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}

      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-3xl">
            🔍
          </div>

          <p className="mt-3 font-black text-slate-800">
            No users found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Search या role filter बदलकर देखें।
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">
                  User
                </th>

                <th className="px-5 py-4">
                  Contact
                </th>

                <th className="px-5 py-4">
                  Role
                </th>

                <th className="px-5 py-4">
                  Assignment
                </th>

                <th className="px-5 py-4">
                  Wallet
                </th>

                <th className="px-5 py-4">
                  Registered
                </th>

                <th className="px-5 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition hover:bg-slate-50"
                >
                  {/* USER */}

                  <td className="px-5 py-4">
                    <p className="font-black text-slate-900">
                      {user.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {user.userCode ||
                        `User #${user.id}`}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Source:{" "}
                      {user.registrationSource}
                    </p>
                  </td>

                  {/* CONTACT */}

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-700">
                      {user.mobile}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {user.email}
                    </p>

                    {user.pincode && (
                      <p className="mt-1 text-xs text-slate-400">
                        PIN: {user.pincode}
                      </p>
                    )}
                  </td>

                  {/* ROLE */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${roleStyle(
                        user.role
                      )}`}
                    >
                      {roleLabel(user.role)}
                    </span>
                  </td>

                  {/* ASSIGNMENT */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${
                        user.assignmentStatus ===
                        "ASSIGNED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {user.assignmentStatus}
                    </span>
                  </td>

                  {/* WALLET */}

                  <td className="px-5 py-4">
                    <p className="font-black text-emerald-600">
                      ₹
                      {formatMoney(
                        user.wallet
                          ?.availableBalance ?? 0
                      )}
                    </p>

                    {(user.wallet?.lockedBalance ??
                      0) > 0 && (
                      <p className="mt-1 text-xs text-amber-600">
                        Locked ₹
                        {formatMoney(
                          user.wallet
                            ?.lockedBalance ?? 0
                        )}
                      </p>
                    )}

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      {user.wallet?.status ||
                        "NO WALLET"}
                    </p>
                  </td>

                  {/* DATE */}

                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </td>

                  {/* ACTION */}

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                    >
                      View / Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}