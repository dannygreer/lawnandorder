# Lawn Care Admin Portal — Claude Code Build Spec

## Project Overview

A full-stack admin portal for a two-person high school lawn care business. Owners log in at `/admin` to manage customers, schedule jobs, optimize routes, process billing, and view reports. Customers receive a unique tokenized link to enter their card info and choose their service frequency. No customer account or login is required.

This portal lives alongside an existing marketing site. The admin portal is the operational backbone of the business.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14** (App Router) | `/admin` route group, server components where possible |
| Database | **Supabase** (Postgres) | Auth, DB, Storage, Row Level Security |
| Auth | **Supabase Auth** | Email/password, owners only |
| Payments | **Stripe** | Payment Intents, Customer + PaymentMethod storage, charges |
| SMS | **Twilio** | Receipt SMS after billing |
| Email | **Resend** | Receipt email after billing |
| Maps | **Google Maps JS API** | Geocoding, Distance Matrix, route display |
| File Storage | **Supabase Storage** | Job completion photos |
| Styling | **Tailwind CSS** | Utility-first, consistent design system |
| Components | **shadcn/ui** | Built on Radix, accessible, customizable |
| Forms | **React Hook Form + Zod** | Validation throughout |
| State | **Zustand** | Lightweight global state for schedule/route |
| Date handling | **date-fns** | Schedule logic, recurring job generation |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_BUSINESS_NAME=
NEXT_PUBLIC_BUSINESS_PHONE=
```

---

## Database Schema

Run these migrations in order in the Supabase SQL editor.

### `customers` table

```sql
create table customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- Contact info
  first_name text not null,
  last_name text not null,
  email text,
  phone text not null,

  -- Property address
  address text not null,
  city text not null,
  state text default 'TX',
  zip text not null,
  lat double precision,
  lng double precision,

  -- Service config
  service_cost numeric(8,2) not null,         -- set by owners, shown on payment page (read-only)
  service_frequency text check (service_frequency in ('weekly', 'biweekly', 'monthly')),
  service_notes text,                          -- property/access notes: gate codes, dogs, etc.
  is_active boolean default true,

  -- Stripe
  stripe_customer_id text,
  stripe_payment_method_id text,
  payment_setup_token text unique,             -- tokenized URL for payment link
  payment_setup_expires_at timestamptz,
  payment_confirmed_at timestamptz,

  -- Internal
  updated_at timestamptz default now()
);

-- Index for fast geo lookups
create index on customers (lat, lng);
create index on customers (is_active);
```

### `jobs` table

```sql
create table jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  customer_id uuid references customers(id) on delete cascade,
  scheduled_date date not null,
  scheduled_order integer,                     -- position within a day's route (1, 2, 3...)

  status text default 'scheduled' check (status in (
    'scheduled',    -- on the calendar
    'completed',    -- marked done by owners
    'billed',       -- charge processed
    'cancelled',    -- skipped/weather/etc.
    'rescheduled'   -- moved to another date
  )),

  -- Billing
  amount_charged numeric(8,2),
  stripe_payment_intent_id text,
  billed_at timestamptz,

  -- Completion
  completed_at timestamptz,
  completion_photo_url text,
  completion_notes text,

  -- Cancellation
  cancelled_reason text,
  rescheduled_to date,

  -- Recurrence
  is_recurring boolean default false,
  recurrence_source_id uuid references jobs(id)  -- points to the parent if auto-generated
);

create index on jobs (customer_id);
create index on jobs (scheduled_date);
create index on jobs (status);
```

### `communications` table

```sql
create table communications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  customer_id uuid references customers(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  type text check (type in ('sms', 'email', 'payment_link')),
  direction text check (direction in ('outbound')),
  content text,
  status text check (status in ('sent', 'failed')),
  provider_message_id text
);
```

### `photo_gallery` view (convenience)

```sql
create view job_photos as
  select
    j.id as job_id,
    j.scheduled_date,
    j.completion_photo_url,
    j.completion_notes,
    c.id as customer_id,
    c.first_name || ' ' || c.last_name as customer_name,
    c.address
  from jobs j
  join customers c on c.id = j.customer_id
  where j.completion_photo_url is not null
  order by j.completed_at desc;
