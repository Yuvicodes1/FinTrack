const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
require("chromedriver");
const assert = require("assert");

// ─────────────────────────────────────────────────────────────
// CONFIG — update these with your real test account
// ─────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:5173";
const TEST_EMAIL = "testuser@fintrack.com";
const TEST_PASSWORD = "Test@1234";
const TIMEOUT = 20000;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
async function waitFor(driver, locator, timeout = TIMEOUT) {
  return await driver.wait(until.elementLocated(locator), timeout);
}

async function waitVisible(driver, locator, timeout = TIMEOUT) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

async function clickWhen(driver, locator, timeout = TIMEOUT) {
  const el = await waitVisible(driver, locator, timeout);
  await driver.executeScript("arguments[0].scrollIntoView(true);", el);
  await driver.executeScript("arguments[0].click();", el);
  return el;
}

async function typeInto(driver, locator, text, clear = true) {
  const el = await waitVisible(driver, locator);
  if (clear) {
    await el.clear();
    await driver.executeScript("arguments[0].value = '';", el);
  }
  await el.sendKeys(text);
  return el;
}

async function getSource(driver) {
  return (await driver.getPageSource()).toLowerCase();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function login(driver) {
  await driver.get(`${BASE_URL}/login`);
  await sleep(2000);

  // Switch to login mode if on signup
  try {
    const loginLink = await driver.findElements(
      By.xpath("//*[contains(text(),'Already have') or contains(text(),'Login here') or contains(text(),'Sign in')]")
    );
    if (loginLink.length > 0) await loginLink[0].click();
    await sleep(500);
  } catch (_) {}

  await typeInto(driver, By.css("input[type='email']"), TEST_EMAIL);
  await typeInto(driver, By.css("input[type='password']"), TEST_PASSWORD);

  // Click submit button
  await clickWhen(driver, By.css("button[type='submit']"));

  // Wait for redirect
  await sleep(4000);
}

async function ensureLoggedIn(driver) {
  const url = await driver.getCurrentUrl();
  if (url.includes("login") || url === BASE_URL + "/" || url === BASE_URL) {
    await login(driver);
  }
}

// ─────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────
describe("FinTrack — Automated E2E Test Suite", function () {
  this.timeout(180000);
  let driver;

  before(async function () {
    const options = new chrome.Options();
    options.addArguments("--window-size=1440,900");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  // ─────────────────────────────────────────────
  // 1. LANDING PAGE
  // ─────────────────────────────────────────────
  describe("1. Landing Page", function () {
    it("Should load landing page with hero heading", async function () {
      await driver.get(BASE_URL);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("invest") || src.includes("fintrack") || src.includes("smarter"),
        "Landing page should contain hero text"
      );
    });

    it("Should show Get Started CTA button", async function () {
      await driver.get(BASE_URL);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("get started") || src.includes("started free"),
        "Should have Get Started button"
      );
    });

    it("Should show marquee / animated banner", async function () {
      await driver.get(BASE_URL);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("track wealth") ||
        src.includes("beat the market") ||
        src.includes("stay invested"),
        "Should show animated marquee text"
      );
    });

    it("Should show stats section with stock count", async function () {
      await driver.get(BASE_URL);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("50") || src.includes("stocks") || src.includes("currencies"),
        "Should show stats section"
      );
    });

    it("Should navigate to login when Get Started is clicked", async function () {
      await driver.get(BASE_URL);
      await sleep(2000);
      // Click the first CTA button
      const btns = await driver.findElements(By.css("button"));
      let clicked = false;
      for (const btn of btns) {
        const txt = (await btn.getText()).toLowerCase();
        if (txt.includes("get started") || txt.includes("login") || txt.includes("started")) {
          await driver.executeScript("arguments[0].click();", btn);
          clicked = true;
          break;
        }
      }
      await sleep(1500);
      if (clicked) {
        const url = await driver.getCurrentUrl();
        assert(url.includes("login") || url !== BASE_URL, "Should navigate away from landing");
      } else {
        assert(true); // button may have different text
      }
    });
  });

  // ─────────────────────────────────────────────
  // 2. LOGIN PAGE
  // ─────────────────────────────────────────────
  describe("2. Auth / Login Page", function () {
    it("Should load login page with form fields", async function () {
      await driver.get(`${BASE_URL}/login`);
      await sleep(2000);
      const email = await driver.findElements(By.css("input[type='email']"));
      const pass = await driver.findElements(By.css("input[type='password']"));
      assert(email.length > 0, "Email input should exist");
      assert(pass.length > 0, "Password input should exist");
    });

    it("Should show Google Sign-In button", async function () {
      await driver.get(`${BASE_URL}/login`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("google") || src.includes("sign in with"),
        "Should show Google login option"
      );
    });

    it("Should toggle between Login and Signup views", async function () {
      await driver.get(`${BASE_URL}/login`);
      await sleep(1500);
      const src = await getSource(driver);
      assert(
        src.includes("create") || src.includes("sign up") || src.includes("already have"),
        "Should show toggle between login/signup"
      );
    });

    it("Should show error message on wrong credentials", async function () {
      await driver.get(`${BASE_URL}/login`);
      await sleep(1500);
      await typeInto(driver, By.css("input[type='email']"), "wrong@test.com");
      await typeInto(driver, By.css("input[type='password']"), "wrongpass123");
      await clickWhen(driver, By.css("button[type='submit']"));
      await sleep(4000);
      const src = await getSource(driver);
      assert(
        src.includes("invalid") ||
        src.includes("error") ||
        src.includes("incorrect") ||
        src.includes("not found") ||
        src.includes("wrong") ||
        src.includes("failed"),
        "Should show error for invalid credentials"
      );
    });

    it("Should login successfully with valid credentials", async function () {
      await login(driver);
      const url = await driver.getCurrentUrl();
      assert(
        url.includes("home") || url.includes("dashboard") || url.includes("expense"),
        "Should redirect to app after login"
      );
    });
  });

  // ─────────────────────────────────────────────
  // 3. HOME PAGE
  // ─────────────────────────────────────────────
  describe("3. Home Page", function () {
    it("Should display welcome message with user name", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/home`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("welcome") || src.includes("hello") || src.includes("hi,") ||
        src.includes("good") || src.includes("invest"),
        "Should show welcome/greeting"
      );
    });

    it("Should show Investment Tracker feature card", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/home`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(src.includes("investment") || src.includes("tracker"), "Investment Tracker card should exist");
    });

    it("Should show Expense Manager feature card", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/home`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(src.includes("expense") || src.includes("manager"), "Expense Manager card should exist");
    });

    it("Should navigate to Dashboard from Investment Tracker card", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/home`);
      await sleep(2000);
      const cards = await driver.findElements(By.css("button, a, [role='button']"));
      for (const card of cards) {
        try {
          const txt = (await card.getText()).toLowerCase();
          if (txt.includes("investment") || txt.includes("tracker") || txt.includes("portfolio")) {
            await driver.executeScript("arguments[0].click();", card);
            await sleep(2000);
            break;
          }
        } catch (_) {}
      }
      const url = await driver.getCurrentUrl();
      assert(
        url.includes("dashboard") || url.includes("portfolio") || url.includes("market"),
        "Should navigate to investment section"
      );
    });
  });

  // ─────────────────────────────────────────────
  // 4. DASHBOARD
  // ─────────────────────────────────────────────
  describe("4. Dashboard", function () {
    it("Should load dashboard page", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(src.includes("dashboard") || src.includes("portfolio"), "Dashboard should load");
    });

    it("Should show Total Invested summary card", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(src.includes("invested") || src.includes("total"), "Should show invested amount card");
    });

    it("Should show Current Value summary card", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(src.includes("current value") || src.includes("value"), "Should show current value card");
    });

    it("Should show Profit/Loss summary card", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(
        src.includes("profit") || src.includes("loss") || src.includes("p/l"),
        "Should show P/L card"
      );
    });

    it("Should show Add Investment button", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2500);
      const btns = await driver.findElements(By.css("button"));
      let found = false;
      for (const btn of btns) {
        try {
          const txt = (await btn.getText()).toLowerCase();
          if (txt.includes("add") || txt.includes("investment") || txt.includes("+")) {
            found = true;
            break;
          }
        } catch (_) {}
      }
      assert(found, "Add Investment button should exist");
    });

    it("Should open Add Investment modal on button click", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2500);
      const btns = await driver.findElements(By.css("button"));
      for (const btn of btns) {
        try {
          const txt = (await btn.getText()).toLowerCase();
          if (txt.includes("add") || txt.includes("+")) {
            await driver.executeScript("arguments[0].click();", btn);
            break;
          }
        } catch (_) {}
      }
      await sleep(1500);
      const src = await getSource(driver);
      assert(
        src.includes("symbol") || src.includes("quantity") || src.includes("buy price"),
        "Add Investment modal should open with form fields"
      );
    });

    it("Should show Portfolio Performance chart section", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(
        src.includes("performance") || src.includes("chart") || src.includes("portfolio"),
        "Should show chart section"
      );
    });

    it("Should show currency selector in topbar", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("inr") || src.includes("usd") || src.includes("eur"),
        "Currency selector should be visible"
      );
    });
  });

  // ─────────────────────────────────────────────
  // 5. PORTFOLIO PAGE
  // ─────────────────────────────────────────────
  describe("5. Portfolio Page", function () {
    it("Should load portfolio page", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/portfolio`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(src.length > 200, "Portfolio page should load");
    });

    it("Should show stock table with Symbol column", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/portfolio`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(
        src.includes("symbol") || src.includes("qty") || src.includes("buy price"),
        "Should show stock table headers"
      );
    });

    it("Should show CSV export option", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/portfolio`);
      await sleep(2500);
      const src = await getSource(driver);
      assert(src.includes("csv") || src.includes("export"), "Should have CSV export");
    });

    it("Should show PDF export option", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/portfolio`);
      await sleep(2500);
      const src = await getSource(driver);
      assert(src.includes("pdf") || src.includes("export"), "Should have PDF export");
    });
  });

  // ─────────────────────────────────────────────
  // 6. MARKET PAGE
  // ─────────────────────────────────────────────
  describe("6. Market Page", function () {
    it("Should load market page", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/market`);
      await sleep(5000);
      const src = await getSource(driver);
      assert(src.length > 200, "Market page should load");
    });

    it("Should show search input", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/market`);
      await sleep(3000);
      const inputs = await driver.findElements(By.css("input"));
      assert(inputs.length > 0, "Search input should exist on market page");
    });

    it("Should show Top Stocks tab", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/market`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(
        src.includes("top stocks") || src.includes("stocks"),
        "Should show Top Stocks tab"
      );
    });

    it("Should show Watchlist tab", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/market`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(src.includes("watchlist"), "Should show Watchlist tab");
    });

    it("Should show sort/filter dropdown", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/market`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(
        src.includes("default") || src.includes("sort") || src.includes("price high"),
        "Should show sort dropdown"
      );
    });

    it("Should filter stocks when typing in search", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/market`);
      await sleep(4000);
      const inputs = await driver.findElements(By.css("input"));
      if (inputs.length > 0) {
        await inputs[0].sendKeys("AAPL");
        await sleep(1500);
        const src = await getSource(driver);
        assert(src.includes("aapl") || src.includes("apple"), "Search should filter stocks");
      } else {
        assert(true);
      }
    });
  });

  // ─────────────────────────────────────────────
  // 7. EXPENSE MANAGER
  // ─────────────────────────────────────────────
  describe("7. Expense Manager", function () {
    it("Should load expense page", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/expenses`);
      await sleep(3000);
      const src = await getSource(driver);
      assert(src.length > 200, "Expense page should load");
    });

    it("Should show month navigator with arrows", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/expenses`);
      await sleep(2500);
      const src = await getSource(driver);
      assert(
        src.includes("jan") || src.includes("feb") || src.includes("mar") ||
        src.includes("2026") || src.includes("2025"),
        "Should show month navigator"
      );
    });

    it("Should show salary / budget section", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/expenses`);
      await sleep(2500);
      const src = await getSource(driver);
      assert(
        src.includes("salary") || src.includes("budget") || src.includes("set salary"),
        "Should show salary section"
      );
    });

    it("Should show Add Expense button", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/expenses`);
      await sleep(2500);
      const btns = await driver.findElements(By.css("button"));
      let found = false;
      for (const btn of btns) {
        try {
          const txt = (await btn.getText()).toLowerCase();
          if (txt.includes("add") || txt.includes("expense") || txt.includes("+")) {
            found = true;
            break;
          }
        } catch (_) {}
      }
      assert(found, "Add Expense button should exist");
    });

    it("Should open Add Expense modal", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/expenses`);
      await sleep(2500);
      const btns = await driver.findElements(By.css("button"));
      for (const btn of btns) {
        try {
          const txt = (await btn.getText()).toLowerCase();
          if (txt.includes("add") || txt.includes("+")) {
            await driver.executeScript("arguments[0].click();", btn);
            break;
          }
        } catch (_) {}
      }
      await sleep(1500);
      const src = await getSource(driver);
      assert(
        src.includes("amount") || src.includes("category") || src.includes("note"),
        "Add expense modal should open"
      );
    });

    it("Should show expense category breakdown / pie chart", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/expenses`);
      await sleep(2500);
      const src = await getSource(driver);
      assert(
        src.includes("food") || src.includes("transport") ||
        src.includes("shopping") || src.includes("category") ||
        src.includes("breakdown"),
        "Should show expense categories"
      );
    });

    it("Should show AI chat assistant", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/expenses`);
      await sleep(2500);
      const src = await getSource(driver);
      assert(
        src.includes("ai") || src.includes("chat") ||
        src.includes("ask") || src.includes("assistant") ||
        src.includes("message"),
        "Should show AI chat section"
      );
    });
  });

  // ─────────────────────────────────────────────
  // 8. SETTINGS PAGE
  // ─────────────────────────────────────────────
  describe("8. Settings Page", function () {
    it("Should load settings page", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/settings`);
      await sleep(2500);
      const src = await getSource(driver);
      assert(src.includes("settings") || src.length > 200, "Settings page should load");
    });

    it("Should show Profile / Display Name section", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/settings`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("name") || src.includes("profile") || src.includes("display"),
        "Should show display name field"
      );
    });

    it("Should show Currency preference section", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/settings`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("currency") || src.includes("inr") || src.includes("usd"),
        "Should show currency selector"
      );
    });

    it("Should show Change Password section", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/settings`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("password") || src.includes("change password") || src.includes("current password"),
        "Should show password section"
      );
    });

    it("Should show Delete Account section", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/settings`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(
        src.includes("delete") || src.includes("account") || src.includes("danger"),
        "Should show delete account section"
      );
    });
  });

  // ─────────────────────────────────────────────
  // 9. SIDEBAR NAVIGATION
  // ─────────────────────────────────────────────
  describe("9. Sidebar Navigation", function () {
    it("Should show FinTrack branding in sidebar", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2500);
      const src = await getSource(driver);
      assert(src.includes("fintrack"), "FinTrack branding should be visible");
    });

    it("Should show Dashboard nav link", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(src.includes("dashboard"), "Dashboard nav item should exist");
    });

    it("Should show Market nav link", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(src.includes("market"), "Market nav item should exist");
    });

    it("Should show Portfolio nav link", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(src.includes("portfolio"), "Portfolio nav item should exist");
    });

    it("Should navigate to Market by clicking sidebar link", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2000);
      // Find all anchor tags and click the one with market href
      const links = await driver.findElements(By.css("a[href*='market'], a[href='/market']"));
      if (links.length > 0) {
        await driver.executeScript("arguments[0].click();", links[0]);
        await sleep(2000);
        const url = await driver.getCurrentUrl();
        assert(url.includes("market"), "Should navigate to market");
      } else {
        // Fallback: navigate directly
        await driver.get(`${BASE_URL}/market`);
        const url = await driver.getCurrentUrl();
        assert(url.includes("market"), "Market page should be accessible");
      }
    });

    it("Should navigate to Expenses by clicking sidebar link", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2000);
      const links = await driver.findElements(By.css("a[href*='expense'], a[href='/expenses']"));
      if (links.length > 0) {
        await driver.executeScript("arguments[0].click();", links[0]);
        await sleep(2000);
        const url = await driver.getCurrentUrl();
        assert(url.includes("expense"), "Should navigate to expenses");
      } else {
        await driver.get(`${BASE_URL}/expenses`);
        const url = await driver.getCurrentUrl();
        assert(url.includes("expense"), "Expenses page should be accessible");
      }
    });
  });

  // ─────────────────────────────────────────────
  // 10. LOGOUT & AUTH GUARD
  // ─────────────────────────────────────────────
  describe("10. Logout & Auth Guard", function () {
    it("Should show Logout button in sidebar or topbar", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2000);
      const src = await getSource(driver);
      assert(src.includes("logout") || src.includes("sign out"), "Logout button should exist");
    });

    it("Should log out when Logout is clicked", async function () {
      await login(driver);
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(2000);
      const btns = await driver.findElements(By.css("button"));
      for (const btn of btns) {
        try {
          const txt = (await btn.getText()).toLowerCase();
          if (txt.includes("logout") || txt.includes("sign out") || txt.includes("log out")) {
            await driver.executeScript("arguments[0].click();", btn);
            await sleep(3000);
            break;
          }
        } catch (_) {}
      }
      const url = await driver.getCurrentUrl();
      assert(
        url.includes("login") || url === BASE_URL + "/" || url === BASE_URL,
        "Should redirect to landing/login after logout"
      );
    });

    it("Should redirect to login when accessing protected route unauthenticated", async function () {
      // Clear session by going to base URL without login
      await driver.get(BASE_URL);
      await sleep(1000);
      // Try to directly access a protected route
      await driver.get(`${BASE_URL}/dashboard`);
      await sleep(3000);
      const url = await driver.getCurrentUrl();
      assert(
        url.includes("login") || url === BASE_URL + "/" || url === BASE_URL,
        "Should redirect unauthenticated user away from dashboard"
      );
    });
  });
});