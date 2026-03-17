"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  DollarSign,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leads", icon: UserPlus },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/schedule", label: "Schedule", icon: Calendar },
  { href: "/admin/routes", label: "Routes", icon: MapPin },
  { href: "/admin/billing", label: "Billing", icon: DollarSign },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthChecked(true);
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/admin/login");
      } else {
        setIsAuthed(true);
      }
      setAuthChecked(true);
    });
  }, [pathname]);

  // Don't render shell on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show nothing while checking auth
  if (!authChecked || !isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-brand border-t-transparent" />
      </div>
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

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
              {process.env.NEXT_PUBLIC_BUSINESS_NAME || "Lawn & Order"}
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
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
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
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-green-200 transition-colors hover:bg-white/10 hover:text-white"
            >
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
            {navItems.find(
              (item) =>
                item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
            )?.label || "Admin"}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
