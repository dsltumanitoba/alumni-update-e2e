import { expect, test } from '@playwright/test';
import { AlumniFormPage, SUCCESS_HEADING } from '../../pages/AlumniFormPage.js';
import { TEST_USER, generateEmail } from '../../fixtures/index.js';

test.describe('Journey 1: Update personal contact information', () => {
  // Scenario: Alumni fills in identification fields and opens the
  // Personal Contact Information section to update their address and
  // phone details.
  test('alumni updates personal contact information', async ({ page }) => {
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
    await form.fillHomePhone(TEST_USER.homePhone);
    await form.fillMobilePhone(TEST_USER.mobilePhone);

    await form.submit();

    await expect(form.successBannerHeading).toBeVisible();
    expect(await form.getSuccessBannerText()).toBe(SUCCESS_HEADING);
    await expect(form.submittedValue(TEST_USER.firstName)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.lastName)).toBeVisible();
    await expect(form.submittedValue(email)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.faculty)).toBeVisible();
  });
});
