import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold">Lindale Lawn Co.</h3>
            <p className="mt-3 text-sm text-green-200">
              Professional lawn care services for Lindale, TX and surrounding
              areas. Insured, reliable, and dedicated to keeping your yard
              looking its best.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-green-300">
              Contact Us
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-sm text-green-100">
                <Phone className="h-4 w-4 shrink-0 text-green-300" />
                (903) 555-1234
              </li>
              <li className="flex items-center gap-3 text-sm text-green-100">
                <Mail className="h-4 w-4 shrink-0 text-green-300" />
                hello@lindalelawnco.com
              </li>
              <li className="flex items-center gap-3 text-sm text-green-100">
                <MapPin className="h-4 w-4 shrink-0 text-green-300" />
                Lindale, TX
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-green-800 pt-8 text-center text-sm text-green-300">
          <p>
            &copy; {new Date().getFullYear()} Lindale Lawn Co. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
