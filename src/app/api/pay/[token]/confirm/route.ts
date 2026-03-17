export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { paymentMethodId, frequency, payMethod } = await req.json();

  // Validate token
  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("payment_setup_token", token)
    .single();

  if (error || !customer) {
    return NextResponse.json({ error: "Invalid link." }, { status: 404 });
  }

  if (customer.payment_confirmed_at) {
    return NextResponse.json({ error: "Already confirmed." }, { status: 400 });
  }

  if (customer.payment_setup_expires_at && new Date(customer.payment_setup_expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expired." }, { status: 410 });
  }

  try {
    const updateData: Record<string, any> = {
      service_frequency: frequency,
      payment_confirmed_at: new Date().toISOString(),
    };

    // Only set up Stripe if paying by card
    if (payMethod === "card" && paymentMethodId && paymentMethodId !== "pm_placeholder") {
      let stripeCustomerId = customer.stripe_customer_id;
      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          name: `${customer.first_name} ${customer.last_name}`,
          phone: customer.phone,
          email: customer.email || undefined,
          metadata: { supabase_id: customer.id },
        });
        stripeCustomerId = stripeCustomer.id;
      }

      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      updateData.stripe_customer_id = stripeCustomerId;
      updateData.stripe_payment_method_id = paymentMethodId;
    }

    // Update customer record
    await supabase
      .from("customers")
      .update(updateData)
      .eq("id", customer.id);

    // Log communication
    const method = payMethod === "card" ? "Credit card saved" : "Cash/check selected";
    await supabase.from("communications").insert({
      customer_id: customer.id,
      type: "payment_link",
      direction: "outbound",
      content: `Service preferences confirmed: ${frequency}, ${method}`,
      status: "sent",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
