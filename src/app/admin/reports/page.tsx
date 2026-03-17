"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DatePreset = "week" | "month" | "all";

interface CustomerBreakdown {
  id: string;
  name: string;
  jobs_completed: number;
  total_billed: number;
  avg_per_job: number;
}

interface ReportData {
  total_revenue: number;
  jobs_completed: number;
  avg_revenue_per_job: number;
  active_customers: number;
  customers: CustomerBreakdown[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<DatePreset>("month");

  useEffect(() => {
    fetchReport(preset);
  }, [preset]);

  async function fetchReport(period: DatePreset) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period !== "all") {
        const now = new Date();
        let start: Date;
        if (period === "week") {
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          start.setHours(0, 0, 0, 0);
        } else {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        params.set("startDate", start.toISOString().split("T")[0]);
        params.set("endDate", now.toISOString().split("T")[0]);
      }

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const json = await res.json();
      // Map camelCase API response to snake_case used by UI
      setData({
        total_revenue: json.totalRevenue ?? 0,
        jobs_completed: json.jobsCompleted ?? 0,
        avg_revenue_per_job: json.avgRevenuePerJob ?? 0,
        active_customers: json.activeCustomers ?? 0,
        customers: (json.revenueByCustomer ?? []).map((c: any) => ({
          id: c.customerId,
          name: c.name,
          jobs_completed: c.jobCount,
          total_billed: c.total,
          avg_per_job: c.jobCount > 0 ? c.total / c.jobCount : 0,
        })),
      });
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }

  const presets: { key: DatePreset; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  const partnerShare = data ? data.total_revenue / 2 : 0;

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
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500">
            Revenue and performance overview
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {presets.map((p) => (
            <Button
              key={p.key}
              variant="ghost"
              size="sm"
              onClick={() => setPreset(p.key)}
              className={
                preset === p.key
                  ? "bg-white text-forest shadow-sm hover:bg-white"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${data.total_revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jobs Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.jobs_completed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Revenue/Job</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${data.avg_revenue_per_job.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.active_customers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Partner Earnings Split */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Partner Earnings Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Gross Revenue</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    ${data.total_revenue.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-green-pale p-4">
                  <p className="text-sm text-green-brand">Partner 1 (50%)</p>
                  <p className="mt-1 text-xl font-bold text-forest">
                    ${partnerShare.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-green-pale p-4">
                  <p className="text-sm text-green-brand">Partner 2 (50%)</p>
                  <p className="mt-1 text-xl font-bold text-forest">
                    ${partnerShare.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-Customer Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Per-Customer Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.customers.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <Users className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">
                    No billing data for the selected period.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-4">Customer</TableHead>
                        <TableHead className="px-4">Jobs Completed</TableHead>
                        <TableHead className="px-4">Total Billed</TableHead>
                        <TableHead className="px-4">Avg per Job</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.customers.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="px-4 font-medium text-gray-900">
                            {c.name}
                          </TableCell>
                          <TableCell className="px-4 text-gray-700">
                            <Badge
                              variant="secondary"
                              className="bg-green-pale text-green-brand"
                            >
                              {c.jobs_completed}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 font-semibold text-gray-900">
                            ${c.total_billed.toFixed(2)}
                          </TableCell>
                          <TableCell className="px-4 text-gray-700">
                            ${c.avg_per_job.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <TrendingUp className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No data available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete some jobs to see revenue reports here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
