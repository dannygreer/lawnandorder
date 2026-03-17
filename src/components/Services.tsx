import Image from "next/image";
import { Scissors, Sprout, Trash2 } from "lucide-react";

const services = [
  {
    icon: Sprout,
    title: "Lawn Mowing",
    description:
      "Professional mowing tailored to your lawn size and grass type. We keep your yard at the ideal height for a healthy, lush appearance all season long.",
    image: "/images/edger.jpg",
  },
  {
    icon: Scissors,
    title: "Edging",
    description:
      "Clean, precise edging along driveways, sidewalks, and flowerbeds. Sharp lines that give your property that well-maintained, polished look.",
    image: "/images/lawn-wide.jpg",
  },
  {
    icon: Trash2,
    title: "Grass Bagging & Removal",
    description:
      "Complete cleanup after every visit. We bag and haul away all clippings so your lawn looks pristine, with no mess left behind.",
    image: "/images/grass-closeup.jpg",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-green-brand">
            What We Do
          </span>
          <h2 className="mt-3 text-4xl font-bold text-forest sm:text-5xl">
            Our Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Everything you need to keep your lawn looking its best, from mowing
            to detailed edging and full cleanup.
          </p>
        </div>

        {/* Service Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 shadow-md backdrop-blur-sm">
                  <service.icon className="h-6 w-6 text-green-brand" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-forest">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
