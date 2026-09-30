# Service job cards

Open a vehicle profile → **Service job cards**, or open **Maintenance** for all jobs.

1. Create a pending job: select the vehicle, garage, date sent, expected return, person taking the car, contact number, requested work and instructions.
2. Print the saved card or choose Save as PDF in the browser print dialog. Reprints use the saved vehicle snapshot and unique SVC reference. Printing never records a completed service.
3. The mechanic fills in work, parts, costs, actual mileage, next service recommendations and signatures. The driver returns the card and invoice.
4. Complete the saved job. Enter the actual work, mechanic and collector, and optionally attach up to ten private PDFs/images (10 MB each).
5. Completion atomically creates the maintenance entry, links documents, updates the vehicle schedule and marks the job completed. Retries return the existing completion without duplicating records.

Jobs are available under Pending, Completed or All jobs, with registration/reference/garage/person search. Completed jobs retain their details, attachments and printable card.

Job cards track paperwork. Vehicle availability is managed separately through existing status controls; set In service when appropriate, and restore availability when the car returns. Signatures are recorded on paper and retained through the uploaded scan, not captured electronically. Existing completed-service recording is still available for services without a job card.

## Deployment

Apply `backend/migrations/006_service_jobs.sql` in Supabase **before deploying the updated backend and frontend**. It creates the private service-job table and updates the atomic snapshot/commit RPC resource lists. Existing data remains intact. This migration has been prepared locally, not applied to the hosted database.
