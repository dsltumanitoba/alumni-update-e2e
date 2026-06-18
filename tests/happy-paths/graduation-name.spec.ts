import { expect, test } from '@playwright/test';
import { AlumniFormPage, SUCCESS_HEADING } from '../../pages/AlumniFormPage.js';
import { TEST_USER, generateEmail } from '../../fixtures/index.js';

test.describe('Journey 6: Alumni with graduation name different from current name', () => {
  // Scenario: Alumni checks "Full Name at Graduation" and fills in the
  // alternate graduation name fields alongside their current name.
  test('alumni provides graduation name different from current name', async ({ page }) => {
    const form = new AlumniFormPage(page);
    const email = generateEmail();

    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);

    await form.checkFullNameAtGraduation();
    await form.fillFirstNameAtGraduation(TEST_USER.firstNameAtGraduation);
    await form.fillLastNameAtGraduation(TEST_USER.lastNameAtGraduation);

    await form.fillEmail(email);
    await form.selectFaculty(TEST_USER.faculty);
    await form.fillYear(TEST_USER.year);

    await form.submit();

    await expect(form.successBannerHeading).toBeVisible();
    expect(await form.getSuccessBannerText()).toBe(SUCCESS_HEADING);
    await expect(form.submittedValue(TEST_USER.firstName)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.lastName)).toBeVisible();
    await expect(form.submittedValue(email)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.faculty)).toBeVisible();
  });
});
