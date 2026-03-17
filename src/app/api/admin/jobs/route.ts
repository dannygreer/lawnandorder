export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const status = searchParams.get("status");

  let query = supabase
    .from("jobs")
    .select("*, customers(id, first_name, last_name, address, city, phone, service_cost, service_notes, lat, lng, stripe_payment_method_id)")
    .order("scheduled_date", { ascending: true })
    .order("scheduled_order", { ascending: true });

  if (startDate) query = query.gte("scheduled_date", startDate);
  if (endDate) query = query.lte("scheduled_date", endDate);
  if (status) query = query.eq("status", status as any);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      customer_id: body.customer_id,
      scheduled_date: body.scheduled_date,
      scheduled_order: body.scheduled_order || null,
      status: body.status || "scheduled",
      is_recurring: body.is_recurring || false,
      recurrence_source_id: body.recurrence_source_id || null,
    })
    .select("*, customers(id, first_name, last_name, address)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
