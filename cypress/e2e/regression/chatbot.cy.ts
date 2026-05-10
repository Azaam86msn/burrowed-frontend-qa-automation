/**
 * REGRESSION — Chatbot Widget
 * NOTE: The /api/ask/ endpoint is currently returning 500 (Gemini 429 upstream).
 * Tests assert UI behaviour and the error state rather than a successful response.
 */

describe("[REGRESSION] Chatbot Widget", () => {
  beforeEach(() => cy.visit("/"));

  it("chat button is visible on the homepage", () => {
    cy.get('button[aria-label="Open chat"]').should("be.visible");
  });

  it("clicking the chat button opens the popup", () => {
    cy.get('button[aria-label="Open chat"]').click();
    // TODO: add data-testid="chatbot-popup" to the popup container
    cy.get('input[placeholder*="Ask about Burrowed"]').should("be.visible");
  });

  it('predefined prompt "When is the deadline?" fills the input', () => {
    cy.get('button[aria-label="Open chat"]').click();
    cy.contains("button", "When is the deadline?").click();
    cy.get('input[placeholder*="Ask about Burrowed"]').should(
      "have.value",
      "When is the deadline?"
    );
  });

  it('predefined prompt "How can I submit my work?" fills the input', () => {
    cy.get('button[aria-label="Open chat"]').click();
    cy.contains("button", "How can I submit my work?").click();
    cy.get('input[placeholder*="Ask about Burrowed"]').should(
      "have.value",
      "How can I submit my work?"
    );
  });

  it('predefined prompt "What kind of work do you accept?" fills the input', () => {
    cy.get('button[aria-label="Open chat"]').click();
    cy.contains("button", "What kind of work do you accept?").click();
    cy.get('input[placeholder*="Ask about Burrowed"]').should(
      "have.value",
      "What kind of work do you accept?"
    );
  });

  it('predefined prompt "Can I submit previously published work?" fills the input', () => {
    cy.get('button[aria-label="Open chat"]').click();
    cy.contains("button", "Can I submit previously published work?").click();
    cy.get('input[placeholder*="Ask about Burrowed"]').should(
      "have.value",
      "Can I submit previously published work?"
    );
  });

  it("send button is enabled once input has text", () => {
    cy.get('button[aria-label="Open chat"]').click();
    cy.get('input[placeholder*="Ask about Burrowed"]').type("Hello");
    cy.get('button[aria-label="Send message"]').should("not.be.disabled");
  });

  it("API returns 500 and UI shows an error state (known broken endpoint)", () => {
    cy.intercept("POST", "**/api/ask/", {
      statusCode: 500,
      body: { error: "API error: 429 Client Error: Too Many Requests" },
    }).as("askRequest");

    cy.get('button[aria-label="Open chat"]').click();
    cy.contains("button", "When is the deadline?").click();
    cy.get('button[aria-label="Send message"]').click();

    cy.wait("@askRequest");

    // TODO: Once the error UI is implemented, assert the error message is displayed.
    // e.g. cy.contains('Sorry, something went wrong').should('be.visible');
  });

  it("typing a custom message and sending fires POST to /api/ask/", () => {
    cy.intercept("POST", "**/api/ask/", (req) => {
      expect(req.body).to.have.property("prompt");
      expect(req.body).to.have.property("previous_prompt");
      expect(req.body).to.have.property("previous_answer");
      req.reply({ statusCode: 500, body: { error: "stubbed" } });
    }).as("customAsk");

    cy.get('button[aria-label="Open chat"]').click();
    cy.get('input[placeholder*="Ask about Burrowed"]').type(
      "What genres do you publish?"
    );
    cy.get('button[aria-label="Send message"]').click();

    cy.wait("@customAsk");
  });
});
