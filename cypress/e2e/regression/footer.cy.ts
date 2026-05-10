/**
 * REGRESSION — Footer static pages (Contact, FAQ, Legal)
 *
 * Fix notes:
 * - Replaced body '404' text check with h1.next-error-h1 (Next.js RSC issue).
 * - Fixed Contact Us selector to target CTA button via [class*="bg-accent"].
 */

describe("[REGRESSION] Contact Page (/contact)", () => {
  it("loads /contact without errors", () => {
    cy.visit("/contact");
    cy.location("pathname").should("eq", "/contact");

    // Next.js renders <h1 class="next-error-h1"> only on real 404 pages.
    // Its absence confirms the page loaded correctly.
    cy.get("h1.next-error-h1").should("not.exist");
    cy.title().should("not.match", /^404/);
    cy.get("main").should("exist");
  });

  it("navigates to /contact from footer link", () => {
    cy.visit("/");
    cy.get("footer").find('a[href="/contact"]').contains("Contact").click();
    cy.location("pathname").should("eq", "/contact");
  });

  it("navigates to /contact from about page Contact Us button", () => {
    cy.visit("/about");
    // Multiple a[href="/contact"] exist on /about (CTA + footer).
    // The CTA button has bg-accent class; the footer link has text-white/60.
    // TODO: add data-testid="about-contact-cta" for a stable selector.
    cy.get('a[href="/contact"][class*="bg-accent"]')
      .should("be.visible")
      .click();
    cy.location("pathname").should("eq", "/contact");
  });
});

describe("[REGRESSION] FAQ Page (/faq)", () => {
  it("loads /faq without errors", () => {
    cy.visit("/faq");
    cy.location("pathname").should("eq", "/faq");

    cy.get("h1.next-error-h1").should("not.exist");
    cy.title().should("not.match", /^404/);
    cy.get("main").should("exist");
  });

  it("navigates to /faq from footer link", () => {
    cy.visit("/");
    cy.get("footer").find('a[href="/faq"]').contains("FAQ").click();
    cy.location("pathname").should("eq", "/faq");
  });
});

describe("[REGRESSION] Legal Page (/legal)", () => {
  it("loads /legal without errors", () => {
    cy.visit("/legal");
    cy.location("pathname").should("eq", "/legal");

    cy.get("h1.next-error-h1").should("not.exist");
    cy.title().should("not.match", /^404/);
    cy.get("main").should("exist");
  });

  it("navigates to /legal from footer Privacy Policy link", () => {
    cy.visit("/");
    cy.get("footer")
      .find('a[href="/legal"]')
      .contains("Privacy Policy")
      .click();
    cy.location("pathname").should("eq", "/legal");
  });

  it("navigates to /legal from footer Copyright link", () => {
    cy.visit("/");
    cy.get("footer").find('a[href="/legal"]').contains("Copyright").click();
    cy.location("pathname").should("eq", "/legal");
  });
});
