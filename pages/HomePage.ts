import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly searchBox: Locator;
  private readonly dismissButton: Locator;
  private readonly shippingHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.getByRole('combobox', { name: 'Search for anything' });
    this.dismissButton = page.getByRole('button', { name: 'Dismiss' });
    this.shippingHeading = page.getByRole('heading', { name: /Are you shipping to/ });
  }

  async open(url: string): Promise<void> {
    await this.navigateTo(url);
    await this.dismissPopupIfPresent();
  }

  async dismissPopupIfPresent(): Promise<void> {
    try {
      await this.shippingHeading.waitFor({ state: 'visible', timeout: 15000 });
      await this.dismissButton.first().click();
      await this.shippingHeading.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // popup did not appear - nothing to close
    }
  }

  async isOnHomePage(): Promise<boolean> {
    await this.waitForVisible(this.searchBox);
    const title = (await this.getTitle()).toLowerCase();
    return title.includes('ebay');
  }

  async searchFor(term: string): Promise<void> {
    await this.waitForVisible(this.searchBox);
    await this.fill(this.searchBox, term);
    await this.pressKey('Enter');
  }
}