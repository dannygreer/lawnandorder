"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.svg"
              alt="Lawn & Order"
              width={120}
              height={63}
              className="h-12 w-auto"
              priority
            />
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
