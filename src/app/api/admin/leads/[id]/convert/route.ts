export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";
import { geocodeAddress } from "@/lib/geocode";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json();
  const estimatedCost = body.estimated_cost;

  // Fetch the lead
  const { data: lead, error: leadError }: { data: any; error: any } = await supabase
    .from("leads" as any)
    .select("*")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Geocode address if available
  let lat = null;
  let lng = null;
  if (lead.address && lead.city && lead.zip) {
    const coords = await geocodeAddress(lead.address, lead.city, lead.state || "TX", lead.zip);
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  // Generate payment setup token
  const paymentToken = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Create customer record
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email || null,
      phone: lead.phone || "",
      address: lead.address || "",
      city: lead.city || "Lindale",
      state: lead.state || "TX",
      zip: lead.zip || "",
      service_cost: estimatedCost,
      service_notes: lead.notes || null,
      is_active: true,
      lat,
      lng,
      payment_setup_token: paymentToken,
      payment_setup_expires_at: expiresAt,
    })
    .select()
    .single();

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  // Mark lead as converted
  await supabase
    .from("leads" as any)
    .update({
      status: "converted",
      converted_customer_id: customer.id,
      converted_at: new Date().toISOString(),
      estimated_cost: estimatedCost,
    })
    .eq("id", id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";
  const paymentUrl = `${appUrl}/pay/${paymentToken}`;
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "Lawn & Order";

  // Send SMS if phone available
  if (lead.phone) {
    try {
      const smsBody = `Hi ${lead.first_name}! Welcome to ${businessName}! Here's your secure setup link to choose your service preferences:\n${paymentUrl}\n\nYour estimated cost is $${estimatedCost} per visit. Takes 2 minutes to set up. Thanks!`;
      const smsResult = await sendSMS(lead.phone, smsBody);
      await supabase.from("communications").insert({
        customer_id: customer.id,
        type: "sms",
        direction: "outbound",
        content: smsBody,
        status: smsResult.success ? "sent" : "failed",
        provider_message_id: smsResult.success ? smsResult.sid : null,
      });
    } catch (e) {
      console.error("SMS failed:", e);
    }
  }

  // Send email if available
  if (lead.email) {
    try {
      const emailResult = await sendEmail({
        to: lead.email,
        subject: `Welcome to ${businessName} - Set Up Your Service`,
        html: `
          <h2>Welcome to ${businessName}!</h2>
          <p>Hi ${lead.first_name},</p>
          <p>Thanks for choosing us for your lawn care! Please use the link below to set up your service preferences:</p>
          <p><a href="${paymentUrl}" style="display:inline-block;padding:12px 24px;background-color:#2d6a2e;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Set Up My Service</a></p>
          <p>Your estimated cost per visit: <strong>$${estimatedCost}</strong></p>
          <p>On this page you can:</p>
          <ul>
            <li>Provide a credit card for automatic billing after each service</li>
            <li>Choose to pay by cash or check instead</li>
            <li>Select your preferred service frequency</li>
          </ul>
          <p><em>Your credit card information is not stored or shared by our company. No charge will be made until a service is completed.</em></p>
          <p>Thanks for supporting local!<br/>— ${businessName}</p>
        `,
      });
      await supabase.from("communications").insert({
        customer_id: customer.id,
        type: "email",
        direction: "outbound",
        content: "Welcome + payment setup email",
        status: emailResult.success ? "sent" : "failed",
        provider_message_id: emailResult.success ? emailResult.id : null,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  return NextResponse.json({
    success: true,
    customerId: customer.id,
    paymentUrl,
  });
}