```

### Row Level Security

```sql
-- Enable RLS on all tables
alter table customers enable row level security;
alter table jobs enable row level security;
alter table communications enable row level security;

-- Owners (authenticated users) can do everything
create policy "owners_full_access" on customers
  for all using (auth.role() = 'authenticated');

create policy "owners_full_access" on jobs
  for all using (auth.role() = 'authenticated');

create policy "owners_full_access" on communications
  for all using (auth.role() = 'authenticated');

-- Public read for payment setup page (via token, validated in API route)
-- No direct RLS — use service role key in the payment API routes only
```

---

## File Structure

```
/app
  /admin
    layout.tsx                  -- auth gate, nav shell
    page.tsx                    -- redirect to /admin/schedule
    /login
      page.tsx
    /customers
      page.tsx                  -- customer list
      /new
        page.tsx                -- add customer form
      /[id]
        page.tsx                -- customer profile
        /edit
          page.tsx
    /schedule
      page.tsx                  -- weekly calendar view
    /routes
      page.tsx                  -- map + route optimizer
    /billing
      page.tsx                  -- billing queue (completed, unbilled jobs)
    /reports
      page.tsx                  -- revenue + KPI dashboard
    /settings
      page.tsx                  -- business name, from-phone, email signature

  /pay
    /[token]
      page.tsx                  -- customer-facing payment setup page (public)

/components
  /admin
    AdminNav.tsx
    CustomerCard.tsx
    JobCard.tsx
    BillModal.tsx
    AddCustomerForm.tsx
    EditCustomerForm.tsx
    WeeklyCalendar.tsx
    RouteMap.tsx
    RevenueChart.tsx
    PaymentBadge.tsx
    WeatherCancelModal.tsx
    PhotoGallery.tsx
  /pay
    PaymentSetupForm.tsx        -- Stripe Elements, frequency selector

/lib
  supabase/
    client.ts                   -- browser client
    server.ts                   -- server client (cookies)
    middleware.ts               -- auth redirect middleware
  stripe.ts                     -- Stripe SDK instance + helpers
  twilio.ts                     -- SMS sending
  resend.ts                     -- email sending
  geocode.ts                    -- Google Maps geocoding
  route-optimizer.ts            -- distance matrix + nearest-neighbor sort
  recurring.ts                  -- generate recurring jobs for a week

/app/api
  /admin
    /customers
      route.ts                  -- GET list, POST create
    /customers/[id]
      route.ts                  -- GET, PATCH, DELETE
    /customers/[id]/payment-link
      route.ts                  -- POST: generate/regenerate token
    /jobs
      route.ts                  -- GET, POST
    /jobs/[id]
      route.ts                  -- PATCH (reschedule, cancel, complete)
    /jobs/[id]/bill
      route.ts                  -- POST: charge card, upload photo, send receipt
    /schedule/generate
      route.ts                  -- POST: generate recurring jobs for date range
    /routes/optimize
      route.ts                  -- POST: return sorted job order for a day
    /reports
      route.ts                  -- GET: aggregated revenue + KPI data
  /pay
    /[token]/setup
      route.ts                  -- GET: validate token, return customer info
    /[token]/confirm
      route.ts                  -- POST: save PaymentMethod, set frequency
  /webhooks
    /stripe
      route.ts                  -- handle payment_intent events
```

---

## Authentication & Middleware

```typescript
// middleware.ts (project root)
// Protect all /admin routes. Redirect unauthenticated users to /admin/login.
// /pay routes are always public.
// Use Supabase Auth SSR helpers.

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && !session) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/admin/schedule', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

The login page should be a clean, simple email/password form using `supabase.auth.signInWithPassword()`. No sign-up UI — owner accounts are created manually in the Supabase dashboard.

---

## Page Specifications

---

### `/admin/login`

Simple centered card with:
- Business logo / name (from env var)
- Email input
- Password input
- "Sign in" button
- Error state for invalid credentials
- No sign-up link (owners only)

