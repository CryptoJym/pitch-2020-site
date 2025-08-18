import { test, expect } from '@playwright/test';

test.describe('Pitch 2020 site - core UX', () => {
  test('loads home page and header with progress bar attached', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('#progressBar')).toBeAttached();
  });

  test('view toggles switch sections', async ({ page }) => {
    await page.goto('/');
    const overview = page.locator('#overview-section');
    const story = page.locator('#story-section');
    const detail = page.locator('#detail-section');
    const rollout = page.locator('#rollout-section');

    await expect(overview).toHaveClass(/active/);
    await page.getByRole('button', { name: /Story Mode/ }).click();
    await expect(story).toHaveClass(/active/);
    await page.getByRole('button', { name: /Deep Dive/ }).click();
    await expect(detail).toHaveClass(/active/);
    await page.getByRole('button', { name: /Rollout/ }).click();
    await expect(rollout).toHaveClass(/active/);
  });

  test('webdeck slide navigation works (next/prev and dots)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Deep Dive/ }).click();

    // Ensure first slide is active
    await expect(page.locator('.webdeck-slide[data-slide="1"].active')).toBeVisible();

    // Click next
    await page.locator('.webdeck-slide.active .nav-button.next').first().click();
    await expect(page.locator('.webdeck-slide[data-slide="2"].active')).toBeVisible();

    // Click a dot to go to slide 5
    const dots = page.locator('.webdeck-slide.active .slide-dots .nav-dot');
    await page.locator('.webdeck-slide.active .slide-dots').scrollIntoViewIfNeeded();
    await dots.nth(4).click({ force: true });
    await expect(page.locator('.webdeck-slide[data-slide="5"].active')).toBeVisible();

    // Prev
    await page.locator('.webdeck-slide.active .nav-button.prev').first().click();
    await expect(page.locator('.webdeck-slide[data-slide="4"].active')).toBeVisible();
  });

  test('story mode navigation and progress updates', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Story Mode/ }).click();
    const progress = page.locator('#storyProgress');

    // Capture initial inline width percent (style)
    const styleBefore = await progress.evaluate((el) => el.style.width || '');
    // Click Next within story section and verify chapter advanced
    await page.locator('#story-section').getByRole('button', { name: /Next/ }).click();
    const chapter2 = page.locator('#story-section .story-chapter[data-chapter="2"]');
    await expect(chapter2).toHaveClass(/active/);
    await expect.poll(async () => progress.evaluate((el) => el.style.width || ''))
      .not.toBe(styleBefore);

    // Prev chapter
    await page.getByRole('button', { name: /Previous/ }).click();
    await expect(page.locator('.story-chapter[data-chapter="1"].active')).toBeVisible();
  });

  test('journey nodes navigate to mapped sections', async ({ page }) => {
    await page.goto('/');
    // Click Discovery node -> Deep Dive slide 1
    await page.locator('.journey-node[data-stage="1"]').click();
    await expect(page.locator('#detail-section')).toHaveClass(/active/);
    await expect(page.locator('.webdeck-slide[data-slide="1"].active')).toBeVisible();
  });

  test('progress bar grows when scrolling', async ({ page }) => {
    await page.goto('/');
    const bar = page.locator('#progressBar');
    const widthBefore = await bar.evaluate((el) => getComputedStyle(el).width);
    // Ensure page is scrollable in headless (Firefox/WebKit)
    await page.evaluate(() => {
      const filler = document.createElement('div');
      filler.style.height = '3000px';
      filler.style.width = '1px';
      filler.setAttribute('data-test', 'scroll-filler');
      document.body.appendChild(filler);
    });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    const widthAfter = await bar.evaluate((el) => getComputedStyle(el).width);
    expect(parseFloat(widthAfter)).toBeGreaterThan(parseFloat(widthBefore));
  });

  test('rollout calculator updates values', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Rollout/ }).click();
    const savings = page.locator('#savings');
    const before = await savings.textContent();
    await page.locator('#automationRate').fill('90');
    await page.locator('#automationRate').dispatchEvent('input');
    await expect(savings).not.toHaveText(before || '');
  });
});


