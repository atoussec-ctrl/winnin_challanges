import { expect, type Locator, type Page } from "@playwright/test";

export class GeHomePage {
  public constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    // domcontentloaded evita esperar por anuncios/trackers de terceiros que
    // atrasam o evento "load" da pagina bem alem do timeout do teste.
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
  }

  public newsCards(): Locator {
    return this.page.locator("article, [data-testid*='card'], .feed-post").filter({
      has: this.page.locator("a")
    });
  }

  // O feed da home usa scroll infinito: sem rolar, poucos cards sao
  // renderizados no DOM inicial (a pagina carrega mais sob demanda).
  public async loadMoreNews(steps = 3): Promise<void> {
    for (let index = 0; index < steps; index++) {
      await this.page.mouse.wheel(0, 1500);
      await this.page.waitForTimeout(800);
    }
  }

  public async expectAtLeastNewsCards(count: number): Promise<void> {
    await expect(this.newsCards().first()).toBeVisible();
    await this.loadMoreNews();
    await expect.poll(async () => this.newsCards().count()).toBeGreaterThanOrEqual(count);
  }

  public async expectNewsContentIsComplete(sampleSize = 10): Promise<void> {
    const cards = this.newsCards();

    for (let index = 0; index < sampleSize; index++) {
      const card = cards.nth(index);
      await expect(card.locator("a").first()).toBeVisible();
      await expect(card.locator("img").first()).toBeVisible();
      await expect(card.locator("p, h2, h3").first()).toBeVisible();
    }
  }

  // Alguns cards do feed sao destaques de video (tocam inline em vez de
  // navegar); "abrir uma noticia" precisa mirar um card de materia de texto,
  // identificado pelo link do titulo apontando para uma pagina /noticia/.
  public articleCards(): Locator {
    return this.page
      .locator("article, .feed-post")
      .filter({ has: this.page.locator(".feed-post-body-title h2 a[href*='/noticia/']") });
  }

  public async openFirstNews(): Promise<void> {
    await this.loadMoreNews();
    await this.articleCards().first().locator(".feed-post-body-title h2 a").first().click();
  }

  public async expectArticlePage(): Promise<void> {
    await expect(this.page).toHaveURL(/ge\.globo\.com\/.+/);
    await expect(this.page.locator("h1").first()).toBeVisible();
  }

  // Lista ampla de clubes tradicionais da Serie A: a home muda de manchetes o
  // tempo todo, entao restringir a poucos nomes torna o teste refem de qual
  // time estiver em destaque no momento da execucao.
  private static readonly SERIE_A_CLUBS =
    /Flamengo|Palmeiras|Sao Paulo|S[aã]o Paulo|Corinthians|Santos|Gremio|Gr[eê]mio|Internacional|Cruzeiro|Atl[ée]tico-MG|Botafogo|Fluminense|Vasco|Bahia|Fortaleza|Cear[aá]|Bragantino|Mirassol|Vit[oó]ria|Juventude/i;

  public async openFirstSerieAClub(): Promise<void> {
    await this.loadMoreNews();
    const clubLink = this.page
      .getByRole("link")
      .filter({ hasText: GeHomePage.SERIE_A_CLUBS })
      .first();

    await clubLink.click();
  }

  public async expectClubNews(): Promise<void> {
    await expect(this.page.locator("h1, h2").first()).toBeVisible();
    await expect(this.newsCards().first()).toBeVisible();
  }
}