---

### `/admin/customers`

**Customer List Page**

Layout: Full-width table or card list with a top toolbar.

Toolbar:
- Search input (filters by name, address, phone — client-side on loaded data)
- "Add customer" button → `/admin/customers/new`
- Filter tabs: All | Active | Awaiting payment setup | Inactive

Table columns:
- Name (link to `/admin/customers/[id]`)
- Address
- Service frequency badge (Weekly / Bi-weekly / Monthly)
- Service cost (`$XX`)
- Payment status badge: `Card on file` (green) | `Awaiting setup` (amber) | `Not sent` (gray)
- Next scheduled job date
- Actions: Edit | Bill (if completed job pending billing) | Deactivate

Empty state: Friendly prompt to add first customer.

---

### `/admin/customers/new` and `/admin/customers/[id]/edit`

**Add / Edit Customer Form**

Fields:
```
First name*          Last name*
Phone*               Email
Address*             City*
State (default TX)   ZIP*
Service cost*        (numeric, dollar amount — set by owners)
Service notes        (textarea: "Gate code 1234, dog in backyard, skip flower beds near south fence")
Active toggle        (default on)
```

On save:
1. Geocode the address via Google Maps Geocoding API → store `lat`/`lng` on customer record
2. If new customer: redirect to customer profile page
3. Show success toast

Validation (Zod):
- Phone: required, 10-digit US format
- Email: optional but must be valid if provided
- Service cost: required, positive number
- Address fields: all required

---

### `/admin/customers/[id]`

**Customer Profile Page**

Header section:
- Customer name, address, phone, email
- Service cost + frequency badge
- Payment status (with "Send payment link" or "Resend link" button)
- "Edit" button
- "Deactivate" toggle

Tabs:
1. **Overview** — service notes, property details, next job
2. **Job History** — table of all past jobs: date, status, amount, photo thumbnail (click to expand), notes
3. **Photos** — photo gallery grid of all completion photos for this customer
4. **Billing** — all charges, amounts, dates, Stripe receipt links
5. **Communications** — log of every SMS and email sent: date, type, content excerpt, status

Payment link section:
- If `stripe_payment_method_id` is null:
  - Show "Payment setup link" button
  - On click: call `POST /api/admin/customers/[id]/payment-link` → generates token, stores in DB, copies URL to clipboard, shows toast with the full URL to share
  - Also show "Send via SMS" button that sends the link directly to customer's phone
- If payment method exists: show "Card on file ✓" with last 4 digits, card brand, expiry. "Replace card" button regenerates link.

---

### `/admin/schedule`

**Weekly Calendar View**

This is the primary daily-operations screen.

Layout:
- Week navigation: `< Previous week` | `Week of [date]` | `Next week >`
- 7-day column grid (Mon–Sun), each column shows that day's jobs
- "Generate recurring jobs" button (for a selected date range — see below)
- Today is highlighted

Each job card on the calendar shows:
- Customer name
- Address (short form)
- Estimated time (derived from service type/size — simple lookup)
- Status badge: Scheduled | Completed | Billed | Cancelled
- Service notes icon (tooltip on hover showing notes)
- Action buttons:
  - **Complete** → opens BillModal (see below)
  - **Reschedule** → date picker popover, moves job
  - **Cancel** → short reason input, marks cancelled + optionally sends weather SMS to customer

**BillModal** (opened from "Complete" button):

This is the primary post-service workflow modal.

```
Modal title: "Complete Job — [Customer Name]"

1. Completion photo
   - Upload area (drag or tap to upload)
   - Preview thumbnail after selection
   - Required before submitting

2. Charge amount
   - Pre-filled with customer's service_cost
   - Read-only (amount is fixed per their estimate)
   - If this job had any add-ons discussed verbally, there's a small "+Add-on" button
     that lets owners add a line item with description + dollar amount
     (adds to base cost, clearly separated in receipt)

3. Completion note (optional)
   - Short text input: "Front and back complete. Edged driveway."

4. Confirm & Bill button
   - On click:
     a. Upload photo to Supabase Storage → get URL
     b. Create Stripe PaymentIntent and confirm against stored payment method
     c. Mark job as `billed` in DB, store payment_intent_id, amount, billed_at
     d. Send SMS receipt via Twilio
     e. Send email receipt via Resend (if email on file)
     f. Log both sends in communications table
     g. Close modal, update job card to "Billed" status

5. Error handling:
   - If charge fails: show clear error, mark job as `completed` (not billed),
     surface in billing queue with "Retry charge" option
   - If no payment method on file: show prompt to send payment setup link first
```

