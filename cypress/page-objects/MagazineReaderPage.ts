// TODO: add data-testid="reader-download-btn" and data-testid="reader-close-btn"
// to the reader overlay buttons for more stable selectors

export class MagazineReaderPage {
  /**
   * Asserts the reader overlay is open.
   * .btn-close is always rendered while the reader is active.
   */
  assertOpen() {
    cy.get(".btn-close", { timeout: 15000 }).should("be.visible");
  }

  /**
   * Clicks the top-bar download icon button.
   */
  clickDownload() {
    cy.get(".btn-download").first().should("be.visible").click();
  }

  /**
   * Clicks the close (X) button to exit the reader.
   */
  clickClose() {
    cy.get(".btn-close").should("be.visible").click();
  }

  /**
   * Asserts the download anchor href contains the expected URL fragment.
   */
  assertDownloadLinkHref(urlFragment: string) {
    cy.get(".btn-download")
      .first()
      .should("have.attr", "href")
      .and("include", urlFragment);
  }

  /**
   * Asserts the last-page "Download PDF" link is visible.
   */
  assertLastPageDownloadVisible() {
    cy.contains("a", "Download PDF").should("be.visible");
  }

  /**
   * Turns one page by clicking the right half of the viewport.
   * TODO: add data-testid="reader-right-click-zone" for reliability.
   */
  clickRightSideOfPage() {
    cy.get(".btn-close").should("be.visible"); // guard: reader must be open
    cy.get("body").then(($body) => {
      const width = $body.width() ?? 1280;
      const height = $body.height() ?? 800;
      cy.get("body").click(Math.round(width * 0.75), Math.round(height * 0.5));
    });
  }
}
