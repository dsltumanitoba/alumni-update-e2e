// First name must always contain TEST so backend staff can identify
// and disregard automated submissions.

export const TEST_USER = {
  firstName: 'TEST Automation',
  middleName: '',
  lastName: 'Automation',
  // Real value confirmed against the live Faculty dropdown.
  faculty: 'Arts, Faculty of',
  year: '2020',

  // Personal Contact Information (Section 2)
  streetAddress: '123 Test Street',
  city: 'Winnipeg',
  state: 'Manitoba',
  postalCode: 'R3T 2N2',
  country: 'Canada',
  homePhone: '204-555-0100',
  mobilePhone: '204-555-0101',

  // Business Contact Information (Section 3)
  companyName: 'TEST Automation Company',
  jobTitle: 'QA Engineer',
  workEmail: 'work-test@test.umanitoba.ca',
  workPhone: '204-555-0200',

  // Notice of Deceased (Section 4)
  deceasedDate: '01 January, 2024',
  reporterName: 'TEST Reporter',
  relationshipToDeceased: 'Son',
  reporterPhone: '204-555-0300',

  // Graduation name fields (Journey 6)
  firstNameAtGraduation: 'TEST Maiden',
  middleNameAtGraduation: '',
  lastNameAtGraduation: 'Original',
} as const;

export function generateEmail(): string {
  return `qa-test-${Date.now()}@test.umanitoba.ca`;
}