**Recurring job generation:**

Button "Generate schedule" opens a modal:
- Date range picker (e.g., "Generate jobs from June 1 – Aug 31")
- Checkbox list of active customers with payment on file
- Preview: shows how many jobs will be created
- Confirm: calls `POST /api/admin/schedule/generate`
  - Logic: for each selected customer, based on their `service_frequency`, create job records on the correct dates within the range
  - Skips dates that already have a job for that customer
  - Returns count of jobs created

**Weather cancellation (bulk):**

"Cancel day" button at top of any day column:
- Opens modal listing all scheduled jobs for that day
- Checkbox select (all pre-checked)
- Optional custom message override (default: "Due to weather, we're rescheduling your lawn service. We'll be in touch shortly.")
- On confirm: mark selected jobs as `cancelled` with reason "weather", send SMS to each customer's phone

---

### `/admin/routes`

**Route Planner + Map**

This screen helps optimize which jobs to group on which day to minimize drive time.

Layout: Split view — map on the right, controls/job list on the left.

Left panel:
- Date picker: "Plan routes for [date]"
- List of all jobs scheduled for that date, each showing customer name + address
- Drag handles to manually reorder jobs
- "Optimize route" button

Right panel:
- Google Maps embed showing all jobs as numbered pins (1, 2, 3...)
- Pins are color-coded: green = has payment on file, amber = no payment yet
- Clicking a pin shows customer name, address, service notes in an info window
- Route line drawn between pins in the suggested order

**Route optimization logic** (`/lib/route-optimizer.ts`):

```typescript
// Use Google Distance Matrix API to compute travel times between all job addresses
// Apply nearest-neighbor heuristic:
//   1. Start from a configurable "home base" address (set in Settings)
//   2. At each step, pick the unvisited job closest (by drive time) to current location
//   3. Return ordered list of job IDs
// This is not perfectly optimal but is fast, free-ish (within Maps API quota), and
// very good for 5–15 stops. True TSP solving is overkill for this scale.

export async function optimizeRoute(jobs: Job[], homeBase: LatLng): Promise<Job[]>
```

"Save route order" button: saves `scheduled_order` (1, 2, 3...) back to each job record. This order then displays on the schedule view.

**Neighborhood clustering view (secondary feature):**

Toggle: "Week view" — shows all jobs for the full week on the map simultaneously, color-coded by day (Mon = blue, Tue = green, etc.). Useful for planning which day to schedule new customers based on where they live relative to existing clusters.

Suggested workflow for new customers: when adding a customer, their pin appears on the week map in a neutral color so owners can see which day's existing route they're geographically closest to.

---

### `/admin/billing`

**Billing Queue**

This page surfaces jobs that need attention — completed but not yet billed, failed charges, and missing payment methods.

Three sections:

**1. Awaiting billing** (status = `completed`, no `billed_at`)
- Table: customer name, date, amount, "Bill now" button → opens BillModal
- Should be empty if owners use the BillModal from the schedule view directly

**2. Failed charges**
- Table: customer name, date, error message, "Retry" button
- Retry re-opens BillModal with error context shown

**3. Missing payment info**
- Customers with scheduled or completed jobs but no `stripe_payment_method_id`
- "Send setup link" button per row

---

### `/admin/reports`

**Revenue & KPI Dashboard**

Top metric cards (always visible):
- Total revenue (all time)
- Revenue this month
- Revenue this week
- Total lawns mowed (all time)
- Average revenue per job
- Active customers

Charts section:

