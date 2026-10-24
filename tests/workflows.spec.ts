import { test, expect } from "@playwright/test";

test("room tunes its frequency and offers direct routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Interdimensional",
  );
  await page
    .locator(".hero-services")
    .getByRole("button", { name: /Research/ })
    .click();
  await expect(page.locator(".scene-footnote")).toContainText(
    "RECEIVING RESEARCH SIGNAL",
  );
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("itv_frequency")))
    .toBe("Research");
  await page.reload();
  await expect(page.locator(".scene-footnote")).toContainText(
    "RECEIVING RESEARCH SIGNAL",
  );
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: /Archive/ }).click();
  await expect(page).toHaveURL(/\/catalogue$/);
  expect(errors).toEqual([]);
});

test("programme guide is searchable, navigable and closes with Escape", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("g");
  const dialog = page.getByRole("dialog", { name: /Find your signal/ });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("textbox", { name: "Search programme guide" })
    .fill("DigiStatement");
  await expect(dialog.locator(".guide-results > button")).toHaveCount(1);
  await dialog.getByRole("button", { name: /DigiStatement/ }).click();
  await expect(page).toHaveURL(/\/work\/digistatement$/);
  await expect(dialog).not.toBeVisible();
  await page.keyboard.press("g");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("archive filters, searches, resets and preserves schedule preference", async ({
  page,
}) => {
  await page.goto("/catalogue");
  await expect(page.locator(".archive-grid > a")).toHaveCount(5);
  await page.getByRole("button", { name: "Research", exact: true }).click();
  await expect(page.locator(".archive-grid > a")).toHaveCount(1);
  await expect(page.locator(".archive-grid")).toContainText("Camden Imagines");
  await page
    .getByRole("textbox", { name: "Search transmissions" })
    .fill("zzz-no-transmission");
  await expect(
    page.getByRole("heading", { name: "No signal on this frequency." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset the receiver" }).click();
  await expect(page.locator(".archive-grid > a")).toHaveCount(5);
  await page.getByRole("button", { name: "Schedule view" }).click();
  await expect(page.locator(".schedule-list > a")).toHaveCount(5);
  await page.reload();
  await expect(page.locator(".schedule-list > a")).toHaveCount(5);
  await page.locator(".signal-vault > summary").click();
  await expect(page.locator(".vault-table > div")).toHaveCount(14);
  await expect(page.locator(".vault-table a")).toHaveCount(0);
});

test("editorial reader distinguishes provenance and toggles strategic notes", async ({
  page,
}) => {
  await page.goto("/work/digistatement");
  await expect(page.locator(".source-disclosure")).toContainText(
    "new portfolio commentary, not the original article",
  );
  await expect(page.locator(".inline-note")).toHaveCount(3);
  await page.locator(".annotation-toggle").click();
  await expect(page.locator(".inline-note")).toHaveCount(0);
  await page.locator(".annotation-toggle").click();
  await expect(page.locator(".inline-note")).toHaveCount(3);
  await expect(
    page.getByRole("link", { name: "Locate original publication" }),
  ).toHaveAttribute("href", /digistatement.com/);
  await page.goto("/work/camden-imagines");
  await expect(page.locator(".source-disclosure")).toContainText(
    "no authorship is claimed",
  );
});

test("inquiry validates, composes encoded email, and retains a local draft", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Transmit a brief" }).click();
  const dialog = page.getByRole("dialog", {
    name: /Have something on your wavelength/,
  });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "jahandms60@gmail.com" }),
  ).toHaveAttribute("href", "mailto:jahandms60@gmail.com");
  await dialog.getByRole("button", { name: "Compose email" }).click();
  await expect(dialog.locator(".contact-status")).toHaveCount(0);
  expect(
    await dialog
      .locator('input[name="name"]')
      .evaluate((el: HTMLInputElement) => el.validity.valueMissing),
  ).toBe(true);
  await dialog.getByRole("textbox", { name: "Your name" }).fill("Test Client");
  await dialog
    .getByRole("textbox", { name: "Your email" })
    .fill("client@example.com");
  await dialog
    .getByRole("combobox", { name: "Choose a frequency" })
    .selectOption("Words & editorial");
  await dialog
    .getByRole("textbox", { name: "A short brief" })
    .fill("Please help clarify a complex editorial story for our new product.");
  await page.evaluate(() => {
    (window as any).__composedEmail = "";
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.href.startsWith("mailto:")) {
        (window as any).__composedEmail = this.href;
      } else originalClick.call(this);
    };
  });
  await dialog.getByRole("button", { name: "Compose email" }).click();
  await expect(dialog.getByRole("status")).toContainText(
    "Send it in your email app",
  );
  const uri = await page.evaluate(
    () => (window as any).__composedEmail as string,
  );
  expect(uri).toMatch(/^mailto:jahandms60@gmail.com\?/);
  expect(decodeURIComponent(uri)).toContain("Test Client");
  expect(decodeURIComponent(uri)).toContain("client@example.com");
  expect(decodeURIComponent(uri)).toContain("Please help clarify");
  expect(decodeURIComponent(uri)).toContain("Words & editorial");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await page.keyboard.press("c");
  await expect(dialog.getByRole("textbox", { name: "Your name" })).toHaveValue(
    "Test Client",
  );
  await expect(dialog.locator(".contact-privacy")).toContainText("restored");
  await dialog.getByRole("button", { name: "Clear draft" }).click();
  await expect(dialog.getByRole("textbox", { name: "Your name" })).toHaveValue(
    "",
  );
});

