export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRecurringDates } from "@/lib/recurring";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { customerIds, startDate, endDate } = await req.json();

  let created = 0;
  let skipped = 0;

  for (const customerId of customerIds) {
    // Fetch customer frequency
    const { data: customer } = await supabase
      .from("customers")
      .select("service_frequency")
      .eq("id", customerId)
      .single();

    const frequency = customer?.service_frequency || "weekly";

    // Get existing job dates for this customer in range
    const { data: existingJobs } = await supabase
      .from("jobs")
      .select("scheduled_date")
      .eq("customer_id", customerId)
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate);

    const existingDates = (existingJobs || []).map(
      (j) => new Date(j.scheduled_date)
    );

    const dates = generateRecurringDates(
      new Date(startDate),
      new Date(endDate),
      frequency as "weekly" | "biweekly" | "monthly",
      existingDates
    );

    if (dates.length > 0) {
      const jobs = dates.map((d) => ({
        customer_id: customerId,
        scheduled_date: d.toISOString().split("T")[0],
        is_recurring: true,
        status: "scheduled" as const,
      }));

      const { error } = await supabase.from("jobs").insert(jobs);
      if (!error) {
        created += dates.length;
      }
    }
  }

  return NextResponse.json({ created, skipped });
}
