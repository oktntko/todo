import type { TrpcPaths } from '@todo/express';

import { expect, test } from '@playwright/test';

import type { RouterOutput } from '~/lib/trpc';

import {
  jsonStringifyTrpcErrorResponse,
  jsonStringifyTrpcSuccessResponse,
  screenshotPath,
} from '../helper';

test.describe('signin.vue', () => {
  test('should be able to log in with valid credentials.', async ({ page }, testInfo) => {
    // #region arrange
    await page.goto('/signin');

    // 必須項目を入力する
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password');

    // mock API
    await page.route('**/api/trpc/' + ('auth.signin' satisfies TrpcPaths), (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse({
          auth: true,
        } satisfies RouterOutput['auth']['signin']),
      });
    });
    await page.route('**/api/trpc/' + ('space.list' satisfies TrpcPaths) + '?**', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse([] satisfies RouterOutput['space']['list']),
      });
    });
    // #endregion

    // act
    await page.screenshot({ path: screenshotPath(testInfo) });
    await page.locator('button[type="submit"]').click();

    // #region assert
    // ホームページに遷移すること
    await expect(page).toHaveURL('/space');

    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion
  });
  test('should be unable to log in with invalid credentials.', async ({ page }, testInfo) => {
    // #region arrange
    // mock API before navigation
    await page.route('**/api/trpc/' + ('auth.signin' satisfies TrpcPaths), (route) => {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: jsonStringifyTrpcErrorResponse(),
      });
    });

    await page.goto('/signin');

    // 必須項目を入力する
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password');
    // #endregion

    // act
    await page.screenshot({ path: screenshotPath(testInfo) });
    await page.locator('button[type="submit"]').click();

    // #region assert
    // エラーメッセージが表示されること
    await expect(page.locator('body')).toContainText('[test] Error Message.');

    // ホームページに遷移していないこと
    await expect(page).toHaveURL('/signin');

    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion
  });
});
