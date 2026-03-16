"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    lotSize: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to backend
    alert("Thank you! We'll be in touch within 24 hours.");
  };

  return (
    <section id="contact" className="bg-cream py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left side - Info */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-green-brand">
              Get In Touch
            </span>
            <h2 className="mt-3 text-4xl font-bold text-forest sm:text-5xl">
              Request a Free Estimate
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              Fill out the form and we&apos;ll get back to you within 24 hours
              with a quote tailored to your property. No obligation, no pressure.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-brand/10">
                  <Phone className="h-5 w-5 text-green-brand" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Give us a call</p>
                  <p className="text-lg font-semibold text-forest">
                    (903) 555-1234
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-brand/10">
                  <Mail className="h-5 w-5 text-green-brand" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email us</p>
                  <p className="text-lg font-semibold text-forest">
                    hello@lindalelawnco.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-brand/10">
                  <MapPin className="h-5 w-5 text-green-brand" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service area</p>
                  <p className="text-lg font-semibold text-forest">
                    Lindale, TX & surrounding areas
                  </p>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-sm font-semibold text-forest">
                Accepted Payment Methods
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Cash &bull; Check &bull; Venmo &bull; Cash App &bull; Zelle
              </p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="rounded-2xl bg-white p-8 shadow-lg sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                  placeholder="John Smith"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                    placeholder="(903) 555-1234"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                    placeholder="john@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Property Address *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                  placeholder="123 Main St, Lindale, TX"
                />
              </div>

              <div>
                <label
                  htmlFor="lotSize"
                  className="block text-sm font-medium text-gray-700"
                >
                  Estimated Lot Size
                </label>
                <select
                  id="lotSize"
                  value={formData.lotSize}
                  onChange={(e) =>
                    setFormData({ ...formData, lotSize: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                >
                  <option value="">Select size...</option>
                  <option value="small">Small (under 0.25 acre)</option>
                  <option value="medium">Medium (0.25–0.4 acre)</option>
                  <option value="large">Large (0.5 acre+)</option>
                </select>
              </div>


              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-green-brand px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-forest-light"
              >
                <Send className="h-5 w-5" />
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
