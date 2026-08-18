import PrintButton from "./PrintButton";

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

export default async function ConfirmationPage({
  params,
}: PageProps) {
  const { transactionId } = await params;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-1 text-xl font-bold text-gray-900">
            Flight Booking Confirmation
          </h1>
        </div>

        {/* Success Card */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">

          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl text-white">
              ✓
            </div>
          </div>

          {/* Success Message */}
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-green-700">
              Flight Payment Successful
            </h2>

            <p className="mt-2 text-sm text-green-700">
              आपकी flight payment successfully verify हो गई है।
            </p>

            <p className="mt-1 text-sm text-gray-600">
              आपकी booking confirmation process में है।
            </p>
          </div>

          {/* Transaction ID */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-white p-4">
            <p className="text-xs text-gray-500">
              Transaction ID
            </p>

            <p className="mt-1 break-all font-semibold text-blue-700">
              {transactionId}
            </p>
          </div>

          {/* Booking Status */}
          <div className="mt-4 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Payment Status
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                SUCCESS
              </span>
            </div>
          </div>

        </div>

        {/* Information */}
        <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">
            Booking Information
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            आपकी flight booking payment successfully complete हो गई है।
            कृपया अपना Transaction ID सुरक्षित रखें।
          </p>

          <p className="mt-3 text-sm text-gray-600">
            Flight booking confirmation और आगे की जानकारी आपके booking
            process के अनुसार उपलब्ध होगी।
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-3">

          <a
            href="/"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Home
          </a>

          <div className="flex-1">
            <PrintButton />
          </div>

        </div>

      </div>
    </main>
  );
}