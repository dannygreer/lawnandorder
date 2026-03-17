export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/twilio";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json().catch(() => ({}));

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  const { data: customer, error } = await supabase
    .from("customers")
    .update({
      payment_setup_token: token,
      payment_setup_expires_at: expiresAt,
      payment_confirmed_at: null, // reset if regenerating
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const paymentUrl = `${appUrl}/pay/${token}`;

  // Optionally send SMS
  if (body.sendSms && customer.phone) {
    const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "Lawn & Order";
    const smsBody = `Hi ${customer.first_name}! This is ${businessName}. Here's your secure payment setup link for lawn care services:\n${paymentUrl}\n\nYour service cost is $${customer.service_cost} per visit. Takes 2 minutes to set up. Thanks!`;

    const result = await sendSMS(customer.phone, smsBody);

    // Log communication
    await supabase.from("communications").insert({
      customer_id: id,
      type: "payment_link",
      direction: "outbound",
      content: smsBody,
      status: result.success ? "sent" : "failed",
      provider_message_id: result.success ? result.sid : null,
    });
  }

  return NextResponse.json({ url: paymentUrl, token });
}
