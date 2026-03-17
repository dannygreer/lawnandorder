"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  XCircle,
  Check,
  CalendarDays,
  Loader2,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isSameDay,
  parseISO,
  isToday,
  eachDayOfInterval,
} from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Job {
  id: string;
  customer_id: string;
  customer?: { first_name: string; last_name: string; address: string };
  scheduled_date: string;
  status: "scheduled" | "completed" | "billed" | "cancelled";
  cancel_reason?: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-amber-100 text-amber-700 border-amber-200",
  billed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

function weekLabel(date: Date) {
  return `Week of ${format(date, "MMMM d, yyyy")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SchedulePage() {
  // Week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  // Mobile single-day view
  const [mobileDay, setMobileDay] = useState(new Date());

  // Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [generateOpen, setGenerateOpen] = useState(false);
  const [cancelDayOpen, setCancelDayOpen] = useState(false);
  const [cancelDayDate, setCancelDayDate] = useState<Date | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Reschedule
  const [rescheduleJobId, setRescheduleJobId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");

  // Cancel single job
  const [cancelJobId, setCancelJobId] = useState<string | null>(null);
  const [cancelJobReason, setCancelJobReason] = useState("");

  // Generate schedule state
  const [genStart, setGenStart] = useState(format(new Date(), "yyyy-MM-dd"));
  const [genEnd, setGenEnd] = useState(
    format(addDays(new Date(), 6), "yyyy-MM-dd")
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(
    new Set()
  );
  const [genLoading, setGenLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch jobs
  // ---------------------------------------------------------------------------

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sd = format(currentWeekStart, "yyyy-MM-dd");
      const we = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const ed = format(we, "yyyy-MM-dd");
      const res = await fetch(
        `/api/admin/jobs?startDate=${sd}&endDate=${ed}`
      );
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ---------------------------------------------------------------------------
  // Job actions
  // ---------------------------------------------------------------------------

  async function completeJob(id: string) {
    try {
      const res = await fetch(`/api/admin/jobs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed" }),
      });
      if (!res.ok) throw new Error("Failed to complete job");
      toast.success("Job marked as completed");
      fetchJobs();
    } catch {
      toast.error("Failed to complete job");
    }
  }

  async function rescheduleJob() {
    if (!rescheduleJobId || !rescheduleDate) return;
    try {
      const res = await fetch(`/api/admin/jobs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleJobId,
          scheduled_date: rescheduleDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to reschedule");
      toast.success("Job rescheduled");
      setRescheduleJobId(null);
      setRescheduleDate("");
      fetchJobs();
    } catch {
      toast.error("Failed to reschedule job");
    }
  }

  async function cancelJob() {
    if (!cancelJobId) return;
    try {
      const res = await fetch(`/api/admin/jobs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cancelJobId,
          status: "cancelled",
          cancel_reason: cancelJobReason,
        }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      toast.success("Job cancelled");
      setCancelJobId(null);
      setCancelJobReason("");
      fetchJobs();
    } catch {
      toast.error("Failed to cancel job");
    }
  }

  async function cancelAllDay() {
    if (!cancelDayDate) return;
    const dayJobs = jobsForDay(cancelDayDate);
    try {
      await Promise.all(
        dayJobs
          .filter((j) => j.status === "scheduled")
          .map((j) =>
            fetch(`/api/admin/jobs`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: j.id,
                status: "cancelled",
                cancel_reason: cancelReason,
              }),
            })
          )
      );
      toast.success("All jobs for the day cancelled");
      setCancelDayOpen(false);
      setCancelReason("");
      setCancelDayDate(null);
      fetchJobs();
    } catch {
      toast.error("Failed to cancel day");
    }
  }

  // ---------------------------------------------------------------------------
  // Generate schedule
  // ---------------------------------------------------------------------------

  async function fetchCustomers() {
    setCustomersLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      const active = (data as Customer[]).filter((c) => c.is_active);
      setCustomers(active);
      setSelectedCustomerIds(new Set(active.map((c) => c.id)));
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setCustomersLoading(false);
    }
  }

  function handleOpenGenerate() {
    setGenerateOpen(true);
    fetchCustomers();
  }

  async function generateSchedule() {
    setGenLoading(true);
    try {
      const res = await fetch("/api/admin/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: genStart,
          endDate: genEnd,
          customerIds: Array.from(selectedCustomerIds),
        }),
      });
      if (!res.ok) throw new Error("Failed to generate schedule");
      const data = await res.json();
      toast.success(`Generated ${data.created ?? 0} jobs (${data.skipped ?? 0} skipped)`);
      setGenerateOpen(false);
      fetchJobs();
    } catch {
      toast.error("Failed to generate schedule");
    } finally {
      setGenLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function jobsForDay(day: Date) {
    return jobs.filter((j) => {
      const jd = parseISO(j.scheduled_date);
      return isSameDay(jd, day);
    });
  }

  function customerName(job: Job) {
    if (job.customer) {
      return `${job.customer.first_name} ${job.customer.last_name}`;
    }
    return "Unknown";
  }

  function customerAddress(job: Job) {
    return job.customer?.address?.split(",")[0] ?? "";
  }

  function toggleCustomer(id: string) {
    setSelectedCustomerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
          <p className="text-sm text-gray-500">
            View and manage your weekly mowing schedule
          </p>
        </div>
        <Button
          onClick={handleOpenGenerate}
          className="bg-green-brand text-white hover:bg-forest-light"
        >
          <Plus className="mr-1 h-4 w-4" />
          Generate Schedule
        </Button>
      </div>

      {/* Week navigation - desktop */}
      <div className="hidden items-center justify-center gap-4 md:flex">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentWeekStart((w) => subWeeks(w, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[260px] text-center text-sm font-semibold text-gray-900">
          {weekLabel(currentWeekStart)}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentWeekStart((w) => addWeeks(w, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile day navigation */}
      <div className="flex items-center justify-center gap-4 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileDay((d) => addDays(d, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[200px] text-center text-sm font-semibold text-gray-900">
          {format(mobileDay, "EEEE, MMMM d")}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileDay((d) => addDays(d, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-green-brand" />
          <span className="ml-2 text-sm text-gray-500">
            Loading schedule...
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Desktop 7-day grid */}
      {!loading && !error && (
        <div className="hidden gap-3 md:grid md:grid-cols-7">
          {weekDays.map((day) => {
            const dayJobs = jobsForDay(day);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`rounded-xl border ${
                  today
                    ? "border-green-brand bg-green-pale/40"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Day header */}
                <div
                  className={`flex items-center justify-between border-b px-3 py-2 ${
                    today ? "border-green-brand/20" : "border-gray-100"
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      {format(day, "EEE")}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        today ? "text-green-brand" : "text-gray-900"
                      }`}
                    >
                      {format(day, "d")}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCancelDayDate(day);
                      setCancelDayOpen(true);
                    }}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Cancel all jobs this day"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>

                {/* Jobs */}
                <div className="space-y-2 p-2">
                  {dayJobs.length === 0 && (
                    <p className="py-4 text-center text-xs text-gray-400">
                      No jobs
                    </p>
                  )}
                  {dayJobs.map((job) => (
                    <Card key={job.id} size="sm" className="gap-1 py-2">
                      <CardContent className="space-y-1 px-2">
                        <p className="text-xs font-semibold text-gray-900 leading-tight">
                          {customerName(job)}
                        </p>
                        <p className="text-[10px] text-gray-500 leading-tight truncate">
                          {customerAddress(job)}
                        </p>
                        <Badge
                          className={`mt-1 text-[10px] ${statusColors[job.status]}`}
                        >
                          {job.status}
                        </Badge>
                        {job.status === "scheduled" && (
                          <div className="flex gap-1 pt-1">
                            <button
                              onClick={() => completeJob(job.id)}
                              className="rounded bg-green-50 p-1 text-green-700 hover:bg-green-100"
                              title="Complete"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => {
                                setRescheduleJobId(job.id);
                                setRescheduleDate(job.scheduled_date);
                              }}
                              className="rounded bg-blue-50 p-1 text-blue-700 hover:bg-blue-100"
                              title="Reschedule"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setCancelJobId(job.id)}
                              className="rounded bg-red-50 p-1 text-red-700 hover:bg-red-100"
                              title="Cancel"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile single day */}
      {!loading && !error && (
        <div className="space-y-3 md:hidden">
          {jobsForDay(mobileDay).length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              No jobs scheduled for this day.
            </p>
          )}
          {jobsForDay(mobileDay).map((job) => (
            <Card key={job.id}>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {customerName(job)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customerAddress(job)}
                    </p>
                  </div>
                  <Badge className={statusColors[job.status]}>
                    {job.status}
                  </Badge>
                </div>
                {job.status === "scheduled" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-green-brand text-white hover:bg-forest-light"
                      onClick={() => completeJob(job.id)}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRescheduleJobId(job.id);
                        setRescheduleDate(job.scheduled_date);
                      }}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setCancelJobId(job.id)}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---- Dialogs ---- */}

      {/* Generate Schedule Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Schedule</DialogTitle>
            <DialogDescription>
              Create jobs for active customers within a date range.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={genStart}
                  onChange={(e) => setGenStart(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  End Date
                </label>
                <Input
                  type="date"
                  value={genEnd}
                  onChange={(e) => setGenEnd(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">
                  Customers to include
                </label>
                <span className="text-xs text-gray-500">
                  {selectedCustomerIds.size} of {customers.length} selected
                </span>
              </div>
              {customersLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
                  {customers.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.has(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                        className="h-4 w-4 rounded border-gray-300 text-green-brand focus:ring-green-brand"
                      />
                      <span className="text-gray-900">
                        {c.first_name} {c.last_name}
                      </span>
                      <span className="ml-auto text-xs text-gray-400 truncate max-w-[140px]">
                        {c.address}
                      </span>
                    </label>
                  ))}
                  {customers.length === 0 && (
                    <p className="py-4 text-center text-xs text-gray-400">
                      No active customers found.
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              <CalendarDays className="mr-1 inline h-3 w-3" />
              Will create up to{" "}
              <strong>{selectedCustomerIds.size}</strong> jobs per scheduled day
              in the selected range.
            </p>
          </div>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
            >
              Cancel
            </DialogClose>
            <Button
              onClick={generateSchedule}
              disabled={genLoading || selectedCustomerIds.size === 0}
              className="bg-green-brand text-white hover:bg-forest-light"
            >
              {genLoading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Day Dialog */}
      <Dialog open={cancelDayOpen} onOpenChange={setCancelDayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Day</DialogTitle>
            <DialogDescription>
              {cancelDayDate &&
                `Cancel all scheduled jobs for ${format(cancelDayDate, "EEEE, MMMM d")}.`}
            </DialogDescription>
          </DialogHeader>

          {cancelDayDate && (
            <div className="space-y-3">
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {jobsForDay(cancelDayDate)
                  .filter((j) => j.status === "scheduled")
                  .map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
                    >
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span className="text-gray-900">
                        {customerName(job)}
                      </span>
                    </div>
                  ))}
                {jobsForDay(cancelDayDate).filter(
                  (j) => j.status === "scheduled"
                ).length === 0 && (
                  <p className="py-4 text-center text-xs text-gray-400">
                    No scheduled jobs to cancel.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Reason for cancellation
                </label>
                <Input
                  placeholder="e.g. Weather - heavy rain"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Keep Jobs
            </DialogClose>
            <Button
              variant="destructive"
              onClick={cancelAllDay}
              disabled={
                !cancelDayDate ||
                jobsForDay(cancelDayDate).filter(
                  (j) => j.status === "scheduled"
                ).length === 0
              }
            >
              Cancel All Jobs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={!!rescheduleJobId}
        onOpenChange={(open) => {
          if (!open) {
            setRescheduleJobId(null);
            setRescheduleDate("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reschedule Job</DialogTitle>
            <DialogDescription>Pick a new date for this job.</DialogDescription>
          </DialogHeader>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              New Date
            </label>
            <Input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={rescheduleJob}
              disabled={!rescheduleDate}
              className="bg-green-brand text-white hover:bg-forest-light"
            >
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Single Job Dialog */}
      <Dialog
        open={!!cancelJobId}
        onOpenChange={(open) => {
          if (!open) {
            setCancelJobId(null);
            setCancelJobReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Job</DialogTitle>
            <DialogDescription>
              This will mark the job as cancelled.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Reason (optional)
            </label>
            <Input
              placeholder="e.g. Customer request"
              value={cancelJobReason}
              onChange={(e) => setCancelJobReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Keep Job
            </DialogClose>
            <Button variant="destructive" onClick={cancelJob}>
              Cancel Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
