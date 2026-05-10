/**
 * REGRESSION — About Page (/about)
 *
 * Fix notes:
 * - Replaced body '404' text check with h1.next-error-h1 selector (Next.js RSC
 *   script tags embed the notFound JSON payload containing "404" in every page).
 * - Replaced Contact\u00a0Us selector with [class*="bg-accent"] to distinguish
 *   the CTA button from the footer link (both share href="/contact").
 * - Removed redundant cy.visit('/about') inside tests — beforeEach handles it.
 * - FIXED: "Partner With Us" it() block was incorrectly placed OUTSIDE the
 *   describe() block, causing it to run as a detached root-level test with no
 *   beforeEach guard. Moved inside the describe block.
 */

describe("[REGRESSION] About Page", () => {
  beforeEach(() => cy.visit("/about"));

  it("renders without errors", () => {
    cy.location("pathname").should("eq", "/about");

    // The real Next.js 404 page renders <h1 class="next-error-h1">404</h1>.
    // If this element is absent, the page loaded correctly.
    cy.get("h1.next-error-h1").should("not.exist");

    // Page title must not start with "404"
    cy.title().should("not.match", /^404/);

    // At least one <h1> must exist in the rendered content
    cy.get("main").should("exist");
    cy.get("main h1").should("have.length.gte", 1);
  });

  it("Contact Us button navigates to /contact", () => {
    // Multiple a[href="/contact"] exist (CTA + footer).
    // The CTA button is distinguished by bg-accent class; the footer link has text-white/60.
    // TODO: add data-testid="about-contact-cta" for a more stable selector.
    cy.get('a[href="/contact"][class*="bg-accent"]')
      .should("be.visible")
      .click();
    cy.location("pathname").should("eq", "/contact");
  });

  it("Explore Our Vision button navigates to /submit", () => {
    cy.get('a[href="/submit"]').contains("Explore Our Vision").click();
    cy.location("pathname").should("eq", "/submit");
  });

  it('"Submit Your Work" inline link navigates to /submit', () => {
    cy.get('.max-w-4xl > .flex > [href="/submit"]')
      .contains("Submit Your Work")
      .first()
      .click();
    cy.location("pathname").should("eq", "/submit");
  });

  it('"Read Our Issues" link navigates to /issues', () => {
    cy.get('a[href="/issues"]').contains("Read Our Issues").first().click();
    cy.location("pathname").should("eq", "/issues");
  });

  // FIXED: was incorrectly defined outside the describe() block, so beforeEach
  // (cy.visit('/about')) never ran before this test. Now correctly placed inside.
  it('"Partner With Us" inline link navigates to /collaborate', () => {
    // TODO: add data-testid="about-partner-link" for a more stable selector.
    cy.get('a[href="/collaborate"]')
      .contains("Partner With Us")
      .first()
      .click();
    cy.location("pathname").should("eq", "/collaborate");
  });
});
