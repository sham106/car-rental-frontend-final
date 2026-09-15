# Backend plan for Oceane Car Rental

The selected backend is **Python with FastAPI**, using **Supabase Auth**, **Supabase PostgreSQL** and, when needed, **Supabase Storage**. The React/TypeScript frontend calls FastAPI through same-origin /api endpoints.

Admin authentication is implemented in the sibling backend folder. See [setup and verification](../../backend/README.md) for the migration, first administrator, environment configuration and run commands. Fleet and booking persistence remain the next implementation stages.

## Responsibilities

| Layer | Responsibility |
| --- | --- |
| React frontend | Rendering, input assistance, draft estimates, authenticated session UX, calling services and showing errors |
| Supabase Auth | Staff/customer identity, sign-in, session lifecycle and recovery |
| PostgreSQL tables, policies and functions | Durable records, permissions, unique/foreign-key constraints, authoritative prices and transactional booking state changes |
| Python/FastAPI | Runtime request validation, guest request entry points, protected integrations, email/WhatsApp provider calls, future payment webhooks |
| Supabase Storage | Public vehicle photos; private identity, compliance and inspection files with controlled access |

The frontend calls FastAPI for application data. FastAPI validates the user and permissions, then calls Supabase with appropriate database authorization. Sensitive multi-record workflows should use transactional database functions. A staff role must come from trusted database/admin-managed claims, never an editable role dropdown or user-supplied metadata. [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

Only the public project URL and publishable key belong in frontend environment variables. Service-role/secret keys and external provider credentials belong on the server. Private storage access needs its own policies; a table policy does not automatically secure every file. [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

## Suggested initial data model

- admin_memberships linked to auth.users (implemented); customer profiles and any additional staff permissions with controlled assignment workflows.
- owners, customers, vehicles, vehicle_categories, vehicle_photos and rental_locations.
- bookings with customer/vehicle references, status, schedule, pricing snapshot, unique reference, creation actor and idempotency key.
- vehicle_allocations covering confirmed rentals, assignments and maintenance/administrative blocks.
- inspections containing check-out/check-in mileage, fuel, notes, operator and timestamps; inspection_photos stored separately.
- assignments, maintenance_records, compliance_records and documents with storage object paths.
- settings with actual consumers in pricing, deposits, maintenance and notification logic.
- audit_logs and notification_outbox; later payments, refunds and owner_payouts if those workflows are in scope.

Use foreign keys instead of duplicated owner/customer names as the source of truth. Keep intentional booking snapshots for historical prices and vehicle/customer descriptions. Store money in fixed-precision units, timestamps consistently, and make date-only versus timed rental semantics explicit.

## Critical booking design

A guest request can remain pending without blocking a vehicle, matching the current UI. When staff confirms it, one authorized database transaction should:

1. Lock/recheck the request and verify that its status is still pending.
2. Validate the vehicle, schedule, operational holds and caller permissions.
3. Create its occupied interval in vehicle_allocations, protected by a database constraint/locking strategy that rejects overlaps for the same vehicle.
4. Write the confirmed booking state, trusted audit entry and notification-outbox event.
5. Commit all changes together or roll them all back.

Keep the no-overlap constraint on a common allocation table if rentals, maintenance and internal assignments share the same scarce vehicle. A constraint only on bookings cannot detect an assignment in another table. Define occupied intervals deliberately: date-only inclusive ranges and half-open timestamp ranges have different handover behavior. This is an implementation proposal to validate in migrations and concurrency tests.

Calculate the accepted rate, fees, deposit and total using trusted database data; never accept the customer's submitted total as authoritative. Use unique idempotency keys so retried submissions/webhooks do not duplicate bookings or payments.

Send notifications after commit through an outbox/retry process. An email outage should leave a visible pending-notification state, not silently lose a booking or roll back a completed rental.

Do not expose customer details merely because someone knows a short booking reference. Use authenticated ownership or a separate unguessable, expiring access token for guest retrieval. Public availability should expose occupied dates, not another renter's details or operational booking reference.

## Implementation order

1. **Agree on the operating rules:** guest versus customer accounts; staff roles; rental days/times and turnaround; pending-request holds; deposits/payments; driver verification; owner payout terms.
2. **Create the Supabase foundation:** migrations, development seeds, role model, RLS, storage buckets/policies, generated database types and environment configuration.
3. **Connect fleet and listings:** replace vehicle/category/owner service storage; separate public fields from internal records; implement photo upload.
4. **Connect the complete booking lifecycle:** atomic request creation and confirmation, inspections, assignments, cancellation and returns. Add database concurrency and permission tests before real bookings.
5. **Finish operational workflows:** compliance renewals, maintenance blocks, real documents/imports, settings consumers, trusted audit history and notification delivery.
6. **Finish reporting and launch checks:** agreed ledger definitions, tested exports, multi-device behavior, access recovery, monitoring, backup/restore procedure and deployment route handling.

Continue implementing operational endpoints in FastAPI while retaining Supabase Auth and PostgreSQL. Use database transactions for booking concurrency and durable workers for notification retries.

