// TODO: Ask dev team to add data-testid to all interactive elements below

export class HomePage {
  visit() {
    cy.visit("/");
  }

  // ── Navbar ──────────────────────────────────────────────────────────────
  clickNavLogo() {
    // TODO: add data-testid="nav-logo" to the logo <img>
    cy.get('img[alt="Burrowed Logo"]').first().click();
  }

  clickNavAbout() {
    cy.get('a[href="/about"]').contains("About").click();
  }

  clickNavIssues() {
    cy.get('a[href="/issues"]').contains("Issues").click();
  }

  clickNavSubmit() {
    // TODO: add data-testid="nav-submit-cta" to the nav Submit button
    cy.get('a[href="/submit"].rounded-2xl')
      .contains("Submit Your Work")
      .click();
  }

  // ── Hero CTAs ────────────────────────────────────────────────────────────
  clickReadLatestIssue() {
    // TODO: add data-testid="hero-read-latest-issue"
    cy.contains("button", "Read Latest Issue").click();
  }

  clickSubmitYourWork() {
    // TODO: add data-testid="hero-submit-cta"
    cy.get('a[href="/submit"]').contains("Submit Your Work").first().click();
  }

  clickReadOurStory() {
    cy.get('a[href="/about"]').contains("Read Our Story").click();
  }

  clickLearnMoreAboutUs() {
    cy.get('a[href="/about"]').contains("Learn more about us").click();
  }

  clickBrowsePastIssues() {
    cy.get('a[href="/issues"]').contains("Browse Past Issues").click();
  }

  // ── Latest issue card on homepage ────────────────────────────────────────
  clickReadThisIssue() {
    // TODO: add data-testid="homepage-issue-card-read-btn"
    cy.contains("button", "Read This Issue").click();
  }

  // ── Newsletter form ──────────────────────────────────────────────────────
  fillNewsletterName(name: string) {
    cy.get("#name").first().clear().type(name);
  }

  fillNewsletterEmail(email: string) {
    cy.get("#featured-email").clear().type(email);
  }

  submitNewsletter() {
    cy.contains('button[type="submit"]', "Subscribe to Newsletter").click();
  }

  // ── Footer subscription bar ──────────────────────────────────────────────
  fillFooterEmail(email: string) {
    // TODO: add data-testid="footer-email-input"
    cy.get('input[type="email"]').last().clear().type(email);
  }

  clickFooterSubscribe() {
    // TODO: add data-testid="footer-subscribe-btn"
    cy.contains("button", "Subscribe").click();
  }

  // ── Partner links ─────────────────────────────────────────────────────────
  partnerLink(alt: string) {
    return cy.get(`img[alt="${alt}"]`).parents("a");
  }

  // ── Footer nav ────────────────────────────────────────────────────────────
  clickFooterLink(label: string) {
    cy.get("footer").find(`a`).contains(label).click();
  }

  // ── Explore partnership ───────────────────────────────────────────────────
  clickExplorePartnership() {
    cy.get('a[href="/collaborate"]')
      .contains("Explore Partnership Opportunities")
      .click();
  }

  clickGetInTouch() {
    cy.get('a[href="/collaborate"]').contains("Get in touch").click();
  }

  // ── Buy Us a Coffee ───────────────────────────────────────────────────────
  getBuyUsCoffeeLink() {
    return cy.get('a[href="https://authorgrunt.gumroad.com/coffee"]');
  }

  // ── Chatbot ───────────────────────────────────────────────────────────────
  openChatbot() {
    cy.get('button[aria-label="Open chat"]').click();
  }
}
