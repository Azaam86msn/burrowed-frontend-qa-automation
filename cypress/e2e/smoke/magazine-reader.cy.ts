/**
 * SMOKE — Magazine Reader
 * Verifies the reader opens, shows a download button, and can be closed.
 */

import { HomePage } from "../../page-objects/HomePage";
import { MagazineReaderPage } from "../../page-objects/MagazineReaderPage";

const home = new HomePage();
const reader = new MagazineReaderPage();

describe("[SMOKE] Magazine Reader", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("opens the magazine reader when Read Latest Issue is clicked", () => {
    home.clickReadLatestIssue();
    reader.assertOpen();
  });

  it("shows a download button inside the reader", () => {
    home.clickReadLatestIssue();
    reader.assertOpen();
    cy.get(".btn-download")
      .first()
      .should("be.visible")
      .and("have.attr", "target", "_blank");
  });

  it("closes the reader and returns to homepage when close is clicked", () => {
    home.clickReadLatestIssue();
    reader.assertOpen();
    reader.clickClose();
    cy.location("pathname").should("eq", "/");
    cy.get(".btn-close").should("not.exist");
  });
});