test("frequency experiment has a real completion state", async ({ page }) => {
  await page.goto("/work/game-prototype");
  const slider = page.getByRole("slider", { name: /TUNE THE RECEIVER/ });
  await slider.fill("104");
  await expect(page.locator(".frequency-game")).toContainText(
    "Signal locked. You found the next frequency.",
  );
  await expect(page.locator(".signal-number")).toHaveClass(/locked/);
  await slider.fill("90");
  await expect(page.locator(".frequency-game")).toContainText(
    "Mostly static. Keep tuning.",
  );
});

test("mobile navigation and modal focus remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services", exact: true })
    .click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Let’s talk" }).click();
  const dialog = page.getByRole("dialog", {
    name: /Have something on your wavelength/,
  });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () =>
          document.activeElement?.tagName === "BODY" ||
          !!document.activeElement?.closest("dialog[open]"),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

for (const width of [390, 1440])
  test(`all primary routes fit viewport width ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of [
      "/",
      "/catalogue",
      "/services",
      "/about",
      "/work/digistatement",
      "/work/game-prototype",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
        route,
      ).toBeLessThanOrEqual(1);
    }
  });

test("cinematic entry exposes a real guide and loads its original illustrated world", async ({page}) => {
  await page.goto("/");
  await expect(page.locator(".cinema-heading h1")).toContainText("Interdimensional");
  await expect(page.locator(".ink-wind")).toBeVisible();
  const world=page.locator('.cinema-comic-panel > img');
  await world.scrollIntoViewIfNeeded();
  await expect(world).toBeVisible();
  await expect.poll(()=>world.evaluate((image:HTMLImageElement)=>image.complete && image.naturalWidth>0)).toBe(true);
  await page.getByRole("button",{name:"Explore the work"}).click();
  await expect(page.getByRole("dialog",{name:/Find your signal/})).toBeVisible();
});

test("archive carousel tunes actual transmissions and their destination", async ({page}) => {
  await page.goto('/catalogue');
  const stage=page.getByRole('region',{name:'Featured transmissions'});
  await expect(stage.getByRole('heading',{name:'DigiStatement',exact:true})).toBeVisible();
  await expect(stage.getByRole('link',{name:'OPEN TRANSMISSION'})).toHaveAttribute('href','/work/digistatement');
  await stage.getByRole('button',{name:'Next transmission',exact:true}).click();
  await expect(stage.getByRole('heading',{name:'Camden Imagines',exact:true})).toBeVisible();
  await expect(stage.getByRole('link',{name:'OPEN TRANSMISSION'})).toHaveAttribute('href','/work/camden-imagines');
  await stage.getByRole('button',{name:'Previous transmission',exact:true}).click();
  await expect(stage.getByRole('heading',{name:'DigiStatement',exact:true})).toBeVisible();
  await stage.getByRole('button',{name:'Show MyMunshi',exact:true}).click();
  await expect(stage.getByRole('heading',{name:'MyMunshi',exact:true})).toBeVisible();
  await stage.getByRole('link',{name:'OPEN TRANSMISSION'}).click();
  await expect(page).toHaveURL(/\/work\/mymunshi$/);
});

test("redesign screenshots and first-screen title fit", async ({page}) => {
  for (const [name,width,height] of [['desktop',1440,1000],['laptop',1280,800],['mobile',390,844]] as const) {
    await page.setViewportSize({width,height});
    await page.goto('/');
    await page.evaluate(()=>document.fonts.ready);
    const title=page.locator('.cinema-heading h1');
    await expect(title).toBeVisible();
    const bounds=await title.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width+1);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y+bounds!.height).toBeLessThan(height);
    for (const line of ['.cinema-title-first','.cinema-title-second']) {
      const lineBounds=await page.locator(line).boundingBox();
      expect(lineBounds!.x,`${name} ${line} left`).toBeGreaterThanOrEqual(-1);
      expect(lineBounds!.x+lineBounds!.width,`${name} ${line} right`).toBeLessThanOrEqual(width+1);
    }
    await page.screenshot({path:`/tmp/itv-redesign-${name}-top.png`});
    if(name!=='laptop') await page.screenshot({path:`/tmp/itv-redesign-${name}.png`,fullPage:true});
  }
});
