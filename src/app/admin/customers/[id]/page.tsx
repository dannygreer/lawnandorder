"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Send,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  CreditCard,
  FileText,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Communication {
  id: string;
  type: string;
  direction: string;
  content: string;
  status: string;
  created_at: string;
}

interface Job {
  id: string;
  scheduled_date: string;
  status: string;
  amount: number | null;
  notes: string | null;
  communications: Communication[];
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  service_cost: number;
  service_frequency: string | null;
  service_notes: string | null;
  is_active: boolean;
  payment_confirmed_at: string | null;
  payment_setup_token: string | null;
  payment_setup_expires_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  jobs: Job[];
}

const jobStatusStyles: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-600",
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingLink, setSendingLink] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  async function fetchCustomer() {
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      if (!res.ok) throw new Error("Customer not found");
      const data = await res.json();
      setCustomer(data);
    } catch {
      toast.error("Failed to load customer");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPaymentLink() {
    if (!customer) return;
    setSendingLink(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}/payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendSms: true }),
      });
      if (!res.ok) throw new Error("Failed to send payment link");
      const data = await res.json();
      toast.success("Payment link sent via SMS");
      fetchCustomer();
    } catch {
      toast.error("Failed to send payment link");
    } finally {
      setSendingLink(false);
    }
  }

  function getPaymentStatus() {
    if (!customer) return "not_sent";
    if (customer.payment_confirmed_at || customer.stripe_customer_id) return "card_on_file";
    if (customer.payment_setup_token) return "awaiting_setup";
    return "not_sent";
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-brand" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Customer not found.</p>
        <Link href="/admin/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const paymentStatus = getPaymentStatus();
  const fullName = `${customer.first_name} ${customer.last_name}`;
  const fullAddress = `${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}`;

  const sortedJobs = [...(customer.jobs || [])].sort(
    (a, b) => b.scheduled_date.localeCompare(a.scheduled_date)
  );

  const billedJobs = sortedJobs.filter(
    (j) => j.status === "completed" && j.amount != null
  );

  const allComms = sortedJobs
    .flatMap((j) => j.communications || [])
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const nextJob = sortedJobs
    .filter(
      (j) =>
        j.scheduled_date >= new Date().toISOString() && j.status !== "cancelled"
    )
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))[0];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/admin/customers">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Customers
        </Button>
      </Link>

      {/* Header Card */}
      <Card>
        <CardContent className="pt-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                {customer.is_active ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                    Inactive
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {fullAddress}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {customer.email}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <DollarSign className="h-4 w-4 text-green-brand" />
                  ${customer.service_cost}/visit
                </span>
                {customer.service_frequency && (
                  <Badge variant="secondary" className="bg-green-pale text-green-brand">
                    {customer.service_frequency}
                  </Badge>
                )}
                {paymentStatus === "card_on_file" && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CreditCard className="mr-1 h-3 w-3" />
                    Card on file
                  </Badge>
                )}
                {paymentStatus === "awaiting_setup" && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    Awaiting setup
                  </Badge>
                )}
                {paymentStatus === "not_sent" && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                    No payment method
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {paymentStatus !== "card_on_file" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendPaymentLink}
                  disabled={sendingLink}
                >
                  {sendingLink ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Send Payment Link
                </Button>
              )}
              <Link href={`/admin/customers/${id}/edit`}>
                <Button size="sm" className="bg-green-brand hover:bg-forest-light">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Job History</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-green-brand" />
                  Service Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.service_notes ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {customer.service_notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No service notes.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-green-brand" />
                  Next Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nextJob ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(nextJob.scheduled_date), "EEEE, MMMM d, yyyy")}
                    </p>
                    <Badge
                      className={
                        jobStatusStyles[nextJob.status] || "bg-gray-100 text-gray-600"
                      }
                    >
                      {nextJob.status.replace("_", " ")}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No upcoming jobs scheduled.</p>
                )}
              </CardContent>
            </Card>

            {/* Payment section */}
            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-green-brand" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentStatus === "card_on_file" ? (
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Card on file
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Payment method confirmed
                      {customer.payment_confirmed_at &&
                        ` on ${format(new Date(customer.payment_confirmed_at), "MMM d, yyyy")}`}
                    </p>
                  </div>
                ) : paymentStatus === "awaiting_setup" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        Awaiting setup
                      </Badge>
                      <p className="text-sm text-gray-600">
                        Payment link sent, waiting for customer to complete setup.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendPaymentLink}
                      disabled={sendingLink}
                    >
                      {sendingLink ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Resend Payment Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      No payment method on file. Send a payment link to set up automatic billing.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendPaymentLink}
                      disabled={sendingLink}
                    >
                      {sendingLink ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Send Payment Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job History Tab */}
        <TabsContent value="jobs">
          <div className="pt-4">
            {sortedJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <Calendar className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">No jobs recorded yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="px-4">Date</TableHead>
                      <TableHead className="px-4">Status</TableHead>
                      <TableHead className="px-4">Amount</TableHead>
                      <TableHead className="px-4">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="px-4 font-medium text-gray-900">
                          {format(new Date(job.scheduled_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge
                            className={
                              jobStatusStyles[job.status] || "bg-gray-100 text-gray-600"
                            }
                          >
                            {job.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 text-gray-700">
                          {job.amount != null ? `$${job.amount}` : "-"}
                        </TableCell>
                        <TableCell className="px-4 text-gray-500 max-w-xs truncate">
                          {job.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="pt-4">
            {billedJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <DollarSign className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">No billing records yet.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-4 rounded-lg bg-green-pale px-4 py-3">
                  <p className="text-sm text-green-brand">
                    <span className="font-semibold">Total billed:</span>{" "}
                    ${billedJobs.reduce((sum, j) => sum + (j.amount || 0), 0).toFixed(2)}{" "}
                    across {billedJobs.length} completed job{billedJobs.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-4">Date</TableHead>
                        <TableHead className="px-4">Amount</TableHead>
                        <TableHead className="px-4">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billedJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="px-4 font-medium text-gray-900">
                            {format(new Date(job.scheduled_date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="px-4 font-semibold text-gray-900">
                            ${job.amount}
                          </TableCell>
                          <TableCell className="px-4">
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications">
          <div className="pt-4">
            {allComms.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <MessageSquare className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">
                    No communications recorded yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {allComms.map((comm) => (
                  <Card key={comm.id} size="sm">
                    <CardContent>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                comm.direction === "outbound"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                              }
                            >
                              {comm.direction === "outbound" ? "Sent" : "Received"}
                            </Badge>
                            <Badge variant="outline">
                              {comm.type.replace("_", " ")}
                            </Badge>
                            <Badge
                              className={
                                comm.status === "sent" || comm.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : comm.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }
                            >
                              {comm.status}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                            {comm.content}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-gray-400">
                          {format(new Date(comm.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
