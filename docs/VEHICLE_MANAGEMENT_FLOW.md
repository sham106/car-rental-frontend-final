# Vehicle management flow

## Field ownership

| Group | Capture point | Review point |
| --- | --- | --- |
| Vehicle and ownership | Add / Edit Vehicle: brand, model, year, color, registration, VIN, engine number, registered owner, purchase date and value | Vehicle profile: identification and ownership |
| Compliance | Upload / Renew Document: separate Fitness, Insurance, MVL and Licence records, with issue date, expiry and uploaded PDF/image | Profile checklist, compliance history and private file links |
| Insurance details | Insurance certificate: company, policy number, premium and optional broker | Insurance record in the profile and Compliance page |
| Maintenance | Record Service: completion date, mileage at service, work details, garage, next service mileage and optional next date | Last-service summary and full service history |
| Assignment | Assign Vehicle: custodian, purpose, date out, expected return, mileage out; Assignments records the return | Profile assignment history and the car-filtered Assignments page |
| Booking | Booking captures planned dates; check-out/check-in capture actual Date Out/Date In and odometer readings | Profile rental history and the car-filtered Bookings page |

Fitness and Insurance are separate certifications. Broker belongs to the insurance policy, not vehicle custody. “Mileage Last Service” and “Service Mileage” refer to the same odometer reading on a service record; they are not separate conflicting fields.

## Staff workflow

1. Register the vehicle and select its owner. Add a missing owner inline without losing the vehicle form. Identification and purchase details must be completed. The website publication checkbox starts off.
2. Save to open the vehicle profile. Its setup checklist identifies missing information and documents.
3. Add each of the four certifications from its own checklist card. The car and document type are preselected. Enter the actual certificate dates and attach a file. Insurance additionally requires the company, policy number and premium; enter zero explicitly if applicable. Broker is optional for direct policies.
4. Record the last completed service, including historical work. Older entries do not reduce the current odometer. The most recent service by completion date and mileage supplies the next-service schedule; entering older history does not overwrite that schedule.
5. Review the record and publish from Edit Vehicle when ready. The checklist reports recorded data and certificate status; it is not a legal-compliance approval or an automatic publication gate.
6. Assign the car for internal custody or manage a customer booking. Profile links open the corresponding management page with the registration already in the search field. Clearing search shows the whole fleet.
7. Record actual returns through the appropriate workflow. Planned return dates remain distinct from actual return dates. Previous services, certificates, assignments and rentals remain visible as history.

## Gaps addressed

- No guided overview of missing records: added a per-car setup checklist.
- Owner creation interrupted registration: added inline owner creation and automatic selection.
- New cars published by default: registration now starts with website publication off.
- Renewal lost vehicle/type context: renewal now preselects the car/type and existing policy details, but requires new dates and file selection.
- Insurance fields could be silently blank: required company, policy number and explicit premium in the upload form.
- Compliance list displayed an empty provider despite a saved company: uses the company with provider fallback and shows broker and document links.
- Historical service could fail to update next-service mileage: schedule now follows the latest dated service without decreasing the odometer.
- Return mileage was guessed by adding 150 km: starts at the recorded odometer instead, for staff to enter the actual reading.
- Mobile profile header could hide the close control: header now wraps and keeps the close button accessible.
- Admin controls lacked consistent interaction cues: buttons, links and selectors now show pointer cursors, hover feedback and visible keyboard focus; disabled controls show a not-allowed cursor. Reduced-motion preferences are respected.
- Renewal history was not clearly labelled: certification cards now distinguish the latest record from previous records. Renewal preserves earlier policy details, premiums, brokers and uploaded files; this is verified in API and browser tests.

## Verification

- TypeScript validation and production build.
- Frontend regression tests for checklist completeness, renewal selection and last-service ordering.
- Backend tests for atomic certification/document creation, private files, historical service scheduling, mileage validation, and actual booking handover timestamps.
- `tests/vehicle-management.e2e.mjs`: browser registration with inline owner, four certificate uploads, insurance/broker details, document access, historical service, assignment, renewal context and mobile rendering against `backend/tests/fleet_browser_app.py` (isolated in-memory records and mock storage).

Live Supabase storage and deployment are not exercised by the isolated browser fixture.
