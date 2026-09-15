# Application review — 7 September 2026

The application is a substantial React/TypeScript frontend prototype. The customer journey and many admin actions work with local demo data, but it is not yet a complete operational rental system. Connecting Supabase will require implementing several unfinished workflows as well as replacing storage calls.

## Scope and evidence

Reviewed routing, public pages, admin views, shared components, types, contexts, mock datasets, service methods, build configuration, and dependency usage. Browser checks covered 25 routes at 1440×1000 and six representative routes at 390×844. A separate browser journey covered vehicle details, calendar selection, booking submission, refresh, customer search, admin confirmation, cancellation, audit search, and a mobile voucher. These were isolated browser contexts with fictional data.

This is a code and functional review, not certification of every possible click, accessibility requirement, browser, business policy, or production deployment. No Supabase project, email provider, payment gateway, production environment, or real customer account was connected.

## What works and what remains

| Area | Current implementation | Remaining work |
| --- | --- | --- |
| Home, About, FAQ, Terms, Contact | Public layouts, navigation, FAQ filtering and accordion, featured inventory, contact channels | Confirm business copy, actual contact details, rental policy, imagery and testimonials; add route-specific metadata |
| Fleet catalog | Search, category/price/spec filters, sorting, published-only listings, date availability | Stable brand options independent of filtered results; avoid duplicate per-car availability calls; define behavior above the default Rs 5,000 price ceiling |
| Vehicle detail | Gallery, specifications, date calendar, pricing, similar vehicles, share controls | A single authoritative availability source; graceful failed-request/clipboard handling; align blocked calendar dates with indefinite operational holds |
| Booking wizard and voucher | Three-step request flow, estimated pricing, local persistence and admin synchronization, confirmation status | Server validation and pricing, atomic creation, verified contact information, secure retrieval, delivery of email/WhatsApp confirmations |
| Admin dashboard and fleet | Local vehicle creation/editing, photo compression, status changes, publish/feature controls, detail views | Supabase persistence, uniqueness and numeric validation, safe state transitions, current data across devices |
| Bookings and handover | Confirmation, rejection, cancellation, check-out/check-in, print inspection slip | Real inspection photo uploads; enforce odometer and vehicle-custody rules; transactional updates; payment/deposit records |
| Assignments | Local assignment creation, custodian grouping, return workflow | Validate conflicts with rentals and maintenance; prevent stale returns/cancellations overwriting another custody state |
| Owners and customers | Searchable directories and owner fleet details | Complete create/edit interfaces, verified identity workflow, canonical field names, persisted payout terms |
| Maintenance | Local service records, cost totals, next-service fields | Scheduled maintenance blocks and actual service workflow; remove prefilled fictional inspection findings; date and mileage policy |
| Compliance | Expiry calculations, filter views and alerts | The add action opens document upload, which does not create a compliance record; implement renewals and a link between certificates and fleet holds |
| Documents | Metadata records, preview/delete controls | Upload currently saves a stock-image URL; it does not upload a selected file. Use private Supabase Storage for documents |
| Website listings | Local publication and featuring controls | Database-backed public projection and permissions; cross-device refresh |
| Reports | Local totals, tables and four CSV exports | Owner export has no handler; metric definitions differ across views; CSV escaping is incomplete; zero amounts and owner split defaults need correction |
| Spreadsheet import | Sample-data preview, duplicate check against existing registrations, local commit | File selection/drop loads sample rows instead of parsing the supplied file; validate duplicates within a batch and resolve real owner IDs |
| Users and roles | Static user list and simulated user switch | No login, session protection or enforced authorization; the role switch is a demo control |
| Audit and notifications | Local activity history and notification drawer | Trusted server actor identity, immutable audit retention, consistent notification fields/navigation and actual scheduled alerts |
| Settings | Editable React state | Save reports persistence but does not persist settings or apply them to pricing/service rules; a dedicated settings service and database record are required |

## Fixes applied

- Corrected Navbar/Footer Terms routes and policy anchors; added hash scrolling and an admin not-found view.
- Made combined pickup/return updates resolve together and updated calendar callers. Selecting an earlier range no longer clamps its return against the old pickup. Fleet links now restore supplied dates and locations, and URL filter removal resets the relevant state.
- Added strict calendar-date validation, including invalid leap days. Assigned vehicles are unavailable to public requests. The available-only filter waits for a positive availability result.
- Counted categories from the current published inventory, including zero vehicles.
- Guarded booking confirmation against overlapping confirmed/active bookings, invalid dates and operational holds. Added booking-status transition checks and visible confirmation error feedback. This prevents the tested conflicts within one browser; it is not a database concurrency guarantee.
- Added explicit cancelled/rejected voucher messages. Generated request references use the current year and a UUID; long references wrap on mobile. Storage-write failures no longer silently return success at the first persistence step.
- Escaped interpolated values in the standalone inspection print HTML, preventing customer-entered markup from being interpreted as executable HTML.
- Fixed new-customer field compatibility in the directory/global search and normalized audit aliases used by filters/profile views. Removed fabricated customer-spend fallbacks and unconditional identity-verification claims. The amount column now reports fully paid rentals from the local records.
- Replaced the contact form's simulated “message received” result with an explicit email-draft handoff. The customer must send that draft in their email app; the website does not deliver it.
- Restricted demo reset to application keys instead of clearing every localStorage key on the origin.
- Collapsed the admin sidebar initially on phones and compacted the mobile header.
- Loaded the admin UI separately. The production build changed from one approximately 838.5 KB JS bundle to an approximately 498.5 KB initial JS bundle plus a 342.1 KB admin chunk (before compression). Public services still import demo admin services, so lazy loading is not a security boundary.
- Added eight regression tests, run with `npm test`.

