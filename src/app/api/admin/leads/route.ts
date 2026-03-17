export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads" as any)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("leads" as any)
    .insert({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || "TX",
      zip: body.zip || null,
      lot_size: body.lot_size || null,
      source: body.source || "manual",
      status: body.status || "new",
      notes: body.notes || null,
      estimated_cost: body.estimated_cost || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
