"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  userId: number;
  status: string;
};

export default function KycReviewActions({
  userId,
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState<
    "VERIFY" | "REJECT" | null
  >(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [showRejectBox, setShowRejectBox] =
    useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function reviewKyc(
    action: "VERIFY" | "REJECT"
  ) {
    if (loading) {
      return;
    }

    if (
      action === "REJECT" &&
      rejectionReason.trim().length < 5
    ) {
      setSuccess(false);
      setMessage(
        "Reject करने के लिए कम से कम 5 characters का reason लिखें।"
      );
      return;
    }

    if (action === "VERIFY") {
      const confirmed = window.confirm(
        "क्या आपने सभी KYC documents ध्यान से check कर लिए हैं और इस KYC को Verify करना चाहते हैं?"
      );

      if (!confirmed) {
        return;
      }
    }

    if (action === "REJECT") {
      const confirmed = window.confirm(
        "क्या आप इस KYC को Reject करना चाहते हैं?"
      );

      if (!confirmed) {
        return;
      }
    }

    setLoading(action);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(
        "/api/admin/kyc/review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            action,
            rejectionReason:
              action === "REJECT"
                ? rejectionReason.trim()
                : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "KYC review action failed."
        );
      }

      setSuccess(true);
      setMessage(
        data.message ||
          (action === "VERIFY"
            ? "KYC verified successfully."
            : "KYC rejected successfully.")
      );

      setShowRejectBox(false);
      setRejectionReason("");

      router.refresh();
    } catch (error) {
      setSuccess(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "KYC review action failed."
      );
    } finally {
      setLoading(null);
    }
  }

  // केवल PENDING KYC review की जा सकती है
  if (status !== "PENDING") {
    return (
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">
          KYC Review Action
        </h2>

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-600">
            इस KYC का current status{" "}
            <span className="font-black">
              {status.replaceAll("_", " ")}
            </span>{" "}
            है।
          </p>

          <p className="mt-1 text-sm text-slate-500">
            केवल PENDING KYC को Verify या Reject किया जा
            सकता है।
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-slate-900">
          KYC Review Action
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          सभी documents ध्यान से check करने के बाद ही KYC
          Verify या Reject करें।
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold leading-6 text-amber-800">
          ⚠️ Verify करने से पहले PAN Card, Aadhaar Front,
          Aadhaar Back और Profile Photo की जानकारी user से
          match करना सुनिश्चित करें।
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void reviewKyc("VERIFY")}
          className={`rounded-lg px-5 py-3 text-sm font-bold text-white transition ${
            loading !== null
              ? "cursor-not-allowed bg-slate-400"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {loading === "VERIFY"
            ? "Verifying..."
            : "✓ Verify KYC"}
        </button>

        <button
          type="button"
          disabled={loading !== null}
          onClick={() => {
            setMessage("");
            setSuccess(false);
            setShowRejectBox((current) => !current);
          }}
          className={`rounded-lg px-5 py-3 text-sm font-bold text-white transition ${
            loading !== null
              ? "cursor-not-allowed bg-slate-400"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          ✕ Reject KYC
        </button>
      </div>

      {showRejectBox && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">
          <label
            htmlFor="rejectionReason"
            className="block text-sm font-bold text-red-900"
          >
            Rejection Reason
          </label>

          <p className="mt-1 text-xs leading-5 text-red-700">
            User को साफ-साफ बताइए कि KYC में क्या सुधार करना
            है।
          </p>

          <textarea
            id="rejectionReason"
            value={rejectionReason}
            maxLength={500}
            disabled={loading !== null}
            onChange={(event) =>
              setRejectionReason(event.target.value)
            }
            placeholder="उदाहरण: Aadhaar Front image clear नहीं है। कृपया clear document दोबारा upload करें।"
            className="mt-3 min-h-28 w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-red-600">
              Minimum 5 characters
            </p>

            <p className="text-xs text-slate-500">
              {rejectionReason.length}/500
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading !== null}
              onClick={() =>
                void reviewKyc("REJECT")
              }
              className={`rounded-lg px-5 py-2.5 text-sm font-bold text-white transition ${
                loading !== null
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading === "REJECT"
                ? "Rejecting..."
                : "Confirm Reject"}
            </button>

            <button
              type="button"
              disabled={loading !== null}
              onClick={() => {
                setShowRejectBox(false);
                setRejectionReason("");
                setMessage("");
              }}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${
            success
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {success && "✓ "}
          {message}
        </div>
      )}
    </section>
  );
}