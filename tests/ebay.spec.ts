import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { readTestData } from '../utils/dataReader';

const data = readTestData();

test('eBay: search and filter by Transmission', async ({ page }) => {
  const home = new HomePage(page);
  const results = new SearchResultsPage(page);

  await test.step('Open eBay and validate the main page', async () => {
    await home.open(data.baseUrl);
    expect(await home.isOnHomePage()).toBe(true);
  });

  await test.step(`Search for "${data.searchTerm}"`, async () => {
    await home.searchFor(data.searchTerm);
  });

  let countBefore = 0;
  await test.step('Validate the search results and log the count', async () => {
    expect(await results.headingContainsTerm(data.searchTerm)).toBe(true);
    expect(await results.pageTitleContainsTerm(data.searchTerm)).toBe(true);

    countBefore = await results.getResultsCount();
    const headingText = await results.getResultsHeadingText();
    console.log(`Search results: ${headingText} (parsed count: ${countBefore})`);
    test.info().annotations.push({ type: 'results', description: headingText });
    expect(countBefore).toBeGreaterThan(0);
  });

  await test.step('Navigate to the car category', async () => {
    for (const category of data.categoryPath) {
      await results.selectCategory(category);
    }
  });

  await test.step(`Filter by ${data.filter.name} -> ${data.filter.value}`, async () => {
    await results.applyFilter(data.filter.value);
    const countAfter = await results.getResultsCount();
    console.log(`Results after ${data.filter.value} filter: ${countAfter}`);
    expect(countAfter).toBeGreaterThan(0);
    expect(countAfter).toBeLessThanOrEqual(countBefore);
    expect(await results.getUrl()).toMatch(new RegExp(data.filter.value, 'i'));
  });
});