# UM Alumni Contact Update Form — Intent Document

## Purpose

Allow University of Manitoba alumni who have previously graduated to
submit updates to their contact information on file with the University.
The primary goal of automated testing is to confirm the form is
functioning correctly end-to-end, since alumni have reported being
unable to successfully submit their updates.

## Target Users

University of Manitoba alumni (any graduation year, any faculty) who
want to update their personal records. No authentication is required —
the form is publicly accessible to anyone with the link.

## What "Working Correctly" Means

A successful test run confirms:

- The form loads and renders all fields correctly
- Conditional sections show and hide as expected
- Required field validation prevents incomplete submissions
- Field-level validation catches malformed input and surfaces a visible
  error message to the user
- A complete valid submission reaches the backend (Power Automate)
- The confirmation banner appears with the correct submitted data

The backend processing of the data after it reaches Power Automate is
out of scope — we only verify the form's UI behavior and that the
submission completes successfully.

---

## User Journeys to Test

### Journey 1: Update personal contact information (happy path)

Alumni fills in identification fields and opens the Personal Contact
Information section to update their address and phone details.
This is the most common use case.

### Journey 2: Update business contact information (happy path)

Alumni fills in identification fields and opens the Business Contact
Information section to update their employer and work contact details.

### Journey 3: Submit a notice of decease (happy path)

A family member or contact submits the Notice of Decease section on
behalf of a deceased alumnus. When testing this journey, only the
Notice of Decease section should be opened — no other update sections.

### Journey 4: Update personal and business contact information together

Alumni opens both Personal Contact Information and Business Contact
Information sections in the same submission.

### Journey 5: Alumni with no email address

Alumni checks "I don't have an email address", which removes the email
requirement, and completes the rest of the form successfully.

### Journey 6: Alumni with graduation name different from current name

Alumni checks "Full Name at Graduation" and fills in the alternate
graduation name fields alongside their current name.

---

## Validation Scenarios to Test

These confirm that the form surfaces errors visibly and blocks
submission when input is invalid. Claude Code should discover the
exact error message text via DOM inspection and write assertions
against what it finds.

Suggested validation scenarios (Claude Code can expand based on DOM):

- Submit with First Name empty → error visible, submission blocked
- Submit with Last Name empty → error visible, submission blocked
- Submit with Email Address in invalid format (e.g. missing @, missing
  domain) → error visible, submission blocked
- Submit with Faculty not selected → error visible, submission blocked
- Submit with Year containing fewer or more than 4 digits → error
  visible if validation exists, or note absence of validation
- Open Personal Contact Information and submit with Street Address
  empty → error visible, submission blocked
- Open Personal Contact Information and submit with City empty →
  error visible, submission blocked
- Open Personal Contact Information and submit without selecting
  State or Country → error visible, submission blocked
- Open Business Contact Information and submit with Company Name
  empty → error visible, submission blocked
- Open Business Contact Information and submit with Job Title empty →
  error visible, submission blocked
- Open Notice of Decease and submit with Decease Date empty →
  error visible, submission blocked
- Open Notice of Decease and submit with Your Name empty →
  error visible, submission blocked
- Open Notice of Decease and submit with Your Email empty or invalid
  → error visible, submission blocked

---

## Out of Scope

- Edge cases combining Notice of Decease with other update sections
  (not a real alumni use case)
- Backend/Power Automate data processing after submission
- Alumni Relations staff workflows
- Accessibility compliance
- Multi-user or concurrent submission scenarios
- Any journey not listed above

---

## Test Data Convention

- **First Name must always contain the word `TEST`** (e.g. `TEST David`)
  so backend staff can identify and disregard automated submissions
- Last Name: `Automation`
- Email: `qa-test-${Date.now()}@test.umanitoba.ca`
- Test submissions are purged by the existing Mon/Wed cleanup job
