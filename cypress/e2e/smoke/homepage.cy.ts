/**
 * SMOKE — Homepage
 * Fast verification that the homepage loads and key elements are present.
 *
 * Fix notes:
 * - "Browse Past Issues" CTA: replaced the deeply-nested nth-child() selector
 *   (body > div:nth-child(1) > main:nth-child(3) > … > a:nth-child(2)) with a
 *   simple href + text selector. The nth-child chain was fragile and would break
 *   on any structural change to the page layout.
 */

describe("[SMOKE] Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders the page with visible logo and primary navigation", () => {
    cy.get('a[class="flex items-center space-x-2"] img[alt="Burrowed Logo"]').should(
      "be.visible"
    );
    cy.get('a[class="font-primary font-medium transition-colors text-accent"]')
      .contains("Home")
      .should("be.visible");
    cy.get(
      'a[class="font-primary font-medium transition-colors text-primary/80 hover:text-accent"][href="/issues"]'
    )
      .contains("Issues")
      .should("be.visible");
    cy.get(
      'a[class="font-primary font-medium transition-colors text-primary/80 hover:text-accent"][href="/about"]'
    )
      .contains("About")
      .should("be.visible");
    cy.get(
      'a[class="font-primary font-medium transition-colors text-primary/80 hover:text-accent"][href="/collaborate"]'
    )
      .contains("Collaborate")
      .should("be.visible");
    cy.get(
      'a[class="px-6 py-2 rounded-2xl bg-accent text-white font-primary font-medium hover:bg-accent/90 transition-colors shadow-soft"]'
    )
      .contains("Submit Your Work")
      .should("be.visible");
  });

  it("displays the Read Latest Issue hero CTA", () => {
    cy.contains("button", "Read Latest Issue").should("be.visible").click();
  });

  it("displays the Submit Your Work hero CTA", () => {
    cy.get(".max-w-lg > .px-6")
      .contains("Submit Your Work")
      .should("be.visible");
  });

  it("displays the newsletter subscription form", () => {
    cy.get("#name").should("exist");
    cy.get("#featured-email").should("exist");
    cy.contains("button", "Subscribe to Newsletter").should("be.visible");
  });

  it("displays the Browse Past Issues CTA", () => {
    // IMPROVED: was a fragile nth-child deep selector. Now matches by href + text
    // content, which survives layout refactors.
    // TODO: add data-testid="browse-past-issues-cta" for the most stable selector.
    cy.get('a[href="/issues"]')
      .contains("Browse Past Issues")
      .should("be.visible");
  });
});
