export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Total revenue
  let revenueQuery = supabase
    .from("jobs")
    .select("amount_charged, status, scheduled_date, customer_id, customers(first_name, last_name)")
    .eq("status", "billed");

  if (startDate) revenueQuery = revenueQuery.gte("scheduled_date", startDate);
  if (endDate) revenueQuery = revenueQuery.lte("scheduled_date", endDate);

  const { data: billedJobs } = await revenueQuery;

  const totalRevenue = (billedJobs || []).reduce(
    (sum, j) => sum + Number(j.amount_charged || 0),
    0
  );
  const jobsCompleted = (billedJobs || []).length;
  const avgRevenuePerJob = jobsCompleted > 0 ? totalRevenue / jobsCompleted : 0;

  // Active customers count
  const { count: activeCustomers } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  // Revenue by customer
  const customerMap: Record<string, { name: string; total: number; jobCount: number }> = {};
  (billedJobs || []).forEach((j: any) => {
    const cid = j.customer_id;
    if (!customerMap[cid]) {
      customerMap[cid] = {
        name: j.customers ? `${j.customers.first_name} ${j.customers.last_name}` : "Unknown",
        total: 0,
        jobCount: 0,
      };
    }
    customerMap[cid].total += Number(j.amount_charged || 0);
    customerMap[cid].jobCount++;
  });

  const revenueByCustomer = Object.entries(customerMap)
    .map(([customerId, data]) => ({ customerId, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Jobs by status (all statuses)
  let statusQuery = supabase.from("jobs").select("status");
  if (startDate) statusQuery = statusQuery.gte("scheduled_date", startDate);
  if (endDate) statusQuery = statusQuery.lte("scheduled_date", endDate);
  const { data: allJobs } = await statusQuery;

  const statusCounts: Record<string, number> = {};
  (allJobs || []).forEach((j) => {
    const s = j.status ?? "unknown";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const jobsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  return NextResponse.json({
    totalRevenue,
    jobsCompleted,
    avgRevenuePerJob: Math.round(avgRevenuePerJob * 100) / 100,
    activeCustomers: activeCustomers || 0,
    revenueByCustomer,
    jobsByStatus,
  });
}
