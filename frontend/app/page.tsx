import Link from "next/link";

export default function Home() {
  const services = [
    {
      title: "Recharge",
      description: "Mobile Recharge और DTH services",
      icon: "📱",
    },
    {
      title: "Utility",
      description: "Electricity, Postpaid और FASTag services",
      icon: "💡",
    },
    {
      title: "Banking",
      description: "AEPS, Money Transfer और UPI Cash",
      icon: "🏦",
    },
    {
      title: "Travels",
      description: "Train, Bus, Flight और Hotel booking",
      icon: "✈️",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-blue-700">
              RY MULTI SERVICE
            </h1>
            <p className="text-xs text-slate-500">
              Digital Services Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-100">
            Welcome to RY Multi Service
          </p>

          <h2 className="mx-auto max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
            Digital Services,
            <br />
            All in One Place
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-blue-100 md:text-lg">
            Recharge, utility payments, banking and travel services के लिए
            एक सरल और सुरक्षित digital platform.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-7 py-3 font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/60 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Our Services
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            One Platform, Multiple Services
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            उपलब्ध services provider configuration और authorization के
            अनुसार संचालित की जाती हैं।
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                {service.icon}
              </div>

              <h3 className="text-lg font-bold">{service.title}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Account CTA */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-900 px-6 py-12 text-center text-white md:px-12">
          <h2 className="text-3xl font-bold">
            Start with RY MULTI SERVICE
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            अपना account बनाएं या existing account से login करके dashboard
            access करें।
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Create Account
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-slate-600 px-6 py-3 font-semibold transition hover:bg-slate-800"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7 text-center">
          <p className="font-semibold text-slate-700">
            RY MULTI SERVICE
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Digital Services Platform
          </p>
        </div>
      </footer>
    </main>
  );
}