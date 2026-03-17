export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const body = await req.json();

  // Split full name into first/last
  const nameParts = (body.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const { data, error } = await supabase
    .from("leads" as any)
    .insert({
      first_name: firstName,
      last_name: lastName,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      lot_size: body.lotSize || null,
      source: "website",
      status: "new",
    })
    .select()
    .single();

  if (error) {
    console.error("Lead insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: (data as any).id }, { status: 201 });
}
