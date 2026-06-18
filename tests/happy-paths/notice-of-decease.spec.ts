import { expect, test } from '@playwright/test';
import { AlumniFormPage, SUCCESS_HEADING } from '../../pages/AlumniFormPage.js';
import { TEST_USER, generateEmail } from '../../fixtures/index.js';

test.describe('Journey 3: Submit a notice of decease', () => {
  // Scenario: A family member or contact submits the Notice of Decease
  // section on behalf of a deceased alumnus. Only the Notice of
  // Deceased section is opened — no other update sections.
  test('reporter submits a notice of decease', async ({ page }) => {
    const form = new AlumniFormPage(page);
    const alumniEmail = generateEmail();
    const reporterEmail = generateEmail();

    await form.goto();

    await form.fillFirstName(TEST_USER.firstName);
    await form.fillLastName(TEST_USER.lastName);
    await form.fillEmail(alumniEmail);
    await form.selectFaculty(TEST_USER.faculty);
    await form.fillYear(TEST_USER.year);

    await form.checkNoticeOfDeceasedSection();
    await form.fillDeceasedDate(TEST_USER.deceasedDate);
    await form.fillReporterName(TEST_USER.reporterName);
    await form.fillRelationshipToDeceased(TEST_USER.relationshipToDeceased);
    await form.fillReporterEmail(reporterEmail);
    await form.fillReporterPhone(TEST_USER.reporterPhone);

    await form.submit();

    await expect(form.successBannerHeading).toBeVisible();
    expect(await form.getSuccessBannerText()).toBe(SUCCESS_HEADING);
    await expect(form.submittedValue(TEST_USER.firstName)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.lastName)).toBeVisible();
    await expect(form.submittedValue(alumniEmail)).toBeVisible();
    await expect(form.submittedValue(TEST_USER.faculty)).toBeVisible();
  });
});
