export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("id, first_name, address, city, state, zip, service_cost, payment_confirmed_at, payment_setup_expires_at")
    .eq("payment_setup_token", token)
    .single();

  if (error || !customer) {
    return NextResponse.json({ error: "This link is invalid." }, { status: 404 });
  }

  if (customer.payment_confirmed_at) {
    return NextResponse.json({ error: "Your payment info is already on file. Thank you!" }, { status: 400 });
  }

  if (customer.payment_setup_expires_at && new Date(customer.payment_setup_expires_at) < new Date()) {
    return NextResponse.json(
      { error: `This link has expired. Contact ${process.env.NEXT_PUBLIC_BUSINESS_NAME || "us"} for a new one.` },
      { status: 410 }
    );
  }

  return NextResponse.json({
    firstName: customer.first_name,
    address: `${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}`,
    serviceCost: customer.service_cost,
  });
}