## Highest-priority issues before real use

1. **Protect admin access and private records.** /admin is currently accessible without authentication. Client role selection cannot grant real permissions. Public code imports admin services and seeds, so private production data must never ship as frontend assets.
2. **Make booking mutations atomic.** bookingService saves a public request, then creates/synchronizes a customer and admin booking in separate steps and catches some failures. This can leave a success voucher without an operational booking. Use a database transaction with authoritative pricing, authorization and idempotency.
3. **Prevent conflicting vehicle allocations in the database.** Model rental reservations, internal assignments and maintenance in one scheduling system. Define same-day rentals, inclusive end dates versus timed handovers, buffer time and the Mauritius business timezone. Existing date comparisons treat both endpoints as occupied.
4. **Implement uploads and verification.** Documents and handover photographs are simulated. New customers currently receive placeholder licence/passport values and a hardcoded future licence expiry. Real verification needs nullable/unverified fields and an auditable staff action.
5. **Finish settings, compliance and imports.** These are incomplete workflows, not just missing API URLs. Fake success states must be removed or replaced with working operations.
6. **Separate estimates, invoices, payments and payouts.** Current reports use differing booking-status rules, fallback amounts and assumed operating periods. They are not an accounting ledger. Confirm the business definitions before persisting financial reports.

## Additional engineering findings

- Many services fall back to mock data after read failures. That behavior would hide an outage or denied access once Supabase is connected; production services should surface errors.
- Most mutations and availability reads use local browser events. Other tabs/devices are not reliably synchronized. A calendar refresh does not necessarily refresh the availability badge/filter at the same time.
- Several identifiers use a truncated timestamp, which can collide during rapid imports. Use database-generated UUIDs and unique constraints on registration, VIN, slug and booking reference where appropriate.
- Several views hold stale object snapshots in modals and reuse form state across records. Reset form state on open/record change and resolve current entities by ID.
- Global search passes an entity ID, but the admin tab handler ignores it. Notifications also mix link/linkTo, description/message and timestamp/createdAt fields.
- Customers, bookings and vehicle snapshots have duplicate alias fields and unsafe casts. TypeScript strict mode is disabled, which allowed undefined-field crashes to pass compilation.
- Add keyboard focus trapping/restoration, accessible names and expanded-state attributes to dialogs, sidebar controls and accordions. Mobile tables intentionally scroll within their containers; no page overflow does not prove every control is usable.
- Handle rejected requests, loading/empty states, stale responses and failed storage writes consistently. An ErrorBoundary does not catch rejected event-handler promises.
- Confirm static-host SPA rewrites for direct /vehicle and /admin links. Add route metadata, an appropriate robots policy and production error monitoring.
- The repository includes a Bun lockfile, but Bun was unavailable here. Verification used npm-resolved compatible dependencies without changing bun.lock. Recheck with the chosen package manager's frozen lockfile in CI.
- An audit of the installed dependency snapshot reported three moderately affected packages: express, body-parser and qs, from two qs advisories. Express is declared but unused by the application source; no running Express API was found. Remove unused server/AI dependencies or update the dependency chain before introducing a server. See [qs bracket parsing advisory](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) and [qs isBuffer advisory](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g). This was not a full dependency remediation exercise.

## Verification

- Final TypeScript check (npm run lint) passes.

- Eight regression tests pass: malformed dates, printed input escaping, concurrent overlapping confirmation in one browser, non-overlapping confirmation, invalid status transitions, operational holds, live category counts and audit compatibility.
- Browser route checks: 25 routes, no captured page exceptions. Mobile checks: six routes, no page-wide horizontal overflow.
- Browser booking checks: earlier calendar range selection; URL dates; submission; voucher refresh; new customer search; admin confirmation; cancelled voucher; long-reference mobile layout; audit search after new activity.
- Production build passes. The build tool needed execution outside the Windows sandbox to resolve its configuration.
- No claim is made that email delivery, actual uploads, payment collection, Supabase policies or multi-device concurrency have been tested: those integrations do not exist yet.

See [the backend recommendation and implementation sequence](BACKEND_PLAN.md).
