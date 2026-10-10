import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

export async function verifyRevampBrowser(browser) {
  const reference = await readFile(
    new URL(
      "../skills/parallax-effect-pro/references/revamp.md",
      import.meta.url,
    ),
    "utf8",
  );
  const html = reference.match(/```html\n([\s\S]*?)\n```/)?.[1];
  assert.ok(html, "Revamp reference must contain its runnable example");
  const page = await browser.newPage({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.setContent(html);
    await page.locator("#deck").evaluate((el) => {
      el.scrollTop = 450;
    });
    await page.waitForFunction(
      () =>
        new DOMMatrix(
          getComputedStyle(document.getElementById("art")).transform,
        ).m42 > 0,
    );
    assert.equal(await page.evaluate(() => window.scrollY), 0);
    await page.locator("#deck").evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.waitForFunction(
      () =>
        document.getElementById("art").style.getPropertyValue("--revamp-y") ===
        "0px",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#deck").evaluate((el) => {
      el.scrollTop = 450;
    });
    await page.waitForFunction(
      () =>
        document.getElementById("art").style.getPropertyValue("--revamp-y") ===
        "0px",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForFunction(
      () =>
        parseFloat(
          document.getElementById("art").style.getPropertyValue("--revamp-y"),
        ) > 0,
    );
    const beforeResize = await page
      .locator("#art")
      .evaluate((el) => parseFloat(el.style.getPropertyValue("--revamp-y")));
    await page.locator("#content").evaluate((el) => {
      el.style.minHeight = "2000px";
    });
    await page.waitForFunction(
      (previous) =>
        parseFloat(
          document.getElementById("art").style.getPropertyValue("--revamp-y"),
        ) < previous,
      beforeResize,
    );
    await page.getByRole("button", { name: "Dispose motion" }).click();
    await page.locator("#deck").evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    assert.equal(
      await page
        .locator("#art")
        .evaluate((el) => el.style.getPropertyValue("--revamp-y")),
      "",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("about:blank");
    await page.setContent(html);
    assert.equal(
      await page
        .locator("#art")
        .evaluate((el) => el.style.getPropertyValue("--revamp-y")),
      "0px",
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
    assert.deepEqual(errors, []);
    return {
      nestedScroll: "passed",
      reverse: "passed",
      contentResize: "passed",
      reducedMotion: "initial and live",
      disposal: "passed",
      mobile: "390x844 emulation",
      errors,
    };
  } finally {
    await page.close();
  }
}
