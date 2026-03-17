"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Loader2,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Send,
  RotateCcw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Job {
  id: string;
  customer_id: string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    address: string;
    stripe_payment_method_id?: string | null;
    phone?: string;
  };
  scheduled_date: string;
  status: string;
  service_cost?: number;
  billed_at?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BillingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingIds, setBillingIds] = useState<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data: Job[] = await res.json();
      setJobs(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const awaitingBilling = jobs.filter(
    (j) => j.status === "completed" && !j.billed_at
  );

  // Customers with scheduled/completed jobs but no stripe payment method
  const missingPaymentCustomers = (() => {
    const seen = new Set<string>();
    const result: Array<{
      id: string;
      name: string;
      phone?: string;
      jobCount: number;
    }> = [];
    jobs.forEach((j) => {
      if (
        j.customer &&
        !j.customer.stripe_payment_method_id &&
        (j.status === "scheduled" || j.status === "completed") &&
        !seen.has(j.customer.id)
      ) {
        seen.add(j.customer.id);
        const cJobs = jobs.filter(
          (jj) =>
            jj.customer_id === j.customer_id &&
            (jj.status === "scheduled" || jj.status === "completed")
        );
        result.push({
          id: j.customer.id,
          name: `${j.customer.first_name} ${j.customer.last_name}`,
          phone: j.customer.phone,
          jobCount: cJobs.length,
        });
      }
    });
    return result;
  })();

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  async function billJob(id: string) {
    setBillingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "billed",
          billed_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to bill job");
      toast.success("Job billed successfully");
      fetchJobs();
    } catch {
      toast.error("Failed to bill job");
    } finally {
      setBillingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function sendSetupLink(customerId: string, name: string) {
    toast.success(`Payment setup link sent to ${name}`);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function customerName(job: Job) {
    if (job.customer) {
      return `${job.customer.first_name} ${job.customer.last_name}`;
    }
    return "Unknown";
  }

  const totalAwaitingAmount = awaitingBilling.reduce(
    (sum, j) => sum + (j.service_cost ?? 0),
    0
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing Queue</h2>
        <p className="text-sm text-gray-500">
          Manage billing for completed jobs
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {awaitingBilling.length}
              </p>
              <p className="text-xs text-gray-500">Awaiting Billing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${totalAwaitingAmount.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Pending Amount</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {missingPaymentCustomers.length}
              </p>
              <p className="text-xs text-gray-500">Missing Payment Info</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-green-brand" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchJobs}
            className="ml-2"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Awaiting Billing */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                Awaiting Billing
                <Badge className="ml-2 bg-amber-100 text-amber-700">
                  {awaitingBilling.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {awaitingBilling.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  All caught up! No jobs awaiting billing.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {awaitingBilling.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {customerName(job)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {format(
                              parseISO(job.scheduled_date),
                              "MMM d, yyyy"
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            ${(job.service_cost ?? 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              onClick={() => billJob(job.id)}
                              disabled={billingIds.has(job.id)}
                              className="bg-green-brand text-white hover:bg-forest-light"
                            >
                              {billingIds.has(job.id) ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              )}
                              Bill Now
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Failed Charges */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Failed Charges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-sm text-gray-400">
                <CreditCard className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2">
                  No failed charges. Stripe webhook integration coming soon.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Missing Payment Info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-500" />
                Missing Payment Info
                {missingPaymentCustomers.length > 0 && (
                  <Badge className="ml-2 bg-orange-100 text-orange-700">
                    {missingPaymentCustomers.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {missingPaymentCustomers.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  All customers have payment info on file.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          Active Jobs
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {missingPaymentCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {c.name}
                            </p>
                            {c.phone && (
                              <p className="text-xs text-gray-500">
                                {c.phone}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {c.jobCount} jobs
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendSetupLink(c.id, c.name)}
                            >
                              <Send className="mr-1 h-3 w-3" />
                              Send Setup Link
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
