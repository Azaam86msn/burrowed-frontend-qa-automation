import { defineConfig } from "cypress";
import { allureCypress } from "allure-cypress/reporter";

export default defineConfig({
  projectId: "czm3dt",
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "https://burrowed.org",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",

    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 12000,
    requestTimeout: 15000,

    retries: {
      runMode: 2,
      openMode: 0,
    },

    // allowCypressEnv REMOVED — allure-cypress uses Cypress.env('allure')
    // internally and crashes when this is set to false.

    env: {
      apiBaseUrl:
        process.env.API_BASE_URL ||
        "https://burrowed-magazine-api.onrender.com/api",
    },

    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: true,

    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: "allure-results",
      });
      return config;
    },
  },
});
