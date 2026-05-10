export class CollaboratePage {
  visit() {
    cy.visit("/collaborate");
  }

  fillName(value: string) {
    cy.get("#name").first().clear().type(value);
  }

  fillEmail(value: string) {
    // Scoped to <main> to exclude the footer subscription email input.
    // TODO: add id="collab-email" to this field for a stable selector.
    cy.get("main").find('input[type="email"]').first().clear().type(value);
  }

  fillOrganization(value: string) {
    // Sizzle (used by Cypress internally) does NOT support comma-separated
    // attribute selectors with the case-insensitive `i` flag.
    // Use .filter() with a JS callback to match either placeholder string.
    // TODO: add id="brand_or_organization" to this field for a stable selector.
    cy.get("main")
      .find('input[type="text"]')
      .filter((_index, el) => {
        const placeholder = (el as HTMLInputElement).placeholder.toLowerCase();
        return (
          placeholder.includes("brand") || placeholder.includes("organization")
        );
      })
      .first()
      .clear()
      .type(value);
  }

  fillMessage(value: string) {
    // TODO: add id="message" to the message textarea.
    cy.get("main").find("textarea").first().clear().type(value);
  }

  uploadLogo(fixturePath: string) {
    // TODO: add data-testid="logo-upload-input"
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fixturePath}`, {
      force: true,
    });
  }

  submit() {
    cy.contains('button[type="submit"]', "Start the Conversation").click();
  }
}
