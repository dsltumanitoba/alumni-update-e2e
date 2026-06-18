import { expect, test } from '@playwright/test';
import { AlumniFormPage, SUCCESS_HEADING } from '../../pages/AlumniFormPage.js';
import { TEST_USER, generateEmail } from '../../fixtures/index.js';

test.describe('Journey 2: Update business contact information', () => {
  // Scenario: Alumni fills in identification fields and opens the
  // Business Contact Information section to update their employer and
  // work contact details.
  test('alumni updates business contact information', async ({ page }) => {
    const form = new AlumniFormPage(page);
    const email = generateEmail();

    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(email);
    await form.selectFaculty(TEST_USER.faculty);
    await form.fillYear(TEST_USER.year);

    await form.checkBusinessContactSection();
    await form.fillCompanyName(TEST_USER.companyName);
    await form.fillJobTitle(TEST_USER.jobTitle);
    await form.fillWorkEmail(TEST_USER.workEmail);
    await form.fillWorkPhone(TEST_USER.workPhone);

    await form.submit();

    await expect(form.successBannerHeading).toBeVisible();
    expect(await form.getSuccessBannerText()).toBe(SUCCESS_HEADING);
    await expect(form.submittedValue(TEST_USER.firstName)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.lastName)).toBeVisible();
    await expect(form.submittedValue(email)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.faculty)).toBeVisible();
  });
});
