"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Plus,
  CalendarDays,
  CreditCard,
  Loader2,
  Clock,
  Check,
  X,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportData {
  activeCustomers: number;
  revenueThisWeek: number;
  totalJobs: number;
}

interface Job {
  id: string;
  customer_id: string;
  customer?: { first_name: string; last_name: string; address: string };
  scheduled_date: string;
  status: "scheduled" | "completed" | "billed" | "cancelled";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportRes, jobsRes] = await Promise.all([
        fetch("/api/admin/reports"),
        fetch(`/api/admin/jobs?startDate=${today}&endDate=${today}`),
      ]);

      if (reportRes.ok) {
        const rd = await reportRes.json();
        setReport({
          activeCustomers: rd.activeCustomers ?? 0,
          revenueThisWeek: rd.revenueThisWeek ?? 0,
          totalJobs: rd.totalJobs ?? 0,
        });
      }

      if (jobsRes.ok) {
        const jd: Job[] = await jobsRes.json();
        setTodayJobs(jd);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function customerName(job: Job) {
    if (job.customer) {
      return `${job.customer.first_name} ${job.customer.last_name}`;
    }
    return "Unknown";
  }

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-amber-100 text-amber-700",
    billed: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    scheduled: <Clock className="h-3.5 w-3.5 text-blue-500" />,
    completed: <Check className="h-3.5 w-3.5 text-green-500" />,
    billed: <DollarSign className="h-3.5 w-3.5 text-green-600" />,
    cancelled: <X className="h-3.5 w-3.5 text-gray-400" />,
  };

  const scheduledCount = todayJobs.filter(
    (j) => j.status === "scheduled"
  ).length;
  const completedCount = todayJobs.filter(
    (j) => j.status === "completed"
  ).length;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-green-brand" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {report?.activeCustomers ?? "--"}
                  </p>
                  <p className="text-xs text-gray-500">Active Customers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(report?.revenueThisWeek ?? 0).toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Weekly Revenue</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {todayJobs.length}
                  </p>
                  <p className="text-xs text-gray-500">Jobs Today</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedCount}/{todayJobs.length}
                  </p>
                  <p className="text-xs text-gray-500">Completed Today</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two columns */}
          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/admin/customers/new">
              <Card className="h-full transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                <CardContent className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Add Customer</p>
                    <p className="text-xs text-gray-500">Add a new lawn care customer</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/schedule">
              <Card className="h-full transition-colors hover:border-green-200 hover:bg-green-50/30">
                <CardContent className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    <CalendarDays className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Generate Schedule</p>
                    <p className="text-xs text-gray-500">Create jobs for the upcoming week</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/billing">
              <Card className="h-full transition-colors hover:border-amber-200 hover:bg-amber-50/30">
                <CardContent className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">View Billing Queue</p>
                    <p className="text-xs text-gray-500">Bill completed jobs</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Today's Schedule */}
          <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-green-brand" />
                  Today&apos;s Schedule
                  <Badge className="ml-auto bg-green-100 text-green-700">
                    {scheduledCount} remaining
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {todayJobs.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    No jobs scheduled for today.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {todayJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`flex items-center gap-4 px-4 py-3 ${
                          job.status === "cancelled" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                          {statusIcons[job.status]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium text-gray-900 ${
                              job.status === "cancelled" ? "line-through" : ""
                            }`}
                          >
                            {customerName(job)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {job.customer?.address?.split(",")[0] ?? ""}
                          </p>
                        </div>
                        <Badge className={statusColors[job.status]}>
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
