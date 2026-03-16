import { Check } from "lucide-react";

const plans = [
  {
    name: "Small Yard",
    size: "Under 0.25 acre",
    price: "$30–$40",
    features: [
      "Weekly mowing",
      "Edging included",
      "Grass bagging & cleanup",
      "Flexible scheduling",
    ],
    popular: false,
  },
  {
    name: "Medium Yard",
    size: "0.25–0.4 acre",
    price: "$40–$50",
    features: [
      "Weekly mowing",
      "Edging included",
      "Grass bagging & cleanup",
      "Flexible scheduling",
      "Priority scheduling",
    ],
    popular: true,
  },
  {
    name: "Large Yard",
    size: "0.5 acre+",
    price: "$60–$75",
    features: [
      "Weekly mowing",
      "Edging included",
      "Grass bagging & cleanup",
      "Flexible scheduling",
      "Priority scheduling",
      "Custom service plan",
    ],
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-green-pale py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-green-brand">
            Simple Pricing
          </span>
          <h2 className="mt-3 text-4xl font-bold text-forest sm:text-5xl">
            Honest, Upfront Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            No hidden fees. No contracts required. Just great lawn care at fair
            prices. Pay per visit with cash, check, Venmo, Cash App, or Zelle.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
                plan.popular ? "ring-2 ring-green-brand" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute right-0 top-0 rounded-bl-xl bg-green-brand px-4 py-1.5 text-xs font-bold text-white">
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-forest">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.size}</p>
              </div>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-forest">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-500"> / visit</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 shrink-0 text-green-brand" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-green-brand text-white hover:bg-forest-light"
                    : "bg-green-pale text-green-brand hover:bg-green-100"
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
