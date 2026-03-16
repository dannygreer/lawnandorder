"use client";

import { useState } from "react";
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";

interface Invoice {
  id: number;
  customer: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  method: string;
}

const initialInvoices: Invoice[] = [
  { id: 1001, customer: "Johnson Family", date: "2026-03-15", amount: 50, status: "paid", method: "Venmo" },
  { id: 1002, customer: "Smith Residence", date: "2026-03-15", amount: 35, status: "paid", method: "Cash" },
  { id: 1003, customer: "Williams Home", date: "2026-03-15", amount: 65, status: "pending", method: "Zelle" },
  { id: 1004, customer: "Davis Property", date: "2026-03-14", amount: 50, status: "paid", method: "Cash App" },
  { id: 1005, customer: "Brown Family", date: "2026-03-14", amount: 45, status: "paid", method: "Check" },
  { id: 1006, customer: "Garcia Home", date: "2026-03-13", amount: 70, status: "overdue", method: "Venmo" },
  { id: 1007, customer: "Miller Residence", date: "2026-03-13", amount: 30, status: "paid", method: "Cash" },
  { id: 1008, customer: "Wilson Property", date: "2026-03-12", amount: 50, status: "paid", method: "Zelle" },
  { id: 1009, customer: "Anderson Home", date: "2026-03-12", amount: 50, status: "pending", method: "Cash App" },
  { id: 1010, customer: "Taylor Residence", date: "2026-03-11", amount: 75, status: "paid", method: "Venmo" },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = invoices.filter((inv) => {
    const matchesSearch = inv.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);

  const statusIcon = {
    paid: <CheckCircle className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    overdue: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  const statusStyle = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };

  const markPaid = (id: number) => {
    setInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, status: "paid" as const } : inv)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
          <p className="text-sm text-gray-500">Manage invoices and payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Collected</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-900">${totalPaid}</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-900">${totalPending}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Overdue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-900">${totalOverdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-green-brand focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {["all", "paid", "pending", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? "bg-green-brand text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left font-medium text-gray-500">Invoice</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Customer</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Method</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-gray-500">#{inv.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{inv.customer}</td>
                <td className="px-6 py-4 text-gray-700">{inv.date}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">${inv.amount}</td>
                <td className="px-6 py-4 text-gray-700">{inv.method}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[inv.status]}`}>
                    {statusIcon[inv.status]}
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {inv.status !== "paid" && (
                    <button
                      onClick={() => markPaid(inv.id)}
                      className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