**Weekly revenue bar chart**
- X axis: last 12 weeks
- Y axis: dollars
- Bars colored by week (current week highlighted)
- Hover tooltip: week of [date], $X, N jobs

**Revenue by customer (top 10)**
- Horizontal bar chart
- Customer name on Y axis, total revenue on X axis
- Useful for identifying highest-value relationships

**Jobs by status (current month)**
- Simple donut or bar: Scheduled / Completed / Billed / Cancelled

Date range filter:
- Presets: This week | This month | This season | All time | Custom range
- Applies to all charts and metric cards

Additional stats table:
- Per-customer breakdown: name, jobs completed, total billed, avg per job, last service date
- Sortable columns
- Export to CSV button (simple client-side export from the loaded data)

**Partner earnings split section:**
- Shows net revenue (gross minus estimated expenses — owners can input expense total)
- Displays each partner's 40% share
- Simple, transparent — designed to be shown to both partners at end of week

---

### `/admin/settings`

Simple settings page:

- Business name (used in SMS/email templates)
- Business phone (shown in customer communications)
- From-email display name
- Home base address (used as route optimization start point)
- Default SMS templates (editable):
  - Payment setup link message
  - Weather cancellation message
  - Billing receipt message
- Partner names (used in earnings split display)

---

## Public Page: `/pay/[token]`

**Customer Payment Setup Page**

This is the only page customers ever see. It's accessed via a unique tokenized URL sent by the owners.

URL format: `https://[domain]/pay/[uuid-token]`

**Page load behavior:**
1. Validate token against `customers.payment_setup_token`
2. If token not found: show "This link is invalid" message
3. If token expired (`payment_setup_expires_at` < now): show "This link has expired. Contact [business name] for a new one."
4. If already used (`payment_confirmed_at` is not null): show "Your payment info is already on file. Thank you!"
5. If valid: render the payment setup form

**Page design:**
- Clean, professional, mobile-first
- Business name and a brief description: "Set up your lawn care payment"
- No navigation, no links — focused single-purpose page

**Content displayed (read-only, not editable by customer):**
```
Business: [Business Name]
Service: Lawn Care & Maintenance
Your address: [customer address]
Cost per service: $[service_cost]
```

**Customer selects:**
```
Service frequency:
  ○ Weekly
  ○ Bi-weekly  (every other week)
  ○ Monthly
```

**Note:** The frequency selection is presented as a choice for the customer, but the cost per service was set by the owners and is displayed as fixed. The customer is agreeing to be charged `$[service_cost]` at the selected frequency.

**Payment section:**
- Stripe Elements card input (card number, expiry, CVC)
- "Your card will be charged after each completed service. You will receive an SMS and/or email receipt every time."
- Checkbox: "I authorize [Business Name] to charge my card above for each completed lawn service."
- "Save payment info" button

**On submit:**
1. Create Stripe PaymentMethod from card element
2. Call `POST /api/pay/[token]/confirm` with `{ paymentMethodId, frequency }`
3. Server:
   a. Validates token again
   b. Creates/retrieves Stripe Customer for this customer record
   c. Attaches PaymentMethod to Stripe Customer
   d. Stores `stripe_customer_id`, `stripe_payment_method_id`, `service_frequency` on customer record
   e. Sets `payment_confirmed_at = now()`
   f. Logs in communications table
4. Show success screen: "You're all set! We'll send you a receipt every time we complete your lawn."

**Security notes:**
- Token is a UUID v4 — not guessable
- Server validates token on every request, never trusts client-provided customer ID
- Uses `SUPABASE_SERVICE_ROLE_KEY` on server only — never exposed to client
- Stripe publishable key only on client; all charge operations server-side

---

## API Routes

### `POST /api/admin/customers/[id]/payment-link`

Generates or regenerates a payment setup token.

```typescript
// Generate a new UUID token
// Set payment_setup_expires_at = now() + 30 days
// Store on customer record
// Return { url: `${APP_URL}/pay/${token}` }
// Optionally: if body includes { sendSms: true }, trigger Twilio SMS immediately
```

### `POST /api/admin/jobs/[id]/bill`

