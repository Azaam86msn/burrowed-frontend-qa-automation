/**
 * SMOKE — Navigation
 * Verifies all top-level nav routes resolve without errors.
 *
 * WHY the original failed:
 *   cy.get('body').should('not.contain.text', '404') reads ALL text inside
 *   <body>, including Next.js RSC inline <script> tags which embed the
 *   notFound fallback component as serialized JSON containing the literal
 *   number 404 — even on pages that rendered correctly.
 *
 * Fix: assert on the *rendered* DOM only:
 *   - cy.title() for the document <title>
 *   - h1.next-error-h1 is the actual element Next.js renders on a real 404
 *   - A stable landmark element that must exist on every valid page
 */

const routes = [
  { label: "About", path: "/about", landmark: "h1" },
  { label: "Issues", path: "/issues", landmark: "h1" },
  { label: "Submit", path: "/submit", landmark: "h1" },
  { label: "Contact", path: "/contact", landmark: "h1" },
  { label: "FAQ", path: "/faq", landmark: "h1" },
  { label: "Legal", path: "/legal", landmark: "h1" },
  { label: "Collaborate", path: "/collaborate", landmark: "h1" },
];

describe("[SMOKE] Navigation routes", () => {
  routes.forEach(({ label, path, landmark }) => {
    it(`navigates to ${label} page (${path})`, () => {
      cy.visit(path);

      // 1. Confirm the URL is correct
      cy.location("pathname").should("eq", path);

      // 2. The real Next.js 404 page renders <h1 class="next-error-h1">404</h1>
      //    If this element exists, it IS a 404. If absent, the page loaded fine.
      cy.get("h1.next-error-h1").should("not.exist");

      // 3. Page <title> should not start with "404"
      //    (Next.js sets <title>404: This page could not be found.</title> on 404s)
      cy.title().should("not.match", /^404/);

      // 4. A rendered <h1> should exist in the main content area
      //    (all Burrowed pages have a hero/page heading)
      cy.get("main").should("exist");
      cy.get(landmark).should("have.length.gte", 1);
    });
  });

  it("logo click from any page returns to homepage", () => {
    cy.visit("/about");
    // Wait for the page to be interactive before clicking
    cy.get('img[alt="Burrowed Logo"]').first().should("be.visible").click();
    cy.location("pathname").should("eq", "/");
  });
});
