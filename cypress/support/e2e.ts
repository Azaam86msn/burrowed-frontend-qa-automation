/// <reference types="cypress" />

// Allure reporter client — MUST be imported before any other support code.
// This registers the hooks that capture step data during test execution.
import "allure-cypress";

import "./commands";

Cypress.on("uncaught:exception", (err) => {
  // Suppress environment-specific errors that are not caused by our tests.
  // reCAPTCHA: fires when google scripts can't reach their endpoints in CI.
  // Hydration: Next.js dev-mode warnings that don't occur in production builds.
  const ignoredPatterns = [
    "reCAPTCHA",
    "google",
    "Hydration",
    "hydration",
    // ResizeObserver loop errors are benign browser warnings, not test failures.
    "ResizeObserver loop",
  ];

  if (ignoredPatterns.some((pattern) => err.message.includes(pattern))) {
    return false;
  }

  // All other uncaught exceptions fail the test — correct behaviour.
  return true;
});
