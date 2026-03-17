import { Shield, Clock, CreditCard, Bell, Smile, MapPin } from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "Fully Insured",
    description: "Peace of mind knowing your property is protected.",
  },
  {
    icon: Clock,
    title: "Early Morning Service",
    description: "We start at 7 AM to beat the Texas heat.",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Pay with Cash, Venmo, Cash App, Zelle, or check.",
  },
  {
    icon: Bell,
    title: "Automated Notifications",
    description: "Know exactly when we're coming and when we're done.",
  },
  {
    icon: Smile,
    title: "Responsible & Trustworthy",
    description: "Dependable crew you can count on.",
  },
  {
    icon: MapPin,
    title: "100% Local",
    description: "Born and raised in Lindale. We know your neighborhood.",
  },
];

export default function WhyUs() {
  return (
    <section className="bg-forest py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-lime-accent">
            Why Choose Us
          </span>
          <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
            More Than Just Mowing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-green-200">
            We go above and beyond to deliver a lawn care experience you can
            trust.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-accent/20">
                <reason.icon className="h-6 w-6 text-lime-accent" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm text-green-200">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
