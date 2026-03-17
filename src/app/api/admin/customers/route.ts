export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*, jobs(id, scheduled_date, status)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  // Geocode the address
  const coords = await geocodeAddress(body.address, body.city, body.state || "TX", body.zip);

  const { data, error } = await supabase
    .from("customers")
    .insert({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email || null,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state || "TX",
      zip: body.zip,
      service_cost: body.service_cost,
      service_frequency: body.service_frequency || null,
      service_notes: body.service_notes || null,
      is_active: body.is_active ?? true,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
