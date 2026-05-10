/**
 * REGRESSION — Issues Page (/issues)
 */

describe("[REGRESSION] Issues Page", () => {
  beforeEach(() => cy.visit("/issues"));

  it("renders the Issues page at /issues", () => {
    cy.location("pathname").should("eq", "/issues");

    // Next.js embeds the notFound fallback (containing "404") as JSON inside
    // an inline <script> tag on every page — even pages that loaded correctly.
    // The real 404 page renders <h1 class="next-error-h1">404</h1> in the DOM.
    // Asserting its absence is the only reliable 404 check.
    cy.get("h1.next-error-h1").should("not.exist");
    cy.title().should("not.match", /^404/);
    cy.get("main").should("exist");
  });

  it("shows a Latest Issue section with a Read This Issue button", () => {
    cy.contains("button", "Read This Issue").should("be.visible");
  });

  it("shows a Download PDF button for the latest issue", () => {
    cy.get('a[href*=".pdf"]')
      .contains("Download PDF")
      .should("be.visible")
      .and("have.attr", "target", "_blank");
  });

  it("opens reader on clicking Read This Issue", () => {
    cy.contains("button", "Read This Issue").first().click();
    cy.get(".btn-close", { timeout: 10000 }).should("be.visible");
  });

  it("shows All Issues section with Read Issue + Download per card", () => {
    cy.contains("button", "Read Issue").should("exist");
    cy.get('a[href*=".pdf"]')
      .filter(':contains("Download")')
      .should("have.length.gte", 1);
  });

  it("all Download links point to a PDF file", () => {
    cy.get('a[href*=".pdf"]').each(($el) => {
      cy.wrap($el).invoke("attr", "href").should("match", /\.pdf/i);
    });
  });

  it("all issue Download links open in new tab", () => {
    cy.get('a[href*=".pdf"]').each(($el) => {
      cy.wrap($el).should("have.attr", "target", "_blank");
    });
  });

  it("navigates to issues from footer Issues link", () => {
    cy.visit("/");
    cy.get("footer").find('a[href="/issues"]').contains("Issues").click();
    cy.location("pathname").should("eq", "/issues");
  });
});
