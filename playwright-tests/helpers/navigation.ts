import { Page, expect } from "@playwright/test";

/**
 * Navigate to a page by clicking a sidebar nav item.
 * Handles expanding nav groups if needed.
 */
export async function navigateToNavItem(
  page: Page,
  itemId: string
): Promise<void> {
  const navItem = page.getByTestId(`nav-${itemId}`);

  // If visible, click it directly
  if (await navItem.isVisible({ timeout: 2000 }).catch(() => false)) {
    await navItem.click();
    await page.waitForLoadState("networkidle");
    return;
  }

  // It might be in a collapsed group — try expanding parent groups
  const groups = page.locator('[data-testid^="nav-group-"]');
  const groupCount = await groups.count();
  for (let i = 0; i < groupCount; i++) {
    const group = groups.nth(i);
    await group.click();
    await page.waitForTimeout(300);

    if (await navItem.isVisible({ timeout: 500 }).catch(() => false)) {
      await navItem.click();
      await page.waitForLoadState("networkidle");
      return;
    }
  }

  throw new Error(`Nav item "${itemId}" not found in sidebar`);
}

/**
 * Check that a nav item exists in the sidebar
 */
export async function navItemExists(
  page: Page,
  itemId: string
): Promise<boolean> {
  // Check direct nav items
  const directItem = page.getByTestId(`nav-${itemId}`);
  if (await directItem.isVisible({ timeout: 500 }).catch(() => false)) {
    return true;
  }

  // Check nav groups
  const groupItem = page.getByTestId(`nav-group-${itemId}`);
  if (await groupItem.isVisible({ timeout: 500 }).catch(() => false)) {
    return true;
  }

  return false;
}

/**
 * Get all visible nav item IDs from the sidebar
 */
export async function getVisibleNavIds(page: Page): Promise<string[]> {
  const ids: string[] = [];

  // Get direct nav items
  const navItems = page.locator('[data-testid^="nav-"]');
  const count = await navItems.count();
  for (let i = 0; i < count; i++) {
    const testId = await navItems.nth(i).getAttribute("data-testid");
    if (testId) {
      ids.push(testId);
    }
  }

  return ids;
}

/**
 * Verify user is on the expected page by checking the page data-testid
 */
export async function expectPageVisible(
  page: Page,
  pageTestId: string,
  timeout = 15000
): Promise<void> {
  await expect(page.getByTestId(pageTestId)).toBeVisible({ timeout });
}
