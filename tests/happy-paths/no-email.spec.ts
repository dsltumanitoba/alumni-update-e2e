import { expect, test } from '@playwright/test';
import { AlumniFormPage, SUCCESS_HEADING } from '../../pages/AlumniFormPage.js';
import { TEST_USER } from '../../fixtures/index.js';

test.describe('Journey 5: Alumni with no email address', () => {
  // Scenario: Alumni checks "I don't have an email address", which
  // removes the email requirement, and completes the rest of the form
  // successfully.
  test('alumni without email submits the form successfully', async ({ page }) => {
    const form = new AlumniFormPage(page);

    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.checkNoEmail();
    await form.selectFaculty(TEST_USER.faculty);
    await form.fillYear(TEST_USER.year);

    await form.submit();

    await expect(form.successBannerHeading).toBeVisible();
    expect(await form.getSuccessBannerText()).toBe(SUCCESS_HEADING);
    await expect(form.submittedValue(TEST_USER.firstName)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.lastName)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.faculty)).toBeVisible();
  });
});
