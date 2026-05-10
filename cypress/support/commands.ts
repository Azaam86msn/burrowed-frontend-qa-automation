/// <reference types="cypress" />

export {};
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      stubRecaptcha(): Chainable<void>;
      interceptSubscribeSuccess(): Chainable<void>;
      interceptSubscribeUpdated(): Chainable<void>;
      interceptSubmitSuccess(fixture?: object): Chainable<void>;
      interceptCollaborateSuccess(): Chainable<void>;
    }
  }
}

// Stub reCAPTCHA: inject a fake token so the form can proceed in test environments.
// NOTE: This will only work if the backend's reCAPTCHA validation is disabled/mocked on staging.
// On production, actual reCAPTCHA must be solved manually or via a paid bypass service.
Cypress.Commands.add("stubRecaptcha", () => {
  cy.window().then((win) => {
    // Overwrite grecaptcha.execute to resolve immediately with a fake token
    (win as any).grecaptcha = {
      execute: () => Promise.resolve("STUBBED_RECAPTCHA_TOKEN_FOR_TESTS"),
      ready: (cb: () => void) => cb(),
    };
  });
});

// Intercept subscribe API and return a success response
Cypress.Commands.add("interceptSubscribeSuccess", () => {
  cy.intercept("POST", "**/api/subscribe/", {
    statusCode: 201,
    body: { message: "Successfully subscribed" },
  }).as("subscribeRequest");
});

// Intercept subscribe API and return a duplicate/already-subscribed response
Cypress.Commands.add("interceptSubscribeUpdated", () => {
  cy.intercept("POST", "**/api/subscribe/", {
    statusCode: 201,
    body: { message: "Subscription updated" },
  }).as("subscribeRequest");
});

// Intercept submit API and return success
Cypress.Commands.add("interceptSubmitSuccess", (fixture?: object) => {
  cy.intercept("POST", "**/api/submit/", {
    statusCode: 201,
    body: fixture ?? {
      id: 999,
      status: "pending",
      submitted_at: new Date().toISOString(),
    },
  }).as("submitRequest");
});

// Intercept collaborate API and return success
Cypress.Commands.add("interceptCollaborateSuccess", () => {
  cy.intercept("POST", "**/api/collaborate/", {
    statusCode: 201,
    body: {
      name: "Test Brand",
      email: "brand.test@mailinator.com",
      brand_or_organization: "TestCo",
      message: "Automated collaboration inquiry — please ignore.",
      logo_or_sample: null,
    },
  }).as("collaborateRequest");
});
