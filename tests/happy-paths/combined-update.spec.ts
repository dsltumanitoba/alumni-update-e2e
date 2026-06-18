import { expect, test } from '@playwright/test';
import { AlumniFormPage, SUCCESS_HEADING } from '../../pages/AlumniFormPage.js';
import { TEST_USER, generateEmail } from '../../fixtures/index.js';

test.describe('Journey 4: Update personal and business contact information together', () => {
  // Scenario: Alumni opens both Personal Contact Information and
  // Business Contact Information sections in the same submission.
  test('alumni updates personal and business contact information in one submission', async ({ page }) => {
    const form = new AlumniFormPage(page);
    const email = generateEmail();

    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(email);
    await form.selectFaculty(TEST_USER.faculty);
    await form.fillYear(TEST_USER.year);

    await form.checkPersonalContactSection();
    await form.fillStreetAddress(TEST_USER.streetAddress);
    await form.fillCity(TEST_USER.city);
    // Country must be picked before State because the State options
    // depend on the selected Country.
    await form.selectCountry(TEST_USER.country);
    await form.selectState(TEST_USER.state);
    await form.fillPostalCode(TEST_USER.postalCode);
    await form.fillMobilePhone(TEST_USER.mobilePhone);

    await form.checkBusinessContactSection();
    await form.fillCompanyName(TEST_USER.companyName);
    await form.fillJobTitle(TEST_USER.jobTitle);
    await form.fillWorkEmail(TEST_USER.workEmail);

    await form.submit();

    await expect(form.successBannerHeading).toBeVisible();
    expect(await form.getSuccessBannerText()).toBe(SUCCESS_HEADING);
    await expect(form.submittedValue(TEST_USER.firstName)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.lastName)).toBeVisible();
    await expect(form.submittedValue(email)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.faculty)).toBeVisible();
  });
});
