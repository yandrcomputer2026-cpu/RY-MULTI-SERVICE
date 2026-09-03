"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Passenger = {
  name: string;
  age: string;
  gender: string;
  berthPreference: string;
};

function TrainPassengersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const passengers = Number(searchParams.get("passengers") || "1");
  const travelClass = searchParams.get("class") || "SL";

  const trainNo = searchParams.get("trainNo") || "";
  const trainName = searchParams.get("trainName") || "";
  const departure = searchParams.get("departure") || "";
  const arrival = searchParams.get("arrival") || "";
  const duration = searchParams.get("duration") || "";
  const fare = Number(searchParams.get("fare") || "0");
  const totalFare = Number(searchParams.get("totalFare") || "0");

  const [passengerList, setPassengerList] = useState<Passenger[]>(
    Array.from({ length: passengers }, () => ({
      name: "",
      age: "",
      gender: "",
      berthPreference: "No Preference",
    }))
  );

  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  function updatePassenger(
    index: number,
    field: keyof Passenger,
    value: string
  ) {
    setPassengerList((current) =>
      current.map((passenger, i) =>
        i === index
          ? {
              ...passenger,
              [field]: value,
            }
          : passenger
      )
    );
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();

    for (let i = 0; i < passengerList.length; i++) {
      const passenger = passengerList[i];

      if (!passenger.name.trim()) {
        alert(`Passenger ${i + 1} का नाम भरें।`);
        return;
      }

      const age = Number(passenger.age);

      if (!Number.isInteger(age) || age < 1 || age > 120) {
        alert(`Passenger ${i + 1} की सही Age भरें।`);
        return;
      }

      if (!passenger.gender) {
        alert(`Passenger ${i + 1} का Gender चुनें।`);
        return;
      }
    }

    if (!/^\d{10}$/.test(mobile)) {
      alert("कृपया 10 digit Mobile Number भरें।");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      alert("कृपया सही Email Address भरें।");
      return;
    }

    const bookingData = {
      from,
      to,
      date,
      passengers,
      travelClass,
      trainNo,
      trainName,
      departure,
      arrival,
      duration,
      fare,
      totalFare,
      passengerList,
      contact: {
        mobile,
        email: email.trim().toLowerCase(),
      },
    };

    sessionStorage.setItem(
      "ryTrainBooking",
      JSON.stringify(bookingData)
    );

    router.push("/service2/train/fare-summary");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">
            RY MULTI SERVICE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            👤 Passenger Details
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            सभी यात्रियों की जानकारी सावधानी से भरें।
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">
            {trainName}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Train No: {trainNo}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">
                Route
              </p>

              <p className="font-semibold text-gray-900">
                {from} → {to}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Journey Date
              </p>

              <p className="font-semibold text-gray-900">
                {date}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Class
              </p>

              <p className="font-semibold text-gray-900">
                {travelClass}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Passengers
              </p>

              <p className="font-semibold text-gray-900">
                {passengers}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleContinue}>
          <div className="space-y-5">
            {passengerList.map((passenger, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-bold text-gray-900">
                  Passenger {index + 1}
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Passenger का पूरा नाम"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Age
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={passenger.age}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "age",
                          e.target.value
                        )
                      }
                      placeholder="Age"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Gender
                    </label>

                    <select
                      value={passenger.gender}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "gender",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Select Gender
                      </option>
                      <option value="Male">
                        Male
                      </option>
                      <option value="Female">
                        Female
                      </option>
                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Berth Preference
                    </label>

                    <select
                      value={passenger.berthPreference}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "berthPreference",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="No Preference">
                        No Preference
                      </option>
                      <option value="Lower">
                        Lower
                      </option>
                      <option value="Middle">
                        Middle
                      </option>
                      <option value="Upper">
                        Upper
                      </option>
                      <option value="Side Lower">
                        Side Lower
                      </option>
                      <option value="Side Upper">
                        Side Upper
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Contact Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Booking confirmation इसी contact पर भेजा जाएगा।
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="10 digit mobile number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="example@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Current Total Fare
                </p>

                <p className="text-xs text-gray-500">
                  {passengers} Passenger × ₹{fare}
                </p>
              </div>

              <p className="text-2xl font-bold text-blue-600">
                ₹{totalFare}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              ← Back
            </button>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue to Fare Summary →
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function TrainPassengersPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-gray-600">
            Passenger details load हो रही हैं...
          </p>
        </main>
      }
    >
      <TrainPassengersContent />
    </Suspense>
  );
}