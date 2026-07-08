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

---

## Published Reports (GitHub Pages)

Every CI run (`.github/workflows/playwright.yml`) publishes to a single GitHub
Pages site at **two** stable URLs:

| URL | What it shows |
|-----|---------------|
| `https://dsltumanitoba.github.io/alumni-update-e2e/` | **Latest run** — always the most recent report. Unchanged; bookmark-safe. |
| `https://dsltumanitoba.github.io/alumni-update-e2e/history/` | **Run history** — a table of every retained run (date, status, journey, trigger) with a link to each run's full report. |

Individual archived runs live at `.../runs/<run#>-<timestamp>/`.

### How history is kept

GitHub allows only one Pages site per repo, and the default deploy replaces the
whole site each run. To retain history without losing the latest-results URL:

1. Each run's report is committed to a dedicated **`test-history`** orphan
   branch (the durable archive — never checked out during normal development).
2. `scripts/publish-history.sh` fetches that branch, adds the new run under
   `runs/<slug>/` with a `meta.json`, prunes to the most recent **50** runs, and
   commits it back.
3. `scripts/build-history.mjs` regenerates the history index page from the
   retained runs' metadata.
4. The workflow then assembles the site published to Pages: the latest report at
   the root, plus `runs/` and `history/`.

Retention is controlled by `KEEP_RUNS` in the workflow (default `50`). Raw
report zips are also uploaded as workflow artifacts (30-day retention)
regardless of the Pages retention limit.
