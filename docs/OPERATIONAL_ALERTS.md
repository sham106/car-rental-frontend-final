# Operational reminders

The dashboard's **Action required** panel and the notification bell use the same server-generated list of unresolved actions. Alerts are recalculated whenever fleet data is read; the open admin app refreshes every 30 seconds and on window focus. Staff can also refresh manually.

| Issue | Default advance notice | Action |
| --- | --- | --- |
| Fitness, Insurance, MVL and Licence expiry | 30 days | Open the affected car and review/renew its certificate |
| Next service date | 14 days | Open the car and record completed service or update its schedule |
| Next service mileage | 1,500 km | Same; comparison uses the latest recorded odometer |
| Active rental or internal assignment return | 1 day | Open the matching booking/assignment list to record the return |
| Missing certification record/file or missing service schedule | Immediate | Complete the affected car's records |

The notice windows are configurable under **System Settings → Automated Maintenance & Legal Expiry Triggers**. Older settings records fall back to the defaults above without a database migration. The next service date can be entered in Add/Edit Vehicle or while recording service.

## Priority and lifecycle

- **Overdue:** certificate expired, service date/mileage passed, or return date passed.
- **Due now:** deadline is today or the recorded odometer has reached the service target.
- **Due soon:** approaching within the configured date or mileage window.
- **Missing records:** the app cannot monitor an absent record or schedule, or a certificate lacks its file.

Date and mileage triggers are independent: either can raise a service alert, and the more urgent condition determines its priority. Expiry alerts use the latest renewal per car and certificate type, so historical expired copies do not keep raising alerts after renewal. Old records and documents remain accessible.

“Mark seen” acknowledges an alert for that administrator; it does not resolve it. Unresolved actions remain on the dashboard, in the Action required tab, and in the bell count. Escalation from upcoming to due/overdue makes the alert unseen again. Updating the underlying record removes a resolved alert on the next refresh. Counts and links update from current data, even after acknowledgement.

The action center sorts overdue items first and displays six cards with a link to the complete panel. Alert links open the exact car profile or a booking/assignment search with the relevant reference already filled in. Compliance and maintenance sidebar counts use this same active-alert source. The Compliance page defaults to the latest records and offers a history toggle.

## Delivery and data requirements

These are **in-app reminders**, not email, SMS, browser push, or desktop notifications. Alerts are available when staff open the admin app; no background delivery schedule is required for the in-app list. Existing webhook delivery is a separate facility and does not automatically deliver these calculated reminders.

Service-mileage reminders require staff to maintain odometer readings. Expiry/date reminders require correct dates. Missing records are flagged rather than described as compliant. A refresh failure displays a warning instead of silently implying that everything is clear.

## Verification

Backend boundary tests cover all four certificate types, date/mileage windows, due-today and overdue transitions, custom settings, acknowledgement, escalation, renewal/service resolution, missing records and both kinds of returns. Frontend tests cover priority ordering and safe admin routes. Browser tests verify visible dashboard actions, persistence after acknowledgement/reload, exact-car navigation, automatic resolution, settings changes and mobile presentation using isolated test data.
