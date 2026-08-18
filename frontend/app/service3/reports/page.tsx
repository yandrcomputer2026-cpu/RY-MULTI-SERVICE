import Link from "next/link";

type Transaction = {
  id: string;
  date: string;
  service: string;
  transactionId: string;
  amount: number;
  status: "Success" | "Pending" | "Failed";
};

const transactions: Transaction[] = [
  {
    id: "1",
    date: "14 Aug 2026, 10:30 AM",
    service: "Mobile Prepaid Recharge",
    transactionId: "RY100001",
    amount: 299,
    status: "Success",
  },
  {
    id: "2",
    date: "13 Aug 2026, 05:45 PM",
    service: "Electricity Bill Payment",
    transactionId: "RY100002",
    amount: 1250,
    status: "Success",
  },
  {
    id: "3",
    date: "12 Aug 2026, 02:15 PM",
    service: "DTH Recharge",
    transactionId: "RY100003",
    amount: 399,
    status: "Pending",
  },
  {
    id: "4",
    date: "11 Aug 2026, 11:20 AM",
    service: "AEPS Withdrawal",
    transactionId: "RY100004",
    amount: 2000,
    status: "Success",
  },
  {
    id: "5",
    date: "10 Aug 2026, 04:10 PM",
    service: "Internet / TV Bill",
    transactionId: "RY100005",
    amount: 799,
    status: "Failed",
  },
];

export default function AllTransactionReportsPage() {
  const totalTransactions = transactions.length;

  const successfulTransactions = transactions.filter(
    (transaction) => transaction.status === "Success"
  ).length;

  const pendingTransactions = transactions.filter(
    (transaction) => transaction.status === "Pending"
  ).length;

  const failedTransactions = transactions.filter(
    (transaction) => transaction.status === "Failed"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <h1 className="text-xl font-bold text-blue-700">
            RY MULTI SERVICE
          </h1>

          <div className="flex items-center gap-6">

            <Link
              href="/service3"
              className="text-gray-600 hover:text-blue-600"
            >
              Account
            </Link>

            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </Link>

          </div>
        </div>
      </header>


      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* PAGE TITLE */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            All Transaction Reports 📊
          </h2>

          <p className="text-gray-600 mt-2">
            आपके सभी recharge, bill payment, booking और AEPS transactions की
            पूरी जानकारी।
          </p>
        </div>


        {/* ================= SUMMARY ================= */}
        <div className="grid md:grid-cols-4 gap-5 mt-8">

          {/* Total */}
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Total Transactions
            </p>

            <h3 className="text-3xl font-bold text-gray-900 mt-2">
              {totalTransactions}
            </h3>
          </div>


          {/* Success */}
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Successful
            </p>

            <h3 className="text-3xl font-bold text-green-600 mt-2">
              {successfulTransactions}
            </h3>
          </div>


          {/* Pending */}
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Pending
            </p>

            <h3 className="text-3xl font-bold text-yellow-600 mt-2">
              {pendingTransactions}
            </h3>
          </div>


          {/* Failed */}
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Failed
            </p>

            <h3 className="text-3xl font-bold text-red-600 mt-2">
              {failedTransactions}
            </h3>
          </div>

        </div>


        {/* ================= FILTER ================= */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h3 className="text-xl font-bold text-gray-900">
            Transaction Filter
          </h3>

          <div className="grid md:grid-cols-4 gap-4 mt-5">

            {/* Service */}
            <select
              className="border border-gray-300 rounded-lg px-4 py-3"
              defaultValue=""
            >
              <option value="">
                All Services
              </option>

              <option>
                Mobile Recharge
              </option>

              <option>
                DTH Recharge
              </option>

              <option>
                Electricity Bill
              </option>

              <option>
                Internet / TV Bill
              </option>

              <option>
                Travel
              </option>

              <option>
                Hotel Booking
              </option>

              <option>
                AEPS
              </option>
            </select>


            {/* Status */}
            <select
              className="border border-gray-300 rounded-lg px-4 py-3"
              defaultValue=""
            >
              <option value="">
                All Status
              </option>

              <option>
                Success
              </option>

              <option>
                Pending
              </option>

              <option>
                Failed
              </option>
            </select>


            {/* From Date */}
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />


            {/* To Date */}
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-3"
            />

          </div>

        </div>


        {/* ================= TRANSACTION TABLE ================= */}
        <div className="bg-white rounded-xl shadow mt-8 overflow-hidden">

          <div className="px-6 py-5 border-b">
            <h3 className="text-xl font-bold text-gray-900">
              Transaction History
            </h3>
          </div>


          {/* Desktop Table */}
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Service
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Transaction ID
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Amount
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {transactions.map((transaction) => (

                  <tr
                    key={transaction.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {transaction.date}
                    </td>


                    <td className="px-6 py-4 font-medium text-gray-900">
                      {transaction.service}
                    </td>


                    <td className="px-6 py-4 text-gray-600">
                      {transaction.transactionId}
                    </td>


                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{transaction.amount.toLocaleString("en-IN")}
                    </td>


                    <td className="px-6 py-4">

                      {transaction.status === "Success" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                          Success
                        </span>
                      )}

                      {transaction.status === "Pending" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                          Pending
                        </span>
                      )}

                      {transaction.status === "Failed" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                          Failed
                        </span>
                      )}

                    </td>


                    <td className="px-6 py-4">

                      <button
                        type="button"
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* ================= EXPORT ================= */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h3 className="text-xl font-bold text-gray-900">
            Download Report
          </h3>

          <p className="text-gray-500 mt-2">
            अपनी transaction history को report के रूप में download करें।
          </p>

          <div className="flex flex-wrap gap-4 mt-5">

            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-lg"
            >
              Download Excel
            </button>

            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-lg"
            >
              Download PDF
            </button>

            <button
              type="button"
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-5 py-3 rounded-lg"
            >
              Print Report
            </button>

          </div>

        </div>


        {/* ================= BACK ================= */}
        <div className="mt-8">

          <Link
            href="/service3"
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Service 3 पर वापस जाएँ
          </Link>

        </div>

      </div>

    </main>
  );
}
