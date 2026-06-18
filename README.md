# UM Alumni Contact Update Form — E2E Tests

Playwright test suite for the [University of Manitoba Alumni Contact Update Form](https://umanitoba.ca/community/alumni/alumni-update-your-contact-information).

## Purpose

Alumni have reported being unable to successfully submit their contact updates. These tests confirm the form is functioning correctly end-to-end — from field rendering and conditional visibility through to a successful backend submission and confirmation banner.

> Backend processing after the form reaches Power Automate is **out of scope**. Tests only verify UI behavior and submission success.

---

## Test Coverage

### Happy Paths

| Test | Description |
|------|-------------|
| `personal-contact` | Update personal address and phone details |
| `business-contact` | Update employer and work contact details |
| `notice-of-decease` | Submit a notice of decease on behalf of a deceased alumnus |
| `combined-update` | Update both personal and business contact info in one submission |
| `no-email` | Alumni checks "I don't have an email address" and submits |
| `graduation-name` | Alumni provides a different full name at graduation |

### Validation

Confirms the form blocks submission and surfaces visible errors when required fields are missing or malformed (empty names, invalid email format, missing faculty, empty section-specific required fields, etc.).

---

## Form Overview

The form is embedded in an iframe on the UM webpage. Tests navigate directly to the iframe `src` URL to avoid `frameLocator()` complexity.

**Sections:**

- **Alumni Identification** — always visible; includes name, email, faculty, and optional alumni/student numbers
- **Personal Contact Information** — revealed by checkbox; address and phone fields
- **Business Contact Information** — revealed by checkbox; employer, job title, and work contact fields
- **Notice of Decease** — revealed by checkbox; date, reporter name, and contact fields

---

## Test Data Convention

- **First Name** must always contain the word `TEST` (e.g. `TEST David`) so backend staff can identify and disregard automated submissions
- **Last Name:** `Automation`
- **Email:** `qa-test-${Date.now()}@test.umanitoba.ca`
- Test submissions are purged by the existing Mon/Wed cleanup job

---

## Getting Started

```bash
npm install
npx playwright install
npx playwright test
```

To run a specific test file:

```bash
npx playwright test tests/happy-paths/personal-contact.spec.ts
```

To open the HTML report after a run:

```bash
npx playwright show-report
```
