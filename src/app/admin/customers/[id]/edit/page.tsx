"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface CustomerFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  service_cost: number;
  service_frequency: string;
  service_notes: string;
  is_active: boolean;
}

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "TX",
      zip: "",
      service_cost: 0,
      service_frequency: "weekly",
      service_notes: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/admin/customers/${id}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        reset({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "TX",
          zip: data.zip || "",
          service_cost: data.service_cost || 0,
          service_frequency: data.service_frequency || "weekly",
          service_notes: data.service_notes || "",
          is_active: data.is_active ?? true,
        });
      } catch {
        toast.error("Failed to load customer");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [id, reset]);

  async function onSubmit(data: CustomerFormData) {
    setSubmitting(true);
    try {
      const phone = data.phone.replace(/\D/g, "");
      const payload = {
        ...data,
        phone,
        email: data.email || undefined,
        service_notes: data.service_notes || undefined,
      };

      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update customer");
      }

      toast.success("Customer updated successfully");
      router.push(`/admin/customers/${id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update customer"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-brand" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Customer not found.</p>
        <Link href="/admin/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back link */}
      <Link href={`/admin/customers/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Customer
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit Customer</CardTitle>
          <CardDescription>
            Update the customer details below. Fields marked with * are
            required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name *</Label>
                <Input
                  id="first_name"
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                  aria-invalid={!!errors.first_name}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name *</Label>
                <Input
                  id="last_name"
                  {...register("last_name", {
                    required: "Last name is required",
                  })}
                  aria-invalid={!!errors.last_name}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(903) 555-0100"
                  {...register("phone", {
                    required: "Phone is required",
                    validate: (val) =>
                      val.replace(/\D/g, "").length === 10 ||
                      "Phone must be 10 digits",
                  })}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@email.com"
                  {...register("email", {
                    validate: (val) =>
                      !val ||
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
                      "Invalid email address",
                  })}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                {...register("address", { required: "Address is required" })}
                aria-invalid={!!errors.address}
              />
              {errors.address && (
                <p className="text-xs text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Lindale"
                  {...register("city", { required: "City is required" })}
                  aria-invalid={!!errors.city}
                />
                {errors.city && (
                  <p className="text-xs text-red-500">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...register("state", { required: "State is required" })}
                  aria-invalid={!!errors.state}
                />
                {errors.state && (
                  <p className="text-xs text-red-500">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP *</Label>
                <Input
                  id="zip"
                  placeholder="75771"
                  {...register("zip", { required: "ZIP is required" })}
                  aria-invalid={!!errors.zip}
                />
                {errors.zip && (
                  <p className="text-xs text-red-500">{errors.zip.message}</p>
                )}
              </div>
            </div>

            {/* Service */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service_cost">Service cost *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    $
                  </span>
                  <Input
                    id="service_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    {...register("service_cost", {
                      required: "Service cost is required",
                      valueAsNumber: true,
                      validate: (val) => val > 0 || "Must be a positive number",
                    })}
                    aria-invalid={!!errors.service_cost}
                  />
                </div>
                {errors.service_cost && (
                  <p className="text-xs text-red-500">
                    {errors.service_cost.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_frequency">Frequency</Label>
                <select
                  id="service_frequency"
                  {...register("service_frequency")}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="on_demand">On demand</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="service_notes">Service notes</Label>
              <Textarea
                id="service_notes"
                placeholder="Special instructions, gate codes, pet warnings, etc."
                {...register("service_notes")}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setValue("is_active", !isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  isActive ? "bg-green-brand" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <Label
                className="cursor-pointer"
                onClick={() => setValue("is_active", !isActive)}
              >
                Active customer
              </Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <Link href={`/admin/customers/${id}`}>
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-green-brand hover:bg-forest-light"
              >
                {submitting && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
