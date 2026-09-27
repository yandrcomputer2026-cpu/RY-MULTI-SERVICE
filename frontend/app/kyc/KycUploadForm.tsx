"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

type DocumentType =
  | "PAN"
  | "AADHAAR_FRONT"
  | "AADHAAR_BACK"
  | "PROFILE_PHOTO";

type UploadState = {
  loading: boolean;
  message: string;
  success: boolean;
};

type SubmitState = {
  loading: boolean;
  message: string;
  success: boolean;
};

const initialState: UploadState = {
  loading: false,
  message: "",
  success: false,
};

const documents: {
  type: DocumentType;
  title: string;
  description: string;
  accept: string;
  icon: string;
}[] = [
  {
    type: "PAN",
    title: "PAN Card",
    description:
      "PAN card की clear JPG, PNG या PDF copy upload करें।",
    accept: "image/jpeg,image/png,application/pdf",
    icon: "💳",
  },
  {
    type: "AADHAAR_FRONT",
    title: "Aadhaar Front",
    description:
      "Aadhaar card के front side की clear copy upload करें।",
    accept: "image/jpeg,image/png,application/pdf",
    icon: "🪪",
  },
  {
    type: "AADHAAR_BACK",
    title: "Aadhaar Back",
    description:
      "Aadhaar card के back side की clear copy upload करें।",
    accept: "image/jpeg,image/png,application/pdf",
    icon: "🪪",
  },
  {
    type: "PROFILE_PHOTO",
    title: "Profile Photo",
    description:
      "अपनी clear profile photo JPG या PNG format में upload करें।",
    accept: "image/jpeg,image/png",
    icon: "👤",
  },
];

export default function KycUploadForm() {
  const router = useRouter();

  const [states, setStates] = useState<
    Record<DocumentType, UploadState>
  >({
    PAN: { ...initialState },
    AADHAAR_FRONT: { ...initialState },
    AADHAAR_BACK: { ...initialState },
    PROFILE_PHOTO: { ...initialState },
  });

  const [submitState, setSubmitState] =
    useState<SubmitState>({
      loading: false,
      message: "",
      success: false,
    });

  async function uploadDocument(
    documentType: DocumentType,
    file: File
  ) {
    if (file.size > 5 * 1024 * 1024) {
      setStates((current) => ({
        ...current,
        [documentType]: {
          loading: false,
          success: false,
          message: "File 5 MB से बड़ी नहीं हो सकती।",
        },
      }));

      return;
    }

    setStates((current) => ({
      ...current,
      [documentType]: {
        loading: true,
        success: false,
        message: "Uploading...",
      },
    }));

    try {
      const formData = new FormData();

      formData.append("documentType", documentType);
      formData.append("file", file);

      const response = await fetch("/api/kyc/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Document upload failed."
        );
      }

      setStates((current) => ({
        ...current,
        [documentType]: {
          loading: false,
          success: true,
          message: "Document uploaded successfully.",
        },
      }));

      // Server component से latest upload progress दिखाएँ।
      router.refresh();
    } catch (error) {
      setStates((current) => ({
        ...current,
        [documentType]: {
          loading: false,
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Document upload failed.",
        },
      }));
    }
  }

  function handleFileChange(
    documentType: DocumentType,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    void uploadDocument(documentType, file);

    // Same file जरूरत पड़ने पर दोबारा select हो सके।
    event.target.value = "";
  }

  async function submitKyc() {
    setSubmitState({
      loading: true,
      success: false,
      message: "KYC submit किया जा रहा है...",
    });

    try {
      const response = await fetch("/api/kyc/submit", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "KYC verification के लिए submit नहीं हो सका।"
        );
      }

      setSubmitState({
        loading: false,
        success: true,
        message:
          data.message ||
          "KYC verification के लिए submit हो गया है।",
      });

      router.refresh();
    } catch (error) {
      setSubmitState({
        loading: false,
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "KYC submit नहीं हो सका।",
      });
    }
  }

  const anyUploadRunning = Object.values(states).some(
    (state) => state.loading
  );

  return (
    <section className="mt-8">
      <div>
        <h4 className="text-lg font-bold text-gray-900">
          KYC Documents
        </h4>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Verification के लिए required documents upload करें।
          Maximum file size 5 MB है।
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {documents.map((document) => {
          const state = states[document.type];

          return (
            <div
              key={document.type}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  {document.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-gray-900">
                    {document.title}
                  </h5>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    {document.description}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label
                  className={`inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
                    state.loading
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {state.loading
                    ? "Uploading..."
                    : "Choose & Upload"}

                  <input
                    type="file"
                    className="hidden"
                    accept={document.accept}
                    disabled={
                      state.loading ||
                      submitState.loading
                    }
                    onChange={(event) =>
                      handleFileChange(
                        document.type,
                        event
                      )
                    }
                  />
                </label>
              </div>

              {state.message && (
                <div
                  className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                    state.success
                      ? "bg-green-50 text-green-700"
                      : state.loading
                        ? "bg-blue-50 text-blue-700"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {state.success && "✓ "}
                  {state.message}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm leading-6 text-amber-800">
          🔒 आपके KYC documents private storage में रखे जाते हैं।
          इन्हें public file URL के रूप में expose नहीं किया जाता।
        </p>
      </div>

      {/* Submit KYC */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h5 className="font-bold text-blue-900">
          Submit for Verification
        </h5>

        <p className="mt-2 text-sm leading-6 text-blue-700">
          PAN Card, Aadhaar Front, Aadhaar Back और Profile Photo
          upload करने के बाद KYC को admin verification के लिए
          submit करें।
        </p>

        <button
          type="button"
          onClick={() => void submitKyc()}
          disabled={
            submitState.loading || anyUploadRunning
          }
          className={`mt-4 rounded-lg px-5 py-3 font-semibold text-white transition ${
            submitState.loading || anyUploadRunning
              ? "cursor-not-allowed bg-gray-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {submitState.loading
            ? "Submitting..."
            : "Submit KYC for Verification"}
        </button>

        {submitState.message && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              submitState.success
                ? "bg-green-100 text-green-800"
                : submitState.loading
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {submitState.success && "✓ "}
            {submitState.message}
          </div>
        )}
      </div>
    </section>
  );
}