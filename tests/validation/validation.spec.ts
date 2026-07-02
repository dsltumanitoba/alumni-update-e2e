import { expect, test } from '@playwright/test';
import { AlumniFormPage } from '../../pages/AlumniFormPage.js';
import { TEST_USER, generateEmail } from '../../fixtures/index.js';

test.describe('Form validation', () => {
  // Scenario: Submit with First Name empty → error visible, submission blocked
  test('First Name empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.submit();

    await expect(form.getFieldError('firstName')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Submit with Last Name empty → error visible, submission blocked
  test('Last Name empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.submit();

    await expect(form.getFieldError('lastName')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Submit with Email Address in invalid format → error visible, submission blocked
  test('Email Address in invalid format surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail('not-an-email');
    await form.selectFaculty(TEST_USER.faculty);

    await form.submit();

    await expect(form.getFieldError('emailFormat')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Submit with Faculty not selected → error visible, submission blocked
  test('Faculty not selected surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());

    await form.submit();

    await expect(form.getFieldError('faculty')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Personal Contact Information and submit with Street Address empty → error visible
  test('Personal Contact: Street Address empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkPersonalContactSection();
    await form.fillCity(TEST_USER.city);
    await form.selectCountry(TEST_USER.country);
    await form.selectState(TEST_USER.state);
    await form.fillPostalCode(TEST_USER.postalCode);

    await form.submit();

    await expect(form.getFieldError('streetAddress')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Personal Contact Information and submit with City empty → error visible
  test('Personal Contact: City empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkPersonalContactSection();
    await form.fillStreetAddress(TEST_USER.streetAddress);
    await form.selectCountry(TEST_USER.country);
    await form.selectState(TEST_USER.state);
    await form.fillPostalCode(TEST_USER.postalCode);

    await form.submit();

    await expect(form.getFieldError('city')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Personal Contact Information and submit without selecting State → error visible
  test('Personal Contact: State not selected surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkPersonalContactSection();
    await form.fillStreetAddress(TEST_USER.streetAddress);
    await form.fillCity(TEST_USER.city);
    await form.selectCountry(TEST_USER.country);
    await form.fillPostalCode(TEST_USER.postalCode);
    // Intentionally leave State unselected to trigger the validation.

    await form.submit();

    await expect(form.getFieldError('state')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Personal Contact Information and submit without selecting Country → error visible
  test('Personal Contact: Country not selected surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkPersonalContactSection();
    await form.fillStreetAddress(TEST_USER.streetAddress);
    await form.fillCity(TEST_USER.city);
    await form.fillPostalCode(TEST_USER.postalCode);
    // Country defaults to "Canada"; explicitly clear it to the empty
    // placeholder option to trigger the Country Required validation.
    await form.selectCountry('');

    await form.submit();

    await expect(form.getFieldError('country')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Business Contact Information and submit with Company Name empty → error visible
  test('Business Contact: Company Name empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkBusinessContactSection();
    await form.fillJobTitle(TEST_USER.jobTitle);

    await form.submit();

    await expect(form.getFieldError('companyName')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Business Contact Information and submit with Job Title empty → error visible
  test('Business Contact: Job Title empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkBusinessContactSection();
    await form.fillCompanyName(TEST_USER.companyName);

    await form.submit();

    await expect(form.getFieldError('position')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Notice of Decease and submit with Decease Date empty → error visible
  test('Notice of Deceased: Decease Date empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkNoticeOfDeceasedSection();
    await form.fillReporterName(TEST_USER.reporterName);
    await form.fillReporterEmail(generateEmail());

    await form.submit();

    await expect(form.getFieldError('deceasedDate')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Notice of Decease and submit with Your Name empty → error visible
  test('Notice of Deceased: Your Name empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkNoticeOfDeceasedSection();
    await form.fillDeceasedDate(TEST_USER.deceasedDate);
    await form.fillReporterEmail(generateEmail());

    await form.submit();

    await expect(form.getFieldError('deceasedName')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Notice of Decease and submit with Your Email empty → error visible
  test('Notice of Deceased: Your Email empty surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkNoticeOfDeceasedSection();
    await form.fillDeceasedDate(TEST_USER.deceasedDate);
    await form.fillReporterName(TEST_USER.reporterName);

    await form.submit();

    await expect(form.getFieldError('deceasedEmail')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });

  // Scenario: Open Notice of Decease and submit with Your Email invalid → error visible
  test('Notice of Deceased: Your Email invalid format surfaces a visible error and blocks submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.checkNoticeOfDeceasedSection();
    await form.fillDeceasedDate(TEST_USER.deceasedDate);
    await form.fillReporterName(TEST_USER.reporterName);
    await form.fillReporterEmail('reporter-not-an-email');

    await form.submit();

    await expect(form.getFieldError('deceasedEmailFormat')).toBeVisible();
    await expect(form.successBannerHeading).not.toBeVisible();
  });
});

test.describe('Intentional failure demo', () => {
  // This test is intentionally designed to fail.
  // It submits a fully valid form (which succeeds) but then asserts the
  // wrong outcome, demonstrating what a Playwright failure report looks like.
  test('Form submission succeeds but test expects it to fail [INTENTIONAL]', async ({ page }) => {
    const form = new AlumniFormPage(page);
    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(generateEmail());
    await form.selectFaculty(TEST_USER.faculty);

    await form.submit();

    // Wait for the success banner to confirm the form actually submitted.
    await expect(form.successBannerHeading).toBeVisible();

    // Intentionally wrong assertion — checks for text that will never match,
    // producing a clear expected-vs-actual diff in the failure report.
    await expect(form.successBannerHeading).toHaveText('Wrong expected text — this assertion always fails');
  });
});
