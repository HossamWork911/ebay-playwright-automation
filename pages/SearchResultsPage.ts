import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  private readonly resultsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsHeading = page.getByRole('heading', { name: /results? for/i }).first();
  }

  async getResultsHeadingText(): Promise<string> {
    await this.waitForVisible(this.resultsHeading);
    return this.getText(this.resultsHeading);
  }

  async getResultsCount(): Promise<number> {
    const text = await this.getResultsHeadingText();
    const match = text.match(/([\d,]+)/);
    if (!match) {
      throw new Error(`Could not read a result count from: "${text}"`);
    }
    return parseInt(match[1].replace(/,/g, ''), 10);
  }

  async headingContainsTerm(term: string): Promise<boolean> {
    const text = (await this.getResultsHeadingText()).toLowerCase();
    return text.includes(term.toLowerCase());
  }

  async pageTitleContainsTerm(term: string): Promise<boolean> {
    const title = (await this.getTitle()).toLowerCase();
    return title.includes(term.toLowerCase());
  }

  async selectCategory(name: string): Promise<void> {
    const link = this.page.getByRole('link', { name }).first();
    await this.waitForVisible(link);
    await this.click(link);
    await this.waitForPageLoad();
  }

  async applyFilter(value: string): Promise<void> {
    const option = this.page
      .getByRole('link', { name: new RegExp(`^${value}\\b`, 'i') })
      .first();
    await this.waitForVisible(option);
    await this.click(option);
    await this.waitForPageLoad();
  }
}