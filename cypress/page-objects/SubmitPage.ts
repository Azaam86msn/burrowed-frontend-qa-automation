// TODO: add data-testid attributes to all submit form fields for stable selectors.

type CypressBuffer = ReturnType<typeof Cypress.Buffer.from>;

export class SubmitPage {
  visit() {
    cy.visit("/submit");
  }

  fillFirstName(value: string) {
    cy.get("#firstName").clear().type(value);
  }

  fillLastName(value: string) {
    cy.get("#lastName").clear().type(value);
  }

  fillEmail(value: string) {
    // Scoped to main to exclude the footer subscription email input.
    // TODO: add id="email" to this field for a stable selector.
    cy.get("main").find('input[type="email"]').first().clear().type(value);
  }

  fillTitle(value: string) {
    // Sizzle (used internally by Cypress) does NOT support the case-insensitive
    // `i` flag in attribute selectors — e.g. input[placeholder*="title" i] throws
    // "Syntax error, unrecognized expression". Use .filter() with a JS callback
    // instead so the comparison runs in the browser rather than through Sizzle.
    // TODO: add id="title" to the title field for a stable selector.
    cy.get("main")
      .find('input[type="text"]')
      .filter((_index, el) => {
        return (el as HTMLInputElement).placeholder
          .toLowerCase()
          .includes("title");
      })
      .first()
      .clear()
      .type(value);
  }

  uploadFile(contents: CypressBuffer, fileName = "sample.docx") {
    // Accepts a Buffer directly — no fixture file on disk required.
    // TODO: add data-testid="file-upload-input" to the file input.
    cy.get('input[type="file"]').selectFile(
      {
        contents,
        fileName,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      { force: true }
    );
  }

  fillBio(value: string) {
    cy.get("#user_bio").clear().type(value);
  }

  selectCountry(countryName: string) {
    // TODO: add data-testid="country-dropdown-trigger"
    cy.contains("button", "Select your country").click();
    cy.contains("button", countryName).click();
  }

  fillNote(value: string) {
    cy.get("#user_note").clear().type(value);
  }

  submit() {
    cy.contains('button[type="submit"]', "Submit Your Work").click();
  }

  assertSuccessState() {
    cy.contains("button", "Submit Another Piece").should("be.visible");
  }

  clickSubmitAnother() {
    cy.contains("button", "Submit Another Piece").click();
  }
}
