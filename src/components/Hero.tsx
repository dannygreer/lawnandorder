"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, Shield, Clock, Star, Send } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

export default function Hero() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    lotSize: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Thank you! We'll be in touch within 24 hours.");
        setForm({ name: "", phone: "", email: "", address: "", lotSize: "", message: "" });
      } else {
        alert("Something went wrong. Please try again or call us directly.");
      }
    } catch {
      alert("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/lawn-landscape.jpg"
          alt="Beautiful green lawn"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/70 to-forest/40" />
      </div>

      {/* Content */}
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 pt-28 pb-32 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left column — headline */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-green-200 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-gold text-gold" />
            Trusted Lawn Care in East Texas
          </div>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl">
            Your Lawn,
            <br />
            <span className="text-lime-accent">Our Pride.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-green-100/90">
            Professional mowing, edging, and lawn maintenance for homes across
            Lindale and surrounding areas. Insured, dependable, and dedicated to making your yard the
            best on the block.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="tel:+19035551234"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <Phone className="h-5 w-5" />
              Call Us Now
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm text-green-200">
              <Shield className="h-5 w-5 text-lime-accent" />
              Fully Insured
            </div>
            <div className="flex items-center gap-2 text-sm text-green-200">
              <Clock className="h-5 w-5 text-lime-accent" />
              Weekly Service
            </div>
            <div className="flex items-center gap-2 text-sm text-green-200">
              <Star className="h-5 w-5 text-lime-accent" />
              Local & Trusted
            </div>
          </div>
        </div>

        {/* Right column — estimate card */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-forest">
              Request a Free Estimate
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              We&apos;ll get back to you within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                />
              </div>
              <div>
                <AddressAutocomplete
                  required
                  value={form.address}
                  onChange={(val) => setForm({ ...form, address: val })}
                />
              </div>
              <div>
                <select
                  value={form.lotSize}
                  onChange={(e) =>
                    setForm({ ...form, lotSize: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
                >
                  <option value="">Estimated Lot Size...</option>
                  <option value="small">Small (under 0.25 acre)</option>
                  <option value="medium">Medium (0.25–0.4 acre)</option>
                  <option value="large">Large (0.5 acre+)</option>
                </select>
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-green-brand px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-forest-light"
              >
                <Send className="h-4 w-4" />
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>

    </section>
  );
}
