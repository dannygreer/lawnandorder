"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Leaf, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CustomerInfo {
  firstName: string;
  address: string;
  serviceCost: number;
}

export default function PaymentSetupPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [frequency, setFrequency] = useState("weekly");
  const [payMethod, setPayMethod] = useState<"card" | "cash_check">("card");
  const [authorized, setAuthorized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/pay/${token}/setup`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
        } else {
          setCustomer(data);
        }
      } catch {
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorized) return;
    setSubmitting(true);

    try {
      // In production, this would use Stripe Elements to create a PaymentMethod
      // For now, show a placeholder flow
      const res = await fetch(`/api/pay/${token}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: payMethod === "card" ? "pm_placeholder" : null, // Replace with Stripe Elements for card
          frequency,
          payMethod,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const businessName =
    process.env.NEXT_PUBLIC_BUSINESS_NAME || "Lawn & Order";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-brand" />
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="mt-4">Oops</CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle className="mx-auto h-12 w-12 text-green-brand" />
            <CardTitle className="mt-4 text-forest">
              You&apos;re All Set!
            </CardTitle>
            <CardDescription className="text-base">
              Your service preferences are saved. We&apos;ll be in touch to
              schedule your first visit!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-brand">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl text-forest">{businessName}</CardTitle>
          <CardDescription>Set up your lawn care payment</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Read-only info */}
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-medium">Lawn Care & Maintenance</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Your address</span>
              <span className="font-medium text-right">
                {customer?.address}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cost per service</span>
              <span className="text-lg font-bold text-forest">
                ${customer?.serviceCost}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Frequency selection */}
            <div>
              <Label className="text-sm font-semibold">
                Service Frequency
              </Label>
              <div className="mt-3 space-y-2">
                {[
                  { value: "weekly", label: "Weekly" },
                  { value: "biweekly", label: "Bi-weekly (every other week)" },
                  { value: "monthly", label: "Monthly" },
                  { value: "on_demand", label: "On Demand (call to schedule)" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      frequency === opt.value
                        ? "border-green-brand bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={opt.value}
                      checked={frequency === opt.value}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="accent-green-brand"
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment method selection */}
            <div>
              <Label className="text-sm font-semibold">
                Payment Method
              </Label>
              <div className="mt-3 space-y-2">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    payMethod === "card"
                      ? "border-green-brand bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    value="card"
                    checked={payMethod === "card"}
                    onChange={() => setPayMethod("card")}
                    className="accent-green-brand"
                  />
                  <span className="text-sm font-medium">
                    Credit / Debit Card
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    payMethod === "cash_check"
                      ? "border-green-brand bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    value="cash_check"
                    checked={payMethod === "cash_check"}
                    onChange={() => setPayMethod("cash_check")}
                    className="accent-green-brand"
                  />
                  <span className="text-sm font-medium">
                    Cash or Check (pay after each service)
                  </span>
                </label>
              </div>
            </div>

            {/* Stripe Elements placeholder — only show for card */}
            {payMethod === "card" && (
              <div>
                <Label className="text-sm font-semibold">Card Details</Label>
                <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-center text-sm text-gray-400">
                    Stripe card input will appear here once API keys are
                    configured.
                  </p>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="rounded-lg bg-green-50 p-3 text-xs text-gray-600">
              <p className="font-semibold text-forest">
                Your information is safe
              </p>
              <p className="mt-1">
                Your credit card information is not stored or shared by{" "}
                {businessName}. No charge will be made until a service is
                completed. You will receive a receipt after each successful yard
                service.
              </p>
            </div>

            {/* Authorization */}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
                className="mt-0.5 accent-green-brand"
              />
              <span className="text-xs text-gray-600">
                {payMethod === "card"
                  ? `I authorize ${businessName} to charge my card after each completed lawn service at the rate of $${customer?.serviceCost} per visit.`
                  : `I agree to pay ${businessName} by cash or check after each completed lawn service at the rate of $${customer?.serviceCost} per visit.`}
              </span>
            </label>

            <Button
              type="submit"
              className="w-full bg-green-brand hover:bg-forest-light"
              disabled={!authorized || submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {payMethod === "card" ? "Save Payment Info" : "Confirm Service Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
