"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Phone,
  MapPin,
  MoreHorizontal,
  X,
} from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  lotSize: "small" | "medium" | "large";
  price: number;
  route: string;
  status: "active" | "paused" | "inactive";
  paymentMethod: string;
}

const initialCustomers: Customer[] = [
  { id: 1, name: "Johnson Family", phone: "(903) 555-0101", email: "johnson@email.com", address: "145 Oak St, Lindale", lotSize: "medium", price: 50, route: "Monday - North Lindale", status: "active", paymentMethod: "Venmo" },
  { id: 2, name: "Smith Residence", phone: "(903) 555-0102", email: "smith@email.com", address: "220 Pine Ave, Lindale", lotSize: "small", price: 35, route: "Monday - North Lindale", status: "active", paymentMethod: "Cash" },
  { id: 3, name: "Williams Home", phone: "(903) 555-0103", email: "williams@email.com", address: "330 Elm Dr, Lindale", lotSize: "large", price: 65, route: "Tuesday - Downtown", status: "active", paymentMethod: "Zelle" },
  { id: 4, name: "Davis Property", phone: "(903) 555-0104", email: "davis@email.com", address: "412 Maple Ln, Lindale", lotSize: "medium", price: 50, route: "Tuesday - Downtown", status: "active", paymentMethod: "Cash App" },
  { id: 5, name: "Brown Family", phone: "(903) 555-0105", email: "brown@email.com", address: "508 Cedar Ct, Lindale", lotSize: "medium", price: 45, route: "Wednesday - New Subdivisions", status: "active", paymentMethod: "Check" },
  { id: 6, name: "Garcia Home", phone: "(903) 555-0106", email: "garcia@email.com", address: "615 Birch Rd, Lindale", lotSize: "large", price: 70, route: "Thursday - County Road", status: "active", paymentMethod: "Venmo" },
  { id: 7, name: "Miller Residence", phone: "(903) 555-0107", email: "miller@email.com", address: "720 Walnut Way, Lindale", lotSize: "small", price: 30, route: "Wednesday - New Subdivisions", status: "paused", paymentMethod: "Cash" },
  { id: 8, name: "Wilson Property", phone: "(903) 555-0108", email: "wilson@email.com", address: "835 Hickory Dr, Lindale", lotSize: "medium", price: 50, route: "Thursday - County Road", status: "active", paymentMethod: "Zelle" },
];

const lotSizeLabel = { small: "Small (<0.25 ac)", medium: "Medium (0.25-0.4 ac)", large: "Large (0.5+ ac)" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.route.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = {
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    inactive: "bg-red-100 text-red-700",
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this customer?")) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">
            {customers.filter((c) => c.status === "active").length} active
            customers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-green-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, address, or route..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left font-medium text-gray-500">
                Customer
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">
                Lot Size
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">
                Price
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">
                Route
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">
                Payment
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {customer.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {customer.address}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {lotSizeLabel[customer.lotSize]}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  ${customer.price}
                </td>
                <td className="px-6 py-4 text-gray-700">{customer.route}</td>
                <td className="px-6 py-4 text-gray-700">
                  {customer.paymentMethod}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[customer.status]}`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingCustomer(customer)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No customers found matching &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCustomer) && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowAddModal(false);
            setEditingCustomer(null);
          }}
          onSave={(customer) => {
            if (editingCustomer) {
              setCustomers(
                customers.map((c) => (c.id === customer.id ? customer : c))
              );
            } else {
              setCustomers([
                ...customers,
                { ...customer, id: Date.now() },
              ]);
            }
            setShowAddModal(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
}

function CustomerModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}) {
  const [form, setForm] = useState<Customer>(
    customer || {
      id: 0,
      name: "",
      phone: "",
      email: "",
      address: "",
      lotSize: "medium",
      price: 50,
      route: "Monday - North Lindale",
      status: "active",
      paymentMethod: "Cash",
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {customer ? "Edit Customer" : "Add Customer"}
          </h3>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="mt-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Lot Size</label>
              <select value={form.lotSize} onChange={(e) => setForm({ ...form, lotSize: e.target.value as Customer["lotSize"] })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Customer["status"] })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Route</label>
              <select value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none">
                <option>Monday - North Lindale</option>
                <option>Tuesday - Downtown</option>
                <option>Wednesday - New Subdivisions</option>
                <option>Thursday - County Road</option>
                <option>Friday - Overflow</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-brand focus:outline-none">
                <option>Cash</option>
                <option>Check</option>
                <option>Venmo</option>
                <option>Cash App</option>
                <option>Zelle</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
            <button type="submit" className="rounded-lg bg-green-brand px-4 py-2 text-sm font-semibold text-white hover:bg-forest-light">
              {customer ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
