/**
 * AlumniFormPage
 *
 * Covers:
 *   - Section 1: Alumni Identification (always visible)
 *   - Section 2: Personal Contact Information (revealed by checkbox)
 *   - Section 3: Business Contact Information (revealed by checkbox)
 *   - Section 4: Notice of Deceased (revealed by checkbox)
 *
 * The form is hosted at a Power Platform direct-invoke URL. The UM page
 * embeds it in an iframe; navigating to the iframe src avoids
 * frameLocator() complexity. The URL can be overridden via
 * ALUMNI_FORM_URL env var.
 */

import { expect, type Locator, type Page } from '@playwright/test';

export const ALUMNI_FORM_URL =
  process.env.ALUMNI_FORM_URL ??
  'https://default4f80dd0b338c4e4c8a1490446962f7.b8.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/2273c48e535147b69f4f81f9f9d8cdcd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=stL34Fv04GKxew2VMZB1CFMVVWevG_epWPZDD8Nosx8';

export const SUCCESS_HEADING = 'Thank you for submitting your contact updates';

// Map logical field name → `<small>` warning element id. Each id was
// captured by DOM inspection of every <small id="…Warning|Invalid">.
// The `.hidden` class is removed when the form's client-side validator
// surfaces the error.
export const FIELD_ERROR_IDS = {
  firstName: 'firstNameWarning',
  lastName: 'lastNameWarning',
  email: 'emailWarning',
  emailFormat: 'emailInvalid',
  faculty: 'facultyWarning',
  streetAddress: 'streetAddressWarning',
  city: 'cityWarning',
  state: 'stateWarning',
  zip: 'zipWarning',
  country: 'countryWarning',
  companyName: 'companyNameWarning',
  position: 'positionWarning',
  deceasedDate: 'deceasedDateWarning',
  deceasedName: 'deceasedProvidedByWarning',
  deceasedEmail: 'deceasedEmailWarning',
  deceasedEmailFormat: 'deceasedEmailInvalid',
} as const;

export type FieldName = keyof typeof FIELD_ERROR_IDS;

