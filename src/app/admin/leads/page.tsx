"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  UserCheck,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStatus =
  | "new"
  | "contacted"
  | "estimate_scheduled"
  | "estimate_done"
  | "converted"
  | "lost";

type LeadSource = "website" | "manual" | "referral";
type LotSize = "small" | "medium" | "large";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lot_size: LotSize | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  estimated_cost: number | null;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "estimate_scheduled", label: "Estimate Scheduled" },
  { value: "estimate_done", label: "Estimate Done" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  estimate_scheduled: "bg-orange-100 text-orange-700",
  estimate_done: "bg-purple-100 text-purple-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-gray-100 text-gray-500",
};

const SOURCE_COLORS: Record<LeadSource, string> = {
  website: "bg-blue-100 text-blue-700",
  manual: "bg-gray-100 text-gray-600",
  referral: "bg-purple-100 text-purple-700",
};

const LOT_SIZE_COLORS: Record<LotSize, string> = {
  small: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  large: "bg-orange-100 text-orange-700",
};

type FilterTab = "all" | LeadStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "estimate_scheduled", label: "Estimate Scheduled" },
  { key: "estimate_done", label: "Estimate Done" },
  { key: "converted", label: "Converted" },
  { key: "lost", label: "Lost" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add Lead dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Convert dialog
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertCost, setConvertCost] = useState("");
  const [convertSendEmail, setConvertSendEmail] = useState(true);
  const [convertSendSms, setConvertSendSms] = useState(true);
  const [convertSubmitting, setConvertSubmitting] = useState(false);

  // Inline notes editing
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [editingCost, setEditingCost] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  // Status change loading
  const [statusChanging, setStatusChanging] = useState<Record<string, boolean>>(
    {}
  );

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Filtering ───────────────────────────────────────────────────────────────

  const filtered = leads
    .filter((lead) => {
      const term = search.toLowerCase();
      if (!term) return true;
      const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase();
      return (
        fullName.includes(term) ||
        (lead.address ?? "").toLowerCase().includes(term) ||
        (lead.phone ?? "").includes(term) ||
        (lead.email ?? "").toLowerCase().includes(term)
      );
    })
    .filter((lead) => {
      if (activeTab === "all") return true;
      return lead.status === activeTab;
    });

  function getTabCount(tab: FilterTab): number {
    if (tab === "all") return leads.length;
    return leads.filter((l) => l.status === tab).length;
  }

  // ── Add Lead ────────────────────────────────────────────────────────────────

  async function handleAddLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const body = {
      first_name: data.get("first_name") as string,
      last_name: data.get("last_name") as string,
      phone: (data.get("phone") as string) || null,
      email: (data.get("email") as string) || null,
      address: (data.get("address") as string) || null,
      city: (data.get("city") as string) || null,
      state: (data.get("state") as string) || null,
      zip: (data.get("zip") as string) || null,
      lot_size: (data.get("lot_size") as string) || null,
      notes: (data.get("notes") as string) || null,
      estimated_cost: data.get("estimated_cost")
        ? parseFloat(data.get("estimated_cost") as string)
        : null,
    };

    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create lead");
      toast.success("Lead added successfully");
      setAddOpen(false);
      form.reset();
      await fetchLeads();
    } catch {
      toast.error("Failed to add lead");
    } finally {
      setAddSubmitting(false);
    }
  }

  // ── Status Change ───────────────────────────────────────────────────────────

  async function handleStatusChange(lead: Lead, newStatus: LeadStatus) {
    if (newStatus === lead.status) return;
    setStatusChanging((prev) => ({ ...prev, [lead.id]: true }));

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      await fetchLeads();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusChanging((prev) => ({ ...prev, [lead.id]: false }));
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete lead");
      toast.success("Lead deleted");
      if (expandedId === id) setExpandedId(null);
      await fetchLeads();
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  // ── Save Notes & Cost ───────────────────────────────────────────────────────

  async function handleSaveNotes(lead: Lead) {
    setSavingNotes((prev) => ({ ...prev, [lead.id]: true }));

    const body: Record<string, unknown> = {};
    if (editingNotes[lead.id] !== undefined) {
      body.notes = editingNotes[lead.id] || null;
    }
    if (editingCost[lead.id] !== undefined) {
      const costVal = parseFloat(editingCost[lead.id]);
      body.estimated_cost = isNaN(costVal) ? null : costVal;
    }

    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Lead updated");
      await fetchLeads();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSavingNotes((prev) => ({ ...prev, [lead.id]: false }));
    }
  }

  // ── Convert to Customer ─────────────────────────────────────────────────────

  function openConvertDialog(lead: Lead) {
    setConvertLead(lead);
    setConvertCost(lead.estimated_cost?.toString() ?? "");
    setConvertSendEmail(!!lead.email);
    setConvertSendSms(!!lead.phone);
  }

  async function handleConvert() {
    if (!convertLead) return;
    const cost = parseFloat(convertCost);
    if (isNaN(cost) || cost <= 0) {
      toast.error("Please enter a valid estimated cost per mow");
      return;
    }

    setConvertSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/leads/${convertLead.id}/convert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estimated_cost: cost,
            send_email: convertSendEmail,
            send_sms: convertSendSms,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to convert lead");
      toast.success("Lead converted! Payment link sent.");
      setConvertLead(null);
      await fetchLeads();
    } catch {
      toast.error("Failed to convert lead to customer");
    } finally {
      setConvertSubmitting(false);
    }
  }

  // ── Row Expand Toggle ───────────────────────────────────────────────────────

  function toggleExpand(lead: Lead) {
    if (expandedId === lead.id) {
      setExpandedId(null);
    } else {
      setExpandedId(lead.id);
      // Initialize editing state with current values
      setEditingNotes((prev) => ({
        ...prev,
        [lead.id]: lead.notes ?? "",
      }));
      setEditingCost((prev) => ({
        ...prev,
        [lead.id]: lead.estimated_cost?.toString() ?? "",
      }));
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          className="bg-green-brand hover:bg-forest-light"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
        {FILTER_TABS.map((tab) => {
          const count = getTabCount(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-forest shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeTab === tab.key
                    ? "bg-green-pale text-green-brand"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, address, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table / Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <Users className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {leads.length === 0 ? "No leads yet" : "No matching leads"}
          </h3>
          <p className="mt-1 max-w-md text-center text-sm text-gray-500">
            {leads.length === 0
              ? "Leads will appear here when someone fills out the contact form on your website, or you can add them manually."
              : "Try adjusting your search or filters."}
          </p>
          {leads.length === 0 && (
            <Button
              className="mt-4 bg-green-brand hover:bg-forest-light"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Lead
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-4 w-8" />
                <TableHead className="px-4">Name</TableHead>
                <TableHead className="px-4">Contact</TableHead>
                <TableHead className="px-4">Address</TableHead>
                <TableHead className="px-4">Lot Size</TableHead>
                <TableHead className="px-4">Source</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Est. Cost</TableHead>
                <TableHead className="px-4">Date</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => {
                const isExpanded = expandedId === lead.id;
                const isConverted = lead.status === "converted";

                return (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isExpanded={isExpanded}
                    isConverted={isConverted}
                    statusChanging={!!statusChanging[lead.id]}
                    savingNotes={!!savingNotes[lead.id]}
                    editingNotes={editingNotes[lead.id] ?? lead.notes ?? ""}
                    editingCost={
                      editingCost[lead.id] ??
                      lead.estimated_cost?.toString() ??
                      ""
                    }
                    onToggleExpand={() => toggleExpand(lead)}
                    onStatusChange={(status) =>
                      handleStatusChange(lead, status)
                    }
                    onConvert={() => openConvertDialog(lead)}
                    onDelete={() => handleDelete(lead.id)}
                    onNotesChange={(val) =>
                      setEditingNotes((prev) => ({
                        ...prev,
                        [lead.id]: val,
                      }))
                    }
                    onCostChange={(val) =>
                      setEditingCost((prev) => ({
                        ...prev,
                        [lead.id]: val,
                      }))
                    }
                    onSaveNotes={() => handleSaveNotes(lead)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Add Lead Dialog ────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the lead&apos;s information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLead} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(512) 555-0123"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Austin" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue="TX"
                  placeholder="TX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" name="zip" placeholder="78701" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lot_size">Lot Size</Label>
                <select
                  id="lot_size"
                  name="lot_size"
                  className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  defaultValue=""
                >
                  <option value="">Select size...</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimated_cost">Estimated Cost</Label>
                <Input
                  id="estimated_cost"
                  name="estimated_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="$50.00"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any additional details about this lead..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-brand hover:bg-forest-light"
                disabled={addSubmitting}
              >
                {addSubmitting && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                Add Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Convert to Customer Dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!convertLead}
        onOpenChange={(open) => {
          if (!open) setConvertLead(null);
        }}
      >
        {convertLead && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Convert {convertLead.first_name} {convertLead.last_name} to
                Customer
              </DialogTitle>
              <DialogDescription>
                Review lead details and set pricing to create a customer record.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Lead summary */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {convertLead.first_name} {convertLead.last_name}
                  </span>
                </div>
                {convertLead.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {convertLead.address}
                      {convertLead.city ? `, ${convertLead.city}` : ""}
                      {convertLead.state ? ` ${convertLead.state}` : ""}
                      {convertLead.zip ? ` ${convertLead.zip}` : ""}
                    </span>
                  </div>
                )}
                {convertLead.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{convertLead.phone}</span>
                  </div>
                )}
                {convertLead.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{convertLead.email}</span>
                  </div>
                )}
              </div>

              {/* Estimated cost per mow */}
              <div className="space-y-1.5">
                <Label htmlFor="convert_cost">
                  Estimated Cost Per Mow{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    $
                  </span>
                  <Input
                    id="convert_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={convertCost}
                    onChange={(e) => setConvertCost(e.target.value)}
                    className="pl-7"
                    placeholder="50.00"
                  />
                </div>
              </div>

              {/* Communication checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={convertSendEmail}
                    onChange={(e) => setConvertSendEmail(e.target.checked)}
                    disabled={!convertLead.email}
                    className="h-4 w-4 rounded border-gray-300 text-green-brand focus:ring-green-brand"
                  />
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className={!convertLead.email ? "text-gray-400" : ""}>
                    Send welcome email
                  </span>
                  {!convertLead.email && (
                    <span className="text-xs text-gray-400">
                      (no email on file)
                    </span>
                  )}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={convertSendSms}
                    onChange={(e) => setConvertSendSms(e.target.checked)}
                    disabled={!convertLead.phone}
                    className="h-4 w-4 rounded border-gray-300 text-green-brand focus:ring-green-brand"
                  />
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className={!convertLead.phone ? "text-gray-400" : ""}>
                    Send welcome SMS
                  </span>
                  {!convertLead.phone && (
                    <span className="text-xs text-gray-400">
                      (no phone on file)
                    </span>
                  )}
                </label>
              </div>

              {/* Info text */}
              <p className="text-xs text-gray-500 leading-relaxed">
                This will create a customer record and send a payment setup link
                where they can provide credit card info, choose cash/check
                payment, and select their preferred service frequency.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConvertLead(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-brand hover:bg-forest-light"
                onClick={handleConvert}
                disabled={convertSubmitting}
              >
                {convertSubmitting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="mr-1.5 h-4 w-4" />
                )}
                Convert &amp; Send
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ─── Lead Row Component ───────────────────────────────────────────────────────

interface LeadRowProps {
  lead: Lead;
  isExpanded: boolean;
  isConverted: boolean;
  statusChanging: boolean;
  savingNotes: boolean;
  editingNotes: string;
  editingCost: string;
  onToggleExpand: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onConvert: () => void;
  onDelete: () => void;
  onNotesChange: (val: string) => void;
  onCostChange: (val: string) => void;
  onSaveNotes: () => void;
}

function LeadRow({
  lead,
  isExpanded,
  isConverted,
  statusChanging,
  savingNotes,
  editingNotes,
  editingCost,
  onToggleExpand,
  onStatusChange,
  onConvert,
  onDelete,
  onNotesChange,
  onCostChange,
  onSaveNotes,
}: LeadRowProps) {
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpand}
      >
        <TableCell className="px-4">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </TableCell>
        <TableCell className="px-4">
          <span className="font-medium text-forest">
            {lead.first_name} {lead.last_name}
          </span>
        </TableCell>
        <TableCell className="px-4">
          {lead.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <Phone className="h-3 w-3 text-gray-400" />
              {lead.phone}
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Mail className="h-3 w-3 text-gray-400" />
              {lead.email}
            </div>
          )}
          {!lead.phone && !lead.email && (
            <span className="text-xs text-gray-400">No contact info</span>
          )}
        </TableCell>
        <TableCell className="px-4 text-sm text-gray-700">
          {lead.address ? (
            <>
              {lead.address}
              {lead.city ? `, ${lead.city}` : ""}
            </>
          ) : (
            <span className="text-xs text-gray-400">Not set</span>
          )}
        </TableCell>
        <TableCell className="px-4">
          {lead.lot_size ? (
            <Badge
              variant="secondary"
              className={LOT_SIZE_COLORS[lead.lot_size]}
            >
              {lead.lot_size.charAt(0).toUpperCase() + lead.lot_size.slice(1)}
            </Badge>
          ) : (
            <span className="text-xs text-gray-400">--</span>
          )}
        </TableCell>
        <TableCell className="px-4">
          <Badge variant="secondary" className={SOURCE_COLORS[lead.source]}>
            {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
          </Badge>
        </TableCell>
        <TableCell className="px-4">
          <Badge variant="secondary" className={STATUS_COLORS[lead.status]}>
            {lead.status.replace(/_/g, " ").replace(/\b\w/g, (c) =>
              c.toUpperCase()
            )}
          </Badge>
        </TableCell>
        <TableCell className="px-4 font-semibold text-gray-900">
          {lead.estimated_cost != null ? `$${lead.estimated_cost}` : (
            <span className="text-xs font-normal text-gray-400">--</span>
          )}
        </TableCell>
        <TableCell className="px-4 text-sm text-gray-700">
          {format(new Date(lead.created_at), "MMM d, yyyy")}
        </TableCell>
        <TableCell className="px-4 text-right">
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Status dropdown */}
            <select
              value={lead.status}
              onChange={(e) =>
                onStatusChange(e.target.value as LeadStatus)
              }
              disabled={statusChanging}
              className="h-7 rounded-md border border-gray-200 bg-white px-1.5 text-xs outline-none focus:ring-2 focus:ring-green-brand/50"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Convert button */}
            <Button
              variant="ghost"
              size="xs"
              onClick={onConvert}
              disabled={isConverted}
              title={
                isConverted
                  ? "Already converted"
                  : "Convert to customer"
              }
              className={
                isConverted
                  ? "text-gray-300"
                  : "text-green-brand hover:text-forest"
              }
            >
              <UserCheck className="h-3.5 w-3.5" />
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="xs"
              onClick={onDelete}
              title="Delete lead"
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded row */}
      {isExpanded && (
        <TableRow className="bg-green-pale/30">
          <TableCell colSpan={10} className="px-8 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500">
                    Notes
                  </Label>
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Add notes about this lead..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500">
                    Estimated Cost
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingCost}
                      onChange={(e) => onCostChange(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                  {lead.address && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        {lead.address}
                        {lead.city ? `, ${lead.city}` : ""}
                        {lead.state ? ` ${lead.state}` : ""}
                        {lead.zip ? ` ${lead.zip}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="bg-green-brand hover:bg-forest-light"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveNotes();
                  }}
                  disabled={savingNotes}
                >
                  {savingNotes && (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
