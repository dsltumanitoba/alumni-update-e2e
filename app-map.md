# UM Alumni Contact Update Form — App Map

## URL

https://umanitoba.ca/community/alumni/alumni-update-your-contact-information

## Rendering Notes

- Form is embedded inside an iframe on the UM webpage
- Locate the iframe `src` URL via DevTools and navigate to it directly
  in Playwright to avoid frameLocator() complexity
- No authentication required

---

## Test Data Convention

- **First Name must always contain the word `TEST`** (e.g. `TEST David`)
  so backend staff can identify and skip automated submissions
- Last Name: `Automation`
- Email: `qa-test-${Date.now()}@test.umanitoba.ca`
- Test submissions are purged by the existing Mon/Wed cleanup job

---

## Form Structure

### Section 1: Alumni Identification (always visible)

| Field                         | Type       | Required | Notes                                                      |
| ----------------------------- | ---------- | -------- | ---------------------------------------------------------- |
| First Name                    | text input | yes      | Must contain the word TEST for automation runs             |
| Middle Name                   | text input | no       |                                                            |
| Last Name                     | text input | yes      |                                                            |
| Full Name at Graduation       | checkbox   | no       | Triggers graduation name block (see Conditional Logic)     |
| First Name at Graduation      | text input | no       | Hidden until "Full Name at Graduation" is checked          |
| Middle Name at Graduation     | text input | no       | Hidden until "Full Name at Graduation" is checked          |
| Last Name at Graduation       | text input | no       | Hidden until "Full Name at Graduation" is checked          |
| Email Address                 | text input | yes      | Required unless "I don't have an email address" is checked |
| I don't have an email address | checkbox   | no       | Disables required validation on Email Address field        |
| Postal Code                   | text input | no       |                                                            |
| Region                        | text input | no       |                                                            |
| Country                       | dropdown   | no       |                                                            |
| Alumni Number                 | text input | no       |                                                            |
| Student Number                | text input | no       |                                                            |
| Faculty                       | dropdown   | yes      |                                                            |
| Year                          | text input | no       |                                                            |

---

### Section 2: Personal Contact Information (conditionally visible)

Revealed by checking the **Personal Contact Information** checkbox.

| Field               | Type       | Required | Notes |
| ------------------- | ---------- | -------- | ----- |
| First Name          | text input | no       |       |
| Middle Name         | text input | no       |       |
| Last Name           | text input | no       |       |
| Street Address      | text input | yes      |       |
| Apartment/Suite     | text input | no       |       |
| City                | text input | yes      |       |
| State               | dropdown   | yes      |       |
| Postal Code         | text input | yes      |       |
| Country             | dropdown   | yes      |       |
| Home Phone Number   | text input | no       |       |
| Mobile Phone Number | text input | no       |       |

---

### Section 3: Business Contact Information (conditionally visible)

Revealed by checking the **Business Contact Information** checkbox.

| Field                  | Type       | Required | Notes |
| ---------------------- | ---------- | -------- | ----- |
| Company Name           | text input | yes      |       |
| Job Title              | text input | yes      |       |
| Work Email             | text input | no       |       |
| Work Phone             | text input | no       |       |
| LinkedIn Profile       | text input | no       |       |
| Company Street Address | text input | no       |       |
| Suite                  | text input | no       |       |
| City                   | text input | no       |       |
| State                  | dropdown   | no       |       |
| Postal Code            | text input | no       |       |
| Country                | dropdown   | no       |       |

---

### Section 4: Notice of Decease (conditionally visible)

Revealed by checking the **Notice of Decease** checkbox.

| Field                    | Type       | Required | Notes                    |
| ------------------------ | ---------- | -------- | ------------------------ |
| Decease Date             | date input | yes      |                          |
| Online Obituary URL      | text input | no       |                          |
| Your Name                | text input | yes      | Name of person reporting |
| Relationship to Deceased | text input | no       |                          |
| Your Email               | text input | yes      |                          |
| Your Phone               | text input | no       |                          |

---

## Conditional Logic Map

- "Full Name at Graduation" checked → First Name at Graduation, Middle Name at Graduation, Last Name at Graduation become visible
- "Full Name at Graduation" unchecked → graduation name fields hidden
- "I don't have an email address" checked → Email Address required validation disabled
- "I don't have an email address" unchecked → Email Address required validation restored
- "Personal Contact Information" checked → Section 2 fields become visible
- "Personal Contact Information" unchecked → Section 2 fields hidden
- "Business Contact Information" checked → Section 3 fields become visible
- "Business Contact Information" unchecked → Section 3 fields hidden
- "Notice of Decease" checked → Section 4 fields become visible
- "Notice of Decease" unchecked → Section 4 fields hidden

---

## Submit Button

- Submit button is **enabled only after all required fields are filled**
- Validation is client-side (button state changes before POST)
- Let Claude Code identify exact error message text via DOM inspection

---

## Success State

- A confirmation banner appears on the same page (no redirect)
- White checkmark icon at the top of the banner
- Heading text: **"Thank you for submitting your contact updates"**
- Banner displays a summary with four fields:
  - **Name** — the submitted first + last name
  - **Email Address** — the submitted email
  - **Faculty** — the selected faculty
  - **Form Submit Time** — timestamp of submission (e.g. "Thursday, June 11, 2026 2:37:19 PM")

---

## Network / Backend

- Form submits to a Power Automate flow endpoint
- Confirm endpoint URL via DevTools Network tab on submission
- Expected HTTP method: POST

---

## Out of Scope

- Backend/Power Automate processing after submission
- Alumni Relations staff handling of submitted data
- Accessibility compliance testing
- Validation error message text (Claude Code will identify these via DOM inspection)
