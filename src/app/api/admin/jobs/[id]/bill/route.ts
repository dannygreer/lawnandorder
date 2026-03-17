export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { sendSMS } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch job + customer
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*, customers(*)")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const customer = job.customers as any;
  if (!customer?.stripe_customer_id || !customer?.stripe_payment_method_id) {
    return NextResponse.json(
      { error: "No payment method on file. Send payment setup link first." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const amount = body.amount || customer.service_cost;
  const completionNotes = body.completion_notes || null;
  const photoUrl = body.photo_url || null;

  // Charge via Stripe
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "usd",
      customer: customer.stripe_customer_id,
      payment_method: customer.stripe_payment_method_id,
      confirm: true,
      off_session: true,
      description: `Lawn service - ${customer.first_name} ${customer.last_name} - ${job.scheduled_date}`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    // Update job as billed
    await supabase
      .from("jobs")
      .update({
        status: "billed",
        amount_charged: amount,
        stripe_payment_intent_id: paymentIntent.id,
        billed_at: new Date().toISOString(),
        completed_at: job.completed_at || new Date().toISOString(),
        completion_notes: completionNotes,
        completion_photo_url: photoUrl,
      })
      .eq("id", id);

    // Send SMS receipt (non-blocking)
    const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "Lawn & Order";
    const last4 = customer.stripe_payment_method_id ? "****" : "N/A";

    try {
      const smsBody = `${customer.first_name}, your lawn was just completed! Your card was charged $${amount}.\n\nThanks for your business! — ${businessName}`;
      const smsResult = await sendSMS(customer.phone, smsBody);
      await supabase.from("communications").insert({
        customer_id: customer.id,
        job_id: id,
        type: "sms",
        direction: "outbound",
        content: smsBody,
        status: smsResult.success ? "sent" : "failed",
        provider_message_id: smsResult.success ? smsResult.sid : null,
      });
    } catch (e) {
      console.error("SMS send failed:", e);
    }

    // Send email receipt (non-blocking)
    if (customer.email) {
      try {
        const emailResult = await sendEmail({
          to: customer.email,
          subject: `Lawn Service Complete - $${amount}`,
          html: `
            <h2>Your lawn service is complete!</h2>
            <p><strong>Property:</strong> ${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}</p>
            <p><strong>Total charged:</strong> $${amount}</p>
            ${completionNotes ? `<p><strong>Notes:</strong> ${completionNotes}</p>` : ""}
            <p>Thanks for your business!</p>
            <p>— ${businessName}</p>
          `,
        });
        await supabase.from("communications").insert({
          customer_id: customer.id,
          job_id: id,
          type: "email",
          direction: "outbound",
          content: `Receipt email - $${amount}`,
          status: emailResult.success ? "sent" : "failed",
          provider_message_id: emailResult.success ? emailResult.id : null,
        });
      } catch (e) {
        console.error("Email send failed:", e);
      }
    }

    return NextResponse.json({ success: true, paymentIntentId: paymentIntent.id });
  } catch (stripeError: any) {
    // Mark as completed but NOT billed
    await supabase
      .from("jobs")
      .update({
        status: "completed",
        completed_at: job.completed_at || new Date().toISOString(),
        completion_notes: completionNotes,
        completion_photo_url: photoUrl,
      })
      .eq("id", id);

    return NextResponse.json(
      { error: stripeError.message || "Payment failed" },
      { status: 402 }
    );
  }
}