export class AlumniFormPage {
  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(ALUMNI_FORM_URL);
    // Wait for the form's first required field to be ready.
    await expect(
      this.page.getByLabel('First Name:', { exact: true }).first(),
    ).toBeVisible();
  }

  // ── Section 1: Alumni Identification ──────────────────────────────

  async fillFirstName(value: string): Promise<void> {
    await this.page.getByLabel('First Name:', { exact: true }).first().fill(value);
  }

  async fillMiddleName(value: string): Promise<void> {
    await this.page.getByLabel('Middle Name(s):', { exact: true }).first().fill(value);
  }

  async fillLastName(value: string): Promise<void> {
    await this.page.getByLabel('Last Name:', { exact: true }).first().fill(value);
  }

  async checkFullNameAtGraduation(): Promise<void> {
    // Materialize.css styles the native checkbox as visually hidden;
    // clicking is handled by an overlay span. .check({ force: true })
    // toggles the underlying input directly.
    await this.page
      .getByRole('checkbox', { name: 'Full Name at Graduation (if different from above)' })
      .check({ force: true });
  }

  async fillFirstNameAtGraduation(value: string): Promise<void> {
    await this.page.getByLabel('First Name at Graduation:').fill(value);
  }

  async fillMiddleNameAtGraduation(value: string): Promise<void> {
    await this.page.getByLabel('Middle Name(s) at Graduation:').fill(value);
  }

  async fillLastNameAtGraduation(value: string): Promise<void> {
    await this.page.getByLabel('Last Name at Graduation:').fill(value);
  }

  async fillEmail(value: string): Promise<void> {
    await this.page.getByLabel('Email Address:', { exact: true }).first().fill(value);
  }

  async checkNoEmail(): Promise<void> {
    await this.page
      .getByRole('checkbox', { name: "I don't have an Email Address" })
      .check({ force: true });
  }

  async fillRegionPostalCode(value: string): Promise<void> {
    await this.page.getByLabel('Postal Code / ZIP Code:').fill(value);
  }

  async selectRegionCountry(value: string): Promise<void> {
    await this.page.getByLabel('Region Country:').selectOption({ label: value });
  }

  async fillAlumniNumber(value: string): Promise<void> {
    await this.page.getByLabel('Alumni Number:').fill(value);
  }

  async fillStudentNumber(value: string): Promise<void> {
    await this.page.getByLabel('Student Number:').fill(value);
  }

  async selectFaculty(value: string): Promise<void> {
    await this.page
      .getByRole('combobox', { name: 'Faculty:', exact: false })
      .selectOption({ label: value });
  }

  async fillYear(value: string): Promise<void> {
    await this.page.getByLabel('Year:').fill(value);
  }

  // ── Section toggles ───────────────────────────────────────────────

  async checkPersonalContactSection(): Promise<void> {
    await this.page
      .getByRole('checkbox', { name: 'Personal Contact Information' })
      .check({ force: true });
  }

  async checkBusinessContactSection(): Promise<void> {
    await this.page
      .getByRole('checkbox', { name: 'Business Contact Information' })
      .check({ force: true });
  }

  async checkNoticeOfDeceasedSection(): Promise<void> {
    await this.page
      .getByRole('checkbox', { name: 'Notice of Deceased' })
      .check({ force: true });
  }

  // ── Section 2: Personal Contact Information ───────────────────────
  //
  // Address & phone labels for Section 2 are unique vs Section 1.
  // City/PostalCode/State/Country labels are duplicated in Section 3
  // (Business). Section 2 is rendered before Section 3 in DOM, so
  // .first() reliably targets the Personal Contact fields.

  async fillStreetAddress(value: string): Promise<void> {
    await this.page.getByLabel('Street Address:', { exact: true }).fill(value);
  }

  async fillAptSuiteUnit(value: string): Promise<void> {
    await this.page.getByLabel('Apt / Suite / Unit:', { exact: true }).fill(value);
  }

  async fillCity(value: string): Promise<void> {
    await this.page.getByLabel('City / Town:', { exact: true }).first().fill(value);
  }

  async selectState(value: string): Promise<void> {
    // Personal Contact state combobox has no accessible name; target by
    // its stable form-name attribute.
    await this.page.locator('select[name="state"]').selectOption({ label: value });
  }

  async fillPostalCode(value: string): Promise<void> {
    await this.page.getByLabel('Postal Code/ ZIP:', { exact: true }).first().fill(value);
  }

  async selectCountry(value: string): Promise<void> {
    // Passing '' picks the empty placeholder option (used by tests that
    // need to verify the Country Required validation).
    const target = value === '' ? { index: 0 } : { label: value };
    await this.page.locator('select[name="country"]').selectOption(target);
  }

  async fillHomePhone(value: string): Promise<void> {
    await this.page.getByLabel('Home Phone Landline Number:').fill(value);
  }

  async fillMobilePhone(value: string): Promise<void> {
    await this.page.getByLabel('Mobile Phone Number:').fill(value);
  }

  // ── Section 3: Business Contact Information ───────────────────────

  async fillCompanyName(value: string): Promise<void> {
    await this.page.getByLabel('Company Name:').fill(value);
  }

  async fillJobTitle(value: string): Promise<void> {
    await this.page.getByLabel('Job Title:').fill(value);
  }

  async fillWorkEmail(value: string): Promise<void> {
    await this.page.getByLabel('Work Email:').fill(value);
  }

  async fillWorkPhone(value: string): Promise<void> {
    await this.page.getByLabel('Work Phone:').fill(value);
  }

  async fillLinkedIn(value: string): Promise<void> {
    await this.page.getByLabel('LinkedIn Profile URL:').fill(value);
  }

  async fillCompanyStreetAddress(value: string): Promise<void> {
    await this.page.getByLabel('Company Street Address:').fill(value);
  }

  async fillCompanyCity(value: string): Promise<void> {
    await this.page.getByLabel('City / Town:', { exact: true }).last().fill(value);
  }

  async selectCompanyState(value: string): Promise<void> {
    await this.page.locator('select[name="companyState"]').selectOption({ label: value });
  }

  async fillCompanyPostalCode(value: string): Promise<void> {
    await this.page.getByLabel('Postal Code / ZIP:', { exact: true }).fill(value);
  }

  async selectCompanyCountry(value: string): Promise<void> {
    await this.page.locator('select[name="companyCountry"]').selectOption({ label: value });
  }

  // ── Section 4: Notice of Deceased ─────────────────────────────────

  async fillDeceasedDate(value: string): Promise<void> {
    // Materialize datepicker rendered as <input type="text">. Filling
    // the value directly skips the picker overlay, which the form
    // accepts.
    const input = this.page.getByLabel('Deceased Date:');
    await input.fill(value);
    await input.blur();
  }

  async fillObituaryURL(value: string): Promise<void> {
    await this.page.getByLabel('Online Obituary URL:').fill(value);
  }

  async fillReporterName(value: string): Promise<void> {
    await this.page.getByLabel('Your Name:').fill(value);
  }

  async fillRelationshipToDeceased(value: string): Promise<void> {
    await this.page.getByLabel('Your Relationship to Deceased:').fill(value);
  }

  async fillReporterEmail(value: string): Promise<void> {
    await this.page.getByLabel('Your Email:').fill(value);
  }

  async fillReporterPhone(value: string): Promise<void> {
    await this.page.getByLabel('Your Phone:').fill(value);
  }

  // ── Submit & results ──────────────────────────────────────────────

  get submitButton(): Locator {
    return this.page.getByRole('link', { name: 'Submit Info' });
  }

  async submit(): Promise<void> {
    // The Submit Info link has a click handler that either reveals
    // validation errors (when fields are incomplete) or submits the
    // form (when valid). It works whether or not the `disabled`
    // attribute is present. Materialize's ripple wrapper intercepts
    // Playwright's synthetic mouse-click, so we invoke the element's
    // own click() method to make sure the bound handler fires.
    await this.submitButton.evaluate((el) => (el as HTMLElement).click());
  }

  get successBannerHeading(): Locator {
    return this.page.getByRole('heading', { name: SUCCESS_HEADING });
  }

  async getSuccessBannerText(): Promise<string> {
    return (await this.successBannerHeading.textContent())?.trim() ?? '';
  }

  // Returns a locator for a submitted value in the success banner
  // summary. Some values (e.g. the Faculty name) also appear inside
  // hidden <option> elements within the dropdowns, so .last() targets
  // the rendered banner copy that is appended after submission.
  submittedValue(value: string): Locator {
    return this.page.getByText(value, { exact: false }).last();
  }

  getFieldError(fieldName: FieldName): Locator {
    // Each <small> warning element has a stable, unique id assigned
    // by the form. The id is an accessible attribute and disambiguates
    // duplicate text (e.g. "Email Invalid Format" appears for several
    // email fields). The `.hidden` class on the element is removed
    // when the message is surfaced — toBeVisible() in tests asserts
    // that the user actually sees the error.
    return this.page.locator(`[id="${FIELD_ERROR_IDS[fieldName]}"]`);
  }
}
