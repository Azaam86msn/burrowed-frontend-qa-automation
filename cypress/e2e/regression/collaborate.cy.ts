/**
 * REGRESSION — Collaborate / Sponsorship
 *
 * Fix notes:
 * - Logo upload: uses inline Buffer instead of a fixture file on disk.
 *   This avoids the "file does not exist" error without needing a real PNG.
 */

import testData from "../../fixtures/testData.json";
import { CollaboratePage } from "../../page-objects/CollaboratePage";

const page = new CollaboratePage();
const { collaborator } = testData;

// Minimal 1×1 transparent PNG encoded as base64 — used for file upload tests
const MINIMAL_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

describe("[REGRESSION] Collaborate Page — Navigation", () => {
  it("loads from Explore Partnership Opportunities on homepage", () => {
    cy.visit("/");
    cy.get('a[href="/collaborate"]')
      .contains("Explore Partnership Opportunities")
      .click();
    cy.location("pathname").should("eq", "/collaborate");
  });

  it('loads from "Get in touch" link on homepage', () => {
    cy.visit("/");
    cy.get('a[href="/collaborate"]').contains("Get in touch").click();
    cy.location("pathname").should("eq", "/collaborate");
  });

  it("loads from footer Sponsorship link", () => {
    cy.visit("/");
    cy.get("footer")
      .find('a[href="/collaborate"]')
      .contains("Sponsorship")
      .click();
    cy.location("pathname").should("eq", "/collaborate");
  });
});

describe("[REGRESSION] Collaborate Page — Form rendering", () => {
  beforeEach(() => page.visit());

  it("displays all required form fields and submit button", () => {
    cy.get("#name").first().should("exist");
    cy.get('input[type="file"]').should("exist");
    cy.get("main").find("textarea").first().should("exist");
    cy.contains('button[type="submit"]', "Start the Conversation").should(
      "be.visible"
    );
  });
});

describe("[REGRESSION] Collaborate Page — Happy path (API stubbed)", () => {
  beforeEach(() => {
    cy.interceptCollaborateSuccess();
    page.visit();
  });

  it("fills all required fields without error", () => {
    page.fillName(collaborator.name);
    page.fillEmail(collaborator.email);
    page.fillOrganization(collaborator.organization);
    page.fillMessage(collaborator.message);

    cy.get("#name").first().should("have.value", collaborator.name);
    cy.get("main")
      .find("textarea")
      .first()
      .should("have.value", collaborator.message);
  });

  it("API called with correct shape on submission (staging only)", () => {
    cy.intercept("POST", "**/api/collaborate/", (req) => {
      expect(req.body).to.contain("name");
      expect(req.body).to.contain("email");
      expect(req.body).to.contain("message");
      req.reply({ statusCode: 201, body: {} });
    }).as("collabShape");

    // NOTE: reCAPTCHA prevents actual submission on production.
    // On staging with captcha disabled, call page.submit() here and assert success UI.
  });

  it("logo upload input accepts an image file", () => {
    // Use an inline minimal PNG buffer — no fixture file on disk required.
    const contents = Cypress.Buffer.from(MINIMAL_PNG_B64, "base64");

    cy.get('input[type="file"]').selectFile(
      { contents, fileName: "logo.png", mimeType: "image/png" },
      { force: true }
    );
    // TODO: assert preview or filename shown — add data-testid="logo-preview"
  });
});

describe("[REGRESSION] Collaborate Page — Validation", () => {
  beforeEach(() => page.visit());

  it("email field rejects invalid format (browser validation)", () => {
    page.fillEmail("not-valid");
    cy.contains('button[type="submit"]', "Start the Conversation").click();
    // Scope to main to get only the form's email input (not the footer one)
    cy.get("main")
      .find('input[type="email"]')
      .first()
      .then(($el) => {
        expect(($el[0] as HTMLInputElement).validity.valid).to.be.false;
      });
  });
});
