"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  LogOut,
  Menu,
  X,
  Leaf,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/billing", label: "Billing", icon: DollarSign },
  { href: "/admin/routes", label: "Routes", icon: MapPin },
  { href: "/admin/schedule", label: "Schedule", icon: Calendar },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-forest transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
            <Leaf className="h-6 w-6 text-lime-accent" />
            <span className="text-lg font-bold text-white">
              Lindale Lawn Co.
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-green-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-green-200 transition-colors hover:bg-white/10 hover:text-white">
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-brand text-center text-sm font-bold leading-8 text-white">
              O
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
