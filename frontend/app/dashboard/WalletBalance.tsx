"use client";

import { useState } from "react";
import Link from "next/link";

type WalletBalanceProps = {
  balance: number;
};

export default function WalletBalance({
  balance,
}: WalletBalanceProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formattedBalance = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  return (
    <div className="flex items-center gap-2">
      {/* WALLET BALANCE */}
      <Link
        href="/wallet"
        className="flex min-w-[130px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-blue-200 hover:shadow"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-lg">
          👛
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            WALLET BAL.
          </p>

          <p className="mt-0.5 whitespace-nowrap text-sm font-black text-emerald-600">
            {showBalance ? `₹ ${formattedBalance}` : "₹ ••••••"}
          </p>
        </div>
      </Link>

      {/* SHOW / HIDE BUTTON */}
      <button
        type="button"
        onClick={() => setShowBalance((current) => !current)}
        title={showBalance ? "Hide Balance" : "Show Balance"}
        aria-label={showBalance ? "Hide wallet balance" : "Show wallet balance"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg transition hover:bg-blue-50"
      >
        {showBalance ? "👁️" : "🙈"}
      </button>
    </div>
  );
}