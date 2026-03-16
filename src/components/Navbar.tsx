"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-brand">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-forest">
                Lindale Lawn Co.
              </span>
              <span className="hidden text-xs text-gray-500 sm:block">
                Professional Lawn Care
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#services"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-green-brand"
            >
              Services
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-green-brand"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-green-brand"
            >
              Contact
            </a>
          </div>

          {/* CTA */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="tel:+19035551234"
              className="flex items-center gap-2 text-sm font-semibold text-green-brand"
            >
              <Phone className="h-4 w-4" />
              (903) 555-1234
            </a>
            <a
              href="#contact"
              className="rounded-full bg-green-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-light"
            >
              Free Estimate
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a
                href="#services"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                Services
              </a>
              <a
                href="#about"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                About
              </a>
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                Contact
              </a>
              <a
                href="tel:+19035551234"
                className="flex items-center gap-2 text-sm font-semibold text-green-brand"
              >
                <Phone className="h-4 w-4" />
                (903) 555-1234
              </a>
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-green-brand px-6 py-2.5 text-center text-sm font-semibold text-white"
              >
                Free Estimate
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
