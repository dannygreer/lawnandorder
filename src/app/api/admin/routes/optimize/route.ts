export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { optimizeRoute } from "@/lib/route-optimizer";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { date, homeBase } = await req.json();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, scheduled_order, customers(id, first_name, last_name, address, lat, lng)")
    .eq("scheduled_date", date)
    .eq("status", "scheduled");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!jobs || jobs.length === 0) return NextResponse.json([]);

  const locations = jobs
    .filter((j: any) => j.customers?.lat && j.customers?.lng)
    .map((j: any) => ({
      id: j.id,
      lat: j.customers.lat,
      lng: j.customers.lng,
      name: `${j.customers.first_name} ${j.customers.last_name}`,
      address: j.customers.address,
    }));

  const optimized = optimizeRoute(locations, homeBase);

  // Save order back to DB
  for (let i = 0; i < optimized.length; i++) {
    await supabase
      .from("jobs")
      .update({ scheduled_order: i + 1 })
      .eq("id", optimized[i].id);
  }

  return NextResponse.json(optimized);
}
