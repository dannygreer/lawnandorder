"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const STORAGE_KEY = "lawn-admin-settings";

const DEFAULT_PAYMENT_LINK_TEMPLATE =
  "Hi {{customer_name}}, this is {{business_name}}. To set up automatic payments for your lawn service, please visit: {{payment_link}} - Thanks!";

const DEFAULT_WEATHER_CANCELLATION_TEMPLATE =
  "Hi {{customer_name}}, this is {{business_name}}. Due to weather conditions, your lawn service scheduled for {{date}} has been postponed. We'll reschedule as soon as possible. Thanks for understanding!";

const DEFAULT_BILLING_RECEIPT_TEMPLATE =
  "Hi {{customer_name}}, this is {{business_name}}. Your lawn service has been completed and your card on file has been charged ${{amount}}. Thank you for your business!";

interface Settings {
  business_name: string;
  business_phone: string;
  home_base_address: string;
  partner_1_name: string;
  partner_2_name: string;
  sms_payment_link: string;
  sms_weather_cancellation: string;
  sms_billing_receipt: string;
}

const DEFAULT_SETTINGS: Settings = {
  business_name: "Lawn & Order",
  business_phone: "",
  home_base_address: "",
  partner_1_name: "",
  partner_2_name: "",
  sms_payment_link: DEFAULT_PAYMENT_LINK_TEMPLATE,
  sms_weather_cancellation: DEFAULT_WEATHER_CANCELLATION_TEMPLATE,
  sms_billing_receipt: DEFAULT_BILLING_RECEIPT_TEMPLATE,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // Ignore parse errors, use defaults
    }
    setLoaded(true);
  }, []);

  function handleChange(field: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function handleReset(field: keyof Settings) {
    setSettings((prev) => ({ ...prev, [field]: DEFAULT_SETTINGS[field] }));
  }

  if (!loaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-brand" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">
            Configure your business details and SMS templates
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-brand hover:bg-forest-light"
        >
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Details</CardTitle>
          <CardDescription>
            Your business name and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business name</Label>
            <Input
              id="business_name"
              value={settings.business_name}
              onChange={(e) => handleChange("business_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_phone">Business phone</Label>
            <Input
              id="business_phone"
              type="tel"
              placeholder="(903) 555-0100"
              value={settings.business_phone}
              onChange={(e) => handleChange("business_phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="home_base_address">Home base address</Label>
            <Input
              id="home_base_address"
              placeholder="123 Main St, Lindale, TX 75771"
              value={settings.home_base_address}
              onChange={(e) =>
                handleChange("home_base_address", e.target.value)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Partners</CardTitle>
          <CardDescription>
            Names used for the earnings split in reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partner_1_name">Partner 1 name</Label>
              <Input
                id="partner_1_name"
                placeholder="Partner 1"
                value={settings.partner_1_name}
                onChange={(e) =>
                  handleChange("partner_1_name", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner_2_name">Partner 2 name</Label>
              <Input
                id="partner_2_name"
                placeholder="Partner 2"
                value={settings.partner_2_name}
                onChange={(e) =>
                  handleChange("partner_2_name", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SMS Templates</CardTitle>
          <CardDescription>
            Customize the messages sent to customers. Use{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
              {"{{variable}}"}
            </code>{" "}
            placeholders for dynamic content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Link Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms_payment_link">
                Payment link template
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => handleReset("sms_payment_link")}
              >
                Reset to default
              </Button>
            </div>
            <Textarea
              id="sms_payment_link"
              rows={3}
              value={settings.sms_payment_link}
              onChange={(e) =>
                handleChange("sms_payment_link", e.target.value)
              }
            />
            <p className="text-xs text-gray-400">
              Variables: {"{{customer_name}}"}, {"{{business_name}}"},{" "}
              {"{{payment_link}}"}
            </p>
          </div>

          {/* Weather Cancellation Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms_weather_cancellation">
                Weather cancellation template
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => handleReset("sms_weather_cancellation")}
              >
                Reset to default
              </Button>
            </div>
            <Textarea
              id="sms_weather_cancellation"
              rows={3}
              value={settings.sms_weather_cancellation}
              onChange={(e) =>
                handleChange("sms_weather_cancellation", e.target.value)
              }
            />
            <p className="text-xs text-gray-400">
              Variables: {"{{customer_name}}"}, {"{{business_name}}"},{" "}
              {"{{date}}"}
            </p>
          </div>

          {/* Billing Receipt Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms_billing_receipt">
                Billing receipt template
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => handleReset("sms_billing_receipt")}
              >
                Reset to default
              </Button>
            </div>
            <Textarea
              id="sms_billing_receipt"
              rows={3}
              value={settings.sms_billing_receipt}
              onChange={(e) =>
                handleChange("sms_billing_receipt", e.target.value)
              }
            />
            <p className="text-xs text-gray-400">
              Variables: {"{{customer_name}}"}, {"{{business_name}}"},{" "}
              {"{{amount}}"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save */}
      <div className="flex justify-end border-t pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-brand hover:bg-forest-light"
        >
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
