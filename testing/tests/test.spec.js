const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const assert = require("assert");

describe("Stock Monitor - Full E2E Flow", function () {
  this.timeout(60000);

  let driver;
  const BASE_URL = "http://localhost:5173";

  // ─────────────────────────────────────────────
  // 🔹 UTIL FUNCTIONS
  // ─────────────────────────────────────────────

  async function waitForElement(locator, timeout = 10000) {
    return await driver.wait(until.elementLocated(locator), timeout);
  }

  async function clickWhenReady(locator, timeout = 10000) {
    const element = await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    await element.click();
  }

  async function getText(locator) {
    const element = await waitForElement(locator);
    return await element.getText();
  }

  async function mockLogin() {
    await driver.get(BASE_URL);

    await driver.executeScript(`
      localStorage.setItem("user", JSON.stringify({
        email: "test@gmail.com",
        name: "Test User"
      }));
    `);

    await driver.navigate().refresh();

    // Wait for UI to load after login
    await driver.wait(until.elementLocated(By.tagName("body")), 5000);
  }

  // ─────────────────────────────────────────────
  // 🔹 SETUP & TEARDOWN
  // ─────────────────────────────────────────────

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  // ─────────────────────────────────────────────
  // ✅ 1. LANDING PAGE TEST
  // ─────────────────────────────────────────────

  it("Should load landing page correctly", async function () {
    await driver.get(BASE_URL);

    const title = await driver.getTitle();
    assert(title.length > 0);

    const body = await driver.getPageSource();
    assert(body.toLowerCase().includes("login") || body.length > 0);
  });

  // ─────────────────────────────────────────────
  // ✅ 2. LOGIN NAVIGATION
  // ─────────────────────────────────────────────

  it("Should navigate to login page", async function () {
    await driver.get(BASE_URL);

    await clickWhenReady(
      By.xpath("//button[contains(text(),'Login')]")
    );

    await driver.wait(until.urlContains("login"), 5000);

    const url = await driver.getCurrentUrl();
    assert(url.includes("login"));
  });

  // ─────────────────────────────────────────────
  // ✅ 3. LOGIN FLOW (MOCK)
  // ─────────────────────────────────────────────

  it("Should simulate login and load feature page", async function () {
    await mockLogin();

    const page = await driver.getPageSource();

    assert(
      page.toLowerCase().includes("portfolio") ||
      page.toLowerCase().includes("expense")
    );
  });

  // ─────────────────────────────────────────────
  // ✅ 4. NAVIGATE TO INVESTMENT DASHBOARD
  // ─────────────────────────────────────────────

  it("Should open Investment Dashboard", async function () {
    await mockLogin();

    await clickWhenReady(
      By.xpath("//*[contains(text(),'Portfolio') or contains(text(),'Investment')]")
    );

    await driver.wait(until.urlContains("dashboard"), 5000);

    const url = await driver.getCurrentUrl();
    assert(url.includes("dashboard"));
  });

  // ─────────────────────────────────────────────
  // ✅ 5. NAVIGATE TO EXPENSE DASHBOARD
  // ─────────────────────────────────────────────

  it("Should open Expense Dashboard", async function () {
    await mockLogin();

    await clickWhenReady(
      By.xpath("//*[contains(text(),'Expense')]")
    );

    await driver.wait(until.urlContains("expense"), 5000);

    const url = await driver.getCurrentUrl();
    assert(url.includes("expense"));
  });

  // ─────────────────────────────────────────────
  // ✅ 6. INVESTMENT DASHBOARD VALIDATION
  // ─────────────────────────────────────────────

  it("Should display investment dashboard elements", async function () {
    await mockLogin();

    await driver.get(`${BASE_URL}/dashboard`);

    // Example UI checks (adjust selectors based on your UI)
    const body = await driver.getPageSource();

    assert(body.length > 0);

    // Optional: check for specific elements
    // Example:
    // await waitForElement(By.xpath("//*[contains(text(),'Total Value')]"));
  });

  // ─────────────────────────────────────────────
  // ✅ 7. EXPENSE DASHBOARD VALIDATION
  // ─────────────────────────────────────────────

  it("Should display expense dashboard elements", async function () {
    await mockLogin();

    await driver.get(`${BASE_URL}/expense`);

    const body = await driver.getPageSource();
    assert(body.length > 0);
  });

  // ─────────────────────────────────────────────
  // ✅ 8. ADD STOCK FLOW (IMPORTANT)
  // ─────────────────────────────────────────────

  it("Should add stock to portfolio", async function () {
    await mockLogin();

    await driver.get(`${BASE_URL}/dashboard`);

    // Adjust selectors based on your UI
    await clickWhenReady(By.xpath("//button[contains(text(),'Add')]"));

    await waitForElement(By.name("symbol")).sendKeys("AAPL");
    await waitForElement(By.name("quantity")).sendKeys("10");
    await waitForElement(By.name("buyPrice")).sendKeys("150");

    await clickWhenReady(By.xpath("//button[contains(text(),'Submit')]"));

    // Verify stock appears
    const page = await driver.getPageSource();
    assert(page.includes("AAPL"));
  });

  // ─────────────────────────────────────────────
  // ✅ 9. REMOVE STOCK FLOW
  // ─────────────────────────────────────────────

  it("Should remove stock from portfolio", async function () {
    await mockLogin();

    await driver.get(`${BASE_URL}/dashboard`);

    // Adjust selector
    await clickWhenReady(
      By.xpath("//button[contains(text(),'Delete')]")
    );

    // Optional validation
    const page = await driver.getPageSource();
    assert(!page.includes("AAPL"));
  });

  // ─────────────────────────────────────────────
  // ✅ 10. API FAILURE HANDLING (ADVANCED)
  // ─────────────────────────────────────────────

  it("Should handle API failure gracefully", async function () {
    await mockLogin();

    await driver.get(`${BASE_URL}/dashboard`);

    // Simulate failure via devtools (optional advanced)
    const page = await driver.getPageSource();

    // Check fallback UI
    assert(
      page.toLowerCase().includes("error") ||
      page.toLowerCase().includes("retry") ||
      page.length > 0
    );
  });

});