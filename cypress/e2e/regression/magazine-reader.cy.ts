/**
 * REGRESSION — Magazine Reader (full coverage)
 */

import { HomePage } from "../../page-objects/HomePage";
import { MagazineReaderPage } from "../../page-objects/MagazineReaderPage";
import testData from "../../fixtures/testData.json";

const home = new HomePage();
const reader = new MagazineReaderPage();

describe("[REGRESSION] Magazine Reader — Open paths", () => {
  it('opens reader from hero "Read Latest Issue" button', () => {
    cy.visit("/");
    home.clickReadLatestIssue();
    reader.assertOpen();
  });

  it('opens reader from homepage issue card "Read This Issue"', () => {
    cy.visit("/");
    home.clickReadThisIssue();
    reader.assertOpen();
  });

  it('opens reader from /issues page "Read This Issue" button', () => {
    cy.visit("/issues");
    cy.contains("button", "Read This Issue").first().click();
    reader.assertOpen();
  });

  it('opens reader from /issues "Read Issue" card button', () => {
    cy.visit("/issues");
    cy.contains("button", "Read Issue").first().click();
    reader.assertOpen();
  });
});

describe("[REGRESSION] Magazine Reader — Download", () => {
  beforeEach(() => {
    cy.visit("/");
    home.clickReadLatestIssue();
    reader.assertOpen();
  });

  it("top download icon has correct PDF href and opens in new tab", () => {
    cy.get(".btn-download")
      .first()
      .should("have.attr", "href")
      .and("include", "hearthside-reverie_2025_Winter.pdf");

    cy.get(".btn-download")
      .first()
      .should("have.attr", "target", "_blank")
      .and("have.attr", "rel")
      .and("include", "noopener");
  });
});

describe("[REGRESSION] Magazine Reader — Close behaviour", () => {
  it("close button returns user to /", () => {
    cy.visit("/");
    home.clickReadLatestIssue();
    reader.assertOpen();
    reader.clickClose();
    cy.location("pathname").should("eq", "/");
    cy.get(".btn-close").should("not.exist");
  });
});

describe("[REGRESSION] Magazine Reader — Issues page download links", () => {
  it("Download PDF button on /issues Latest Issue section has correct href", () => {
    cy.visit("/issues");
    cy.get('a[href*="hearthside-reverie_2025_Winter.pdf"]')
      .first()
      .should("have.attr", "target", "_blank");
  });

  it("All Download buttons on /issues link to a PDF", () => {
    cy.visit("/issues");
    cy.get("a")
      .filter('[href*=".pdf"]')
      .each(($a) => {
        cy.wrap($a).should("have.attr", "href").and("match", /\.pdf/);
      });
  });
});
