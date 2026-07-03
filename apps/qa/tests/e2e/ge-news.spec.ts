import { test } from "@playwright/test";
import { GeHomePage } from "../../pages/ge-home.page";

test.describe("ge.globo.com news", () => {
  test("home lists at least 10 complete news cards", async ({ page }) => {
    const home = new GeHomePage(page);

    await home.goto();
    await home.expectAtLeastNewsCards(10);
    await home.expectNewsContentIsComplete(10);
  });

  test("user opens a full article", async ({ page }) => {
    const home = new GeHomePage(page);

    await home.goto();
    await home.openFirstNews();
    await home.expectArticlePage();
  });

  test("user navigates to a Serie A club page", async ({ page }) => {
    const home = new GeHomePage(page);

    await home.goto();
    await home.openFirstSerieAClub();
    await home.expectClubNews();
  });
});

