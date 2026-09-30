# eBay Web Test Automation Framework

A small, data-driven UI automation framework for [eBay](https://www.ebay.com/), built with **Playwright + TypeScript** using the **Page Object Model (POM)**.

It automates this user flow:

1. Navigate to eBay and validate that the main page loaded.
2. Search for a term.
3. Validate the search results and log the number of results.
4. Filter the results from the left-hand panel using **Transmission → Manual**.

---

## Features

| Requirement | How it is met |
|---|---|
| Common browser actions | Reusable wrappers (navigate, click, fill, key press, get text, visibility/wait, title, URL) in `pages/BasePage.ts` |
| Page Object Model | One class per page (`HomePage`, `SearchResultsPage`), each extending `BasePage`; locators and page actions live in the page classes, assertions live in the test |
| Execution report | Playwright HTML report, plus a per-step breakdown, screenshot, video and trace for every run |
| No hardcoded test data | Every input (URL, search term, category path, filter) is read from `data/testData.json` |

---

## Prerequisites

- **Node.js** (current LTS or newer; developed and run on v26.3.1) and **npm**
- Internet access to `https://www.ebay.com`
- Google Chrome/Chromium (installed by Playwright in step 2 below)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Download the Playwright browser
npx playwright install chromium
```

## Running the tests

```bash
# Run the test (opens a visible browser)
npm test

# Open the HTML report of the last run
npm run report
```

The browser runs **headed** with a 500 ms slow-motion delay so the flow is easy to follow and to record. This is set in `playwright.config.ts`.

## Reports and artifacts

After a run:

| Artifact | Location |
|---|---|
| HTML report (steps, timings, annotations) | `playwright-report/` (open with `npm run report`) |
| Video, screenshot, trace of the run | `test-results/<test-name>/` (also embedded in the HTML report) |
| Console log of the results count | terminal output and the `stdout` section of the report |

The test logs lines such as:

```
Search results: 1,500,000+ results for volkswagen (parsed count: 1500000)
Results after Manual filter: 1
```

---

## Project structure

```
.
├── data/
│   └── testData.json          # all test inputs (no data is hardcoded in tests)
├── pages/
│   ├── BasePage.ts            # common browser actions shared by all pages
│   ├── HomePage.ts            # open eBay, dismiss popup, validate home page, search
│   └── SearchResultsPage.ts   # validate results, read count, select category, apply filter
├── tests/
│   └── ebay.spec.ts           # the end-to-end scenario
├── utils/
│   └── dataReader.ts          # reads and types data/testData.json
├── playwright.config.ts       # browser, video, screenshot, trace, report settings
├── tsconfig.json
└── package.json
```

## Test data

All inputs come from `data/testData.json`:

```json
{
  "baseUrl": "https://www.ebay.com/",
  "searchTerm": "volkswagen",
  "categoryPath": ["eBay Motors", "Cars & Trucks"],
  "filter": {
    "name": "Transmission",
    "value": "Manual"
  }
}
```

| Field | Meaning |
|---|---|
| `baseUrl` | Site to open |
| `searchTerm` | Text typed in the search box and validated in the results |
| `categoryPath` | Left-panel categories clicked in order before filtering |
| `filter.value` | Option selected under the Transmission filter |

To run a different scenario, edit this file only. No code changes are needed.

### Note on the search term and category path

The Transmission filter is a car-specific filter. eBay shows it only after the results are narrowed to a car category, which is why the flow clicks **eBay Motors → Cars & Trucks** before applying it. When searching for `mazda mx-5`, no car listings with a Transmission filter were available from the test location, so `volkswagen` is used instead. The recorded evidence is in `evidence/Limitations.zip`. A recording of a successful run, with screenshots and the Playwright trace, is in `evidence/Submission-records-and-screenshots.zip`. `searchTerm` can be switched back to `mazda mx-5` in `data/testData.json` at any time.

---

## How the test works

`tests/ebay.spec.ts` is one scenario split into reported steps:

1. **Open eBay and validate the main page.** Opens `baseUrl`, dismisses the "Are you shipping to…?" popup if it appears, then checks the search box is visible and the page title contains "eBay".
2. **Search.** Types `searchTerm` and presses Enter.
3. **Validate results and log the count.** Asserts that the results heading and the page title contain the search term and that the parsed count is greater than 0. Logs the count and attaches it to the report as an annotation.
4. **Navigate to the car category.** Clicks each name in `categoryPath`.
5. **Filter by Transmission → Manual.** Clicks the filter option, then asserts that the result count is greater than 0 and not larger than before, and that the URL contains the filter value.

## Extending the framework

- **New page:** add `pages/MyPage.ts`, extend `BasePage`, define locators in the constructor and expose actions as methods.
- **New scenario:** add a `tests/*.spec.ts` file, create the page objects in the test, and read inputs through `readTestData()`.
- **New data field:** add it to `data/testData.json` and to the `TestData` interface in `utils/dataReader.ts`.

Locators use Playwright's role-based queries (`getByRole`) rather than brittle CSS selectors.

---

## Known limitations

eBay is a live third-party site, so some behavior is outside the framework's control:

- **Bot protection:** eBay may redirect automated browsers to a challenge page (`/splashui/challenge`). If that happens, re-run the test; a visible (headed) browser generally passes. The framework does not attempt to bypass such checks.
- **Intermittent server errors:** eBay occasionally returns its own "Sorry, something went wrong on our end" error page, for example when opening the Cars & Trucks category. This is an eBay-side failure. Re-run the test.
- **Results vary by run and location:** the total result count and the number of Manual listings change between runs and depend on the location eBay detects, so the test asserts "greater than 0" instead of exact numbers.
- **Popup:** a location popup appears on first load and is dismissed automatically. If it loads late, the test waits up to 15 seconds for it.
- **Selectors may change:** eBay changes its markup over time, and locators may need updating.
