"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Loader2,
  Users,
  Pencil,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  scheduled_date: string;
  status: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  service_cost: number;
  service_frequency: string | null;
  service_notes: string | null;
  is_active: boolean;
  payment_confirmed_at: string | null;
  payment_setup_token: string | null;
  payment_setup_expires_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  jobs: Job[];
}

type FilterTab = "all" | "active" | "awaiting" | "inactive";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate(id: string, currentlyActive: boolean) {
    const action = currentlyActive ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} this customer?`)) return;

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentlyActive }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} customer`);
      toast.success(`Customer ${action}d successfully`);
      fetchCustomers();
    } catch {
      toast.error(`Failed to ${action} customer`);
    }
  }

  function getPaymentStatus(customer: Customer) {
    if (customer.payment_confirmed_at || customer.stripe_customer_id) {
      return "card_on_file";
    }
    if (customer.payment_setup_token) {
      return "awaiting_setup";
    }
    return "not_sent";
  }

  function getNextJobDate(customer: Customer): string | null {
    const now = new Date().toISOString();
    const upcoming = customer.jobs
      ?.filter((j) => j.scheduled_date >= now && j.status !== "cancelled")
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
    return upcoming?.[0]?.scheduled_date ?? null;
  }

  const filtered = customers
    .filter((c) => {
      const term = search.toLowerCase();
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      return (
        fullName.includes(term) ||
        c.address.toLowerCase().includes(term) ||
        c.phone.includes(term)
      );
    })
    .filter((c) => {
      switch (activeTab) {
        case "active":
          return c.is_active;
        case "awaiting":
          return getPaymentStatus(c) === "awaiting_setup";
        case "inactive":
          return !c.is_active;
        default:
          return true;
      }
    });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: customers.length },
    {
      key: "active",
      label: "Active",
      count: customers.filter((c) => c.is_active).length,
    },
    {
      key: "awaiting",
      label: "Awaiting Payment",
      count: customers.filter((c) => getPaymentStatus(c) === "awaiting_setup").length,
    },
    {
      key: "inactive",
      label: "Inactive",
      count: customers.filter((c) => !c.is_active).length,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">
            {customers.filter((c) => c.is_active).length} active customers
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className={cn(buttonVariants(), "bg-green-brand hover:bg-forest-light")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Customer
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, address, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-forest shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                activeTab === tab.key
                  ? "bg-green-pale text-green-brand"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <Users className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {customers.length === 0 ? "No customers yet" : "No matching customers"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {customers.length === 0
              ? "Add your first customer to get started."
              : "Try adjusting your search or filters."}
          </p>
          {customers.length === 0 && (
            <Link
              href="/admin/customers/new"
              className={cn(
                buttonVariants(),
                "mt-4 bg-green-brand hover:bg-forest-light"
              )}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Customer
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-4">Name</TableHead>
                <TableHead className="px-4">Address</TableHead>
                <TableHead className="px-4">Frequency</TableHead>
                <TableHead className="px-4">Cost</TableHead>
                <TableHead className="px-4">Payment</TableHead>
                <TableHead className="px-4">Next Job</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => {
                const paymentStatus = getPaymentStatus(customer);
                const nextJob = getNextJobDate(customer);

                return (
                  <TableRow key={customer.id}>
                    <TableCell className="px-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-forest hover:underline"
                      >
                        {customer.first_name} {customer.last_name}
                      </Link>
                      <p className="text-xs text-gray-500">{customer.phone}</p>
                    </TableCell>
                    <TableCell className="px-4 text-gray-700">
                      {customer.address}, {customer.city}
                    </TableCell>
                    <TableCell className="px-4">
                      {customer.service_frequency ? (
                        <Badge variant="secondary" className="bg-green-pale text-green-brand">
                          {customer.service_frequency}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 font-semibold text-gray-900">
                      ${customer.service_cost}
                    </TableCell>
                    <TableCell className="px-4">
                      {paymentStatus === "card_on_file" && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Card on file
                        </Badge>
                      )}
                      {paymentStatus === "awaiting_setup" && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          Awaiting setup
                        </Badge>
                      )}
                      {paymentStatus === "not_sent" && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                          Not sent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-gray-700">
                      {nextJob ? (
                        format(new Date(nextJob), "MMM d, yyyy")
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/customers/${customer.id}/edit`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" })
                          )}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            handleDeactivate(customer.id, customer.is_active)
                          }
                          title={customer.is_active ? "Deactivate" : "Reactivate"}
                        >
                          <UserX
                            className={`h-3.5 w-3.5 ${
                              customer.is_active
                                ? "text-gray-500"
                                : "text-green-600"
                            }`}
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
