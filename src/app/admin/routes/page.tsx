"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GripVertical,
  MapPin,
  Navigation,
  Loader2,
  Save,
  RotateCcw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Job {
  id: string;
  customer_id: string;
  customer?: {
    first_name: string;
    last_name: string;
    address: string;
    lat: number | null;
    lng: number | null;
  };
  scheduled_date: string;
  status: string;
  route_order?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RoutesPage() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch jobs
  // ---------------------------------------------------------------------------

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/jobs?startDate=${selectedDate}&endDate=${selectedDate}`
      );
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data: Job[] = await res.json();
      // Sort by route_order if available
      data.sort((a, b) => (a.route_order ?? 999) - (b.route_order ?? 999));
      setJobs(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ---------------------------------------------------------------------------
  // Drag & drop reorder
  // ---------------------------------------------------------------------------

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const updated = [...jobs];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(idx, 0, moved);
    setJobs(updated);
    setDragIdx(idx);
  }

  function handleDragEnd() {
    setDragIdx(null);
  }

  // ---------------------------------------------------------------------------
  // Optimize route
  // ---------------------------------------------------------------------------

  async function optimizeRoute() {
    setOptimizing(true);
    try {
      const res = await fetch("/api/admin/routes/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          homeBase: { lat: 32.5154, lng: -95.0428 }, // Default Lindale coords
        }),
      });
      if (!res.ok) throw new Error("Failed to optimize route");
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
      toast.success("Route optimized");
    } catch {
      toast.error("Failed to optimize route");
    } finally {
      setOptimizing(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Save order
  // ---------------------------------------------------------------------------

  async function saveOrder() {
    setSaving(true);
    try {
      const orderedJobs = jobs.map((j, i) => ({ id: j.id, route_order: i + 1 }));
      const res = await fetch("/api/admin/routes/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, saveOrder: orderedJobs }),
      });
      if (!res.ok) throw new Error("Failed to save order");
      toast.success("Route order saved");
    } catch {
      toast.error("Failed to save route order");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function customerName(job: Job) {
    if (job.customer) {
      return `${job.customer.first_name} ${job.customer.last_name}`;
    }
    return "Unknown";
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Route Planner</h2>
        <p className="text-sm text-gray-500">
          Organize and optimize your daily route
        </p>
      </div>

      {/* Split view */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left panel - Job list */}
        <div className="space-y-4">
          {/* Date picker & actions */}
          <Card>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={optimizeRoute}
                  disabled={optimizing || jobs.length === 0}
                  className="bg-green-brand text-white hover:bg-forest-light"
                >
                  {optimizing ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="mr-1 h-4 w-4" />
                  )}
                  Optimize Route
                </Button>
                <Button
                  variant="outline"
                  onClick={saveOrder}
                  disabled={saving || jobs.length === 0}
                >
                  {saving ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-4 w-4" />
                  )}
                  Save Order
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-green-brand" />
              <span className="ml-2 text-sm text-gray-500">
                Loading jobs...
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchJobs}
                className="ml-2"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            </div>
          )}

          {/* Job list */}
          {!loading && !error && (
            <div className="space-y-2">
              {jobs.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
                  <MapPin className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    No jobs for{" "}
                    {format(parseISO(selectedDate), "EEEE, MMMM d")}
                  </p>
                </div>
              )}
              {jobs.map((job, idx) => (
                <div
                  key={job.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors ${
                    dragIdx === idx
                      ? "border-green-brand bg-green-pale/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="cursor-grab text-gray-400 active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-brand text-xs font-bold text-white">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {customerName(job)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {job.customer?.address ?? "No address"}
                    </p>
                    {job.customer?.lat && job.customer?.lng && (
                      <p className="text-[10px] text-gray-400">
                        {job.customer.lat.toFixed(4)},{" "}
                        {job.customer.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      job.status === "scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : job.status === "completed"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel - Map placeholder */}
        <div className="hidden lg:block">
          <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <MapPin className="h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              Map View
            </p>
            <p className="mt-1 max-w-[240px] text-center text-xs text-gray-400">
              Configure Google Maps API key to enable interactive map view with
              route visualization.
            </p>
            <div className="mt-4 rounded-lg bg-gray-100 px-3 py-2 text-xs font-mono text-gray-500">
              NEXT_PUBLIC_GOOGLE_MAPS_KEY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