The core billing action. Called from BillModal.

```typescript
// 1. Fetch job + customer (including stripe_customer_id, stripe_payment_method_id)
// 2. Upload photo to Supabase Storage bucket "job-photos"
//    Path: `{customer_id}/{job_id}.jpg`
// 3. Create Stripe PaymentIntent:
//    {
//      amount: Math.round(totalAmount * 100),  // cents
//      currency: 'usd',
//      customer: stripe_customer_id,
//      payment_method: stripe_payment_method_id,
//      confirm: true,
//      off_session: true,   // card not present — off-session charge
//      description: `Lawn service - ${customerName} - ${jobDate}`
//    }
// 4. On success:
//    - Update job: status='billed', stripe_payment_intent_id, amount_charged, billed_at, completion_photo_url
//    - Send SMS via Twilio
//    - Send email via Resend (if email exists)
//    - Log in communications
// 5. On Stripe error (card declined, etc.):
//    - Update job: status='completed' (NOT billed)
//    - Store error in job record
//    - Return 402 with error details for UI to handle
```

### `POST /api/admin/schedule/generate`

Generates recurring jobs for a date range.

```typescript
// Body: { customerIds: string[], startDate: string, endDate: string }
// For each customer:
//   - Fetch service_frequency
//   - Generate dates within range based on frequency
//   - Skip any date that already has a job for this customer
//   - Bulk insert job records
// Return: { created: number, skipped: number }
```

### `POST /api/admin/routes/optimize`

```typescript
// Body: { date: string, homeBase: { lat, lng } }
// 1. Fetch all scheduled jobs for that date with customer lat/lng
// 2. Call Google Distance Matrix API with all addresses
// 3. Run nearest-neighbor from homeBase
// 4. Return ordered array of { jobId, customerId, name, address, estimatedArrival }
// 5. Caller can then PATCH each job's scheduled_order
```

### `GET /api/admin/reports`

```typescript
// Query params: startDate, endDate
// Returns:
// {
//   totalRevenue: number,
//   jobsCompleted: number,
//   avgRevenuePerJob: number,
//   activeCustomers: number,
//   revenueByWeek: { week: string, revenue: number, jobs: number }[],
//   revenueByCustomer: { customerId, name, total, jobCount }[],
//   jobsByStatus: { status, count }[]
// }
// All queries run server-side via Supabase service role
```

---

## SMS Templates (Twilio)

These are stored in settings but have these defaults:

**Payment setup link:**
```
Hi [first_name]! This is [business_name]. Here's your secure payment setup link for lawn care services:
[payment_url]

Your service cost is $[amount] per visit. Takes 2 minutes to set up. Thanks!
```

**Billing receipt:**
```
[first_name], your lawn was just completed! Your card ending in [last4] was charged $[amount].

[photo_url]

Thanks for your business! — [business_name]
```

**Weather cancellation:**
```
Hi [first_name], we're rescheduling your lawn service today due to weather. We'll be in touch soon to confirm your new date. Sorry for the inconvenience! — [business_name]
```

---

## Email Templates (Resend)

Use Resend's React Email templates. Create a `emails/` folder at the project root.

### `BillingReceiptEmail.tsx`

Simple, clean receipt email:
- Header: business name
- "Your lawn service is complete"
- Property address
- Completion photo (if available, embed as image with URL)
- Line items:
  - Base service: $XX.XX
  - Add-ons (if any): listed with description + amount
  - **Total charged: $XX.XX**
- Card: **** **** **** [last4] ([brand])
- Date and time
- Footer: "Questions? Reply to this email or text us at [phone]"

---

## Supabase Storage

Bucket: `job-photos`
- Public: false (access via signed URLs or service role)
- File path: `{customer_id}/{job_id}.jpg`
- In the BillModal and customer profile, generate signed URLs (valid 1 hour) for display
- In the SMS receipt, generate a longer-lived signed URL (7 days) so customers can view their photo

---

## Key Implementation Notes

