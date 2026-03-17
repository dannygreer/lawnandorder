export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*, jobs(*, communications(*))")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json();

  // Re-geocode if address changed
  if (body.address || body.city || body.zip) {
    const { data: existing } = await supabase.from("customers").select("address, city, state, zip").eq("id", id).single();
    if (existing) {
      const addr = body.address || existing.address;
      const city = body.city || existing.city;
      const state = body.state || existing.state;
      const zip = body.zip || existing.zip;
      const coords = await geocodeAddress(addr, city, state, zip);
      if (coords) {
        body.lat = coords.lat;
        body.lng = coords.lng;
      }
    }
  }

  const { data, error } = await supabase
    .from("customers")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