### Geocoding customers
When a customer is saved (create or update address), geocode immediately:
```typescript
// lib/geocode.ts
export async function geocodeAddress(address: string, city: string, state: string, zip: string) {
  const query = `${address}, ${city}, ${state} ${zip}`
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  )
  const data = await res.json()
  if (data.results[0]) {
    return data.results[0].geometry.location // { lat, lng }
  }
  return null
}
```

### Off-session Stripe charges
Customers set up their card once. Every subsequent charge is "off-session" (they're not present). Stripe requires:
1. When saving the card, include `setup_future_usage: 'off_session'` in the PaymentIntent or SetupIntent
2. When charging, include `off_session: true` and handle `authentication_required` errors gracefully (rare for US cards but possible)

### Recurring job generation
The schedule generation is intentionally simple — it creates flat job records, it doesn't use Stripe subscriptions. This keeps billing control fully in the owners' hands (they charge after each completed job, not on a timer).

### Route optimization realism
The Google Distance Matrix API has a free tier of ~100 requests/day — more than sufficient for a 20-customer operation. The nearest-neighbor algorithm is O(n²) which is trivial at this scale. Do not over-engineer this into a full TSP solver.

### Photo storage and privacy
Job completion photos show customers' homes. Keep the Supabase Storage bucket private and always serve via signed URLs. Never expose raw storage paths.

### Error resilience on billing
The bill flow touches 4 systems (Stripe, Supabase, Twilio, Resend). Each step should be try/caught independently. A failed SMS should not roll back a successful charge. Log all failures. Surface them in the billing queue for manual follow-up.

---

## UI Design System

Use shadcn/ui as the component foundation with these customizations:

**Color palette:**
```css
--color-brand: #2D5016;        /* deep green */
--color-brand-mid: #4A7C59;    /* medium green */
--color-brand-light: #EAF3DE;  /* light green tint */
--color-warning: #E8A000;      /* amber for pending states */
--color-danger: #C0392B;       /* red for errors/failed */
```

**Status badge colors:**
- `scheduled` → blue
- `completed` → amber (needs billing)
- `billed` → green
- `cancelled` → gray
- `awaiting payment` → amber
- `card on file` → green
- `payment link sent` → blue

**Typography:**
- Font: System font stack (fast, no import needed for an internal tool)
- Headings: font-weight 600
- Data/numbers: font-variant-numeric: tabular-nums (for aligned columns)

**Mobile:**
The admin portal is primarily used on a phone in the field (completing jobs, checking schedule, billing customers). Prioritize mobile-friendly layouts:
- BillModal: full-screen on mobile
- Calendar: single-day view on mobile with swipe navigation
- Customer list: card view on mobile, table view on desktop
- All tap targets: minimum 44px

---

## Build Order Recommendation

Build in this sequence to have a working end-to-end slice as early as possible:

1. **Database + auth** — Supabase tables, RLS, owner login
2. **Customer CRUD** — add/list/edit customers with geocoding
3. **Payment link + `/pay/[token]`** — generate link, customer sets up card
4. **Schedule view** — weekly calendar, manual job creation
5. **BillModal** — complete job, charge card, send receipt
6. **Recurring job generation** — bulk schedule from customer frequencies
7. **Route planner** — map view + optimization
8. **Reports** — revenue dashboard
9. **Billing queue** — catch-up screen for edge cases
10. **Settings + SMS templates** — polish and customization
11. **Mobile optimization pass** — test all flows on actual phone

---

## Out of Scope (For Now)

- Customer portal / login (customers have no account)
- Quotes / estimate workflow (pricing is set manually before onboarding)
- Inventory / supply tracking
- Payroll / tax filing integration
- Multi-business / multi-location support
- Native mobile app (responsive web is sufficient)
- Automated subscription billing (intentionally manual: charge after each job)
- Online booking by customers

---

## Starter Commands

```bash
# Create Next.js app
npx create-next-app@latest lawncare-admin --typescript --tailwind --app

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
npm install twilio resend
npm install @react-google-maps/api
npm install react-hook-form @hookform/resolvers zod
npm install zustand date-fns
npm install lucide-react

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card badge table dialog sheet select textarea toast calendar
```
