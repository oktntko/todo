import { expect, test } from '@playwright/test';
import type { TrpcPaths } from '@todo/express';
import { jsonStringifyTrpcSuccessResponse, screenshotPath } from 'test:e2e/helper';
import type { RouterOutput } from '~/lib/trpc';

test.describe('scenario.test /todo/table', () => {
  test('ttt.', async ({ page }, testInfo) => {
    // mock API
    await page.route('**/api/trpc/' + ('group.list' satisfies TrpcPaths) + '?**', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse({
          group_list: [group1, group2, group3],
          total: 3,
        } satisfies RouterOutput['group']['list']),
      });
    });

    // #region 検索画面を表示する
    await page.route(
      '**/api/trpc/' + ('todo.search' satisfies TrpcPaths) + '?**',
      async (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: jsonStringifyTrpcSuccessResponse({
            todo_list: [],
            total: 0,
          } satisfies RouterOutput['todo']['search']),
        });
      },
    );
    await page.goto('/todo/table/');
    await page.screenshot({ path: screenshotPath(testInfo) });

    // #region 検索条件を入力する
    await page.locator('#where\\.todo_keyword').fill('where.todo_keyword');
    await page.locator('#status-done').click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion

    // #region 検索ボタンをクリックする
    // 初期表示と検索結果を変えるために モックを上書きする
    await page.route(
      '**/api/trpc/' + ('todo.search' satisfies TrpcPaths) + '?**',
      async (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: jsonStringifyTrpcSuccessResponse({
            todo_list: [todo1, todo2, todo3],
            total: 3,
          } satisfies RouterOutput['todo']['search']),
        });
      },
    );
    await page.locator('button[type="submit"]').click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion

    // #region 追加ボタンをクリックする
    await page.locator('a[href="/todo/table/add"]').click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // 登録画面に遷移すること
    await expect(page).toHaveURL('/todo/table/add');
    // #endregion
    // #endregion

    // #region 登録画面を表示する
    // #region 必須項目を入力する
    await page.locator('#group_id').click();
    await page.locator('ul li').filter({ hasText: 'group_name-1' }).click();
    await page.locator('#title').fill('title');
    await page.locator('#begin_date').fill('2025-01-01');
    await page.locator('#begin_time').fill('12:00');
    await page.locator('#limit_date').fill('2025-12-31');
    await page.locator('#limit_time').fill('23:59');
    await page.locator('#description').fill('description');
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion

    // #region 登録ボタンをクリックする
    await page.route('**/api/trpc/' + ('todo.create' satisfies TrpcPaths), async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse(todo1 satisfies RouterOutput['todo']['create']),
      });
    });
    await page.locator('button[type="submit"]').click();
    // 検索画面に遷移すること
    await expect(page).toHaveURL('/todo/table');
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion
    // #endregion

    // #region 検索画面を表示する
    // #region リンクをクリックする
    await page.route('**/api/trpc/' + ('todo.get' satisfies TrpcPaths) + '?**', async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse(todo1 satisfies RouterOutput['todo']['get']),
      });
    });
    await page.locator(`a[href="/todo/table/${todo1.todo_id}"]`).click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // 変更画面に遷移すること
    await expect(page).toHaveURL(`/todo/table/${todo1.todo_id}`);
    // #endregion
    // #endregion

    // #region 変更画面を表示する
    // #region 必須項目を入力する
    await page.locator('#group_id').click();
    await page.locator('ul li').filter({ hasText: 'group_name-1' }).click();
    await page.locator('#title').fill('title');
    await page.locator('#begin_date').fill('2025-01-01');
    await page.locator('#begin_time').fill('12:00');
    await page.locator('#limit_date').fill('2025-12-31');
    await page.locator('#limit_time').fill('23:59');
    await page.locator('#description').fill('description');
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion

    // #region 登録ボタンをクリックする
    await page.route('**/api/trpc/' + ('todo.update' satisfies TrpcPaths), async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse(todo1 satisfies RouterOutput['todo']['update']),
      });
    });
    await page.locator('button[type="submit"]').click();
    // 検索画面に遷移すること
    await expect(page).toHaveURL('/todo/table');
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion
    // #endregion

    // #region 検索画面を表示する
    // #region リンクをクリックする
    await page.locator(`a[href="/todo/table/${todo1.todo_id}"]`).click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // 変更画面に遷移すること
    await expect(page).toHaveURL(`/todo/table/${todo1.todo_id}`);
    // #endregion
    // #endregion

    // #region 変更画面を表示する
    // #region 削除ボタンをクリックする
    await page.route('**/api/trpc/' + ('todo.delete' satisfies TrpcPaths), async (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse(todo1 satisfies RouterOutput['todo']['delete']),
      });
    });
    await page.locator('button[type="button"]').filter({ hasText: 'Delete' }).click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // 確認ダイアログをクリックする
    await page.locator('button[type="button"]').filter({ hasText: 'YES' }).click();
    // 検索画面に遷移すること
    await expect(page).toHaveURL('/todo/table');
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion
    // #endregion
  });
});

const [todo1, todo2, todo3] = [1, 2, 3].map(
  (i) =>
    ({
      todo_id: `todo_id-${i}`,
      title: `title-${i}`,
      description: `description-${i}`,
      begin_date: `2025-10-0${i}`,
      begin_time: `10:0${i}`,
      limit_date: `2025-12-0${i}`,
      limit_time: `12:0${i}`,
      done_at: null,
      order: i,
      created_at: new Date(),
      created_by: 0,
      updated_at: new Date(),
      updated_by: 0,
      group_id: i,
      group: {
        owner_id: i,
        group_id: i,
        group_name: `group_name-${i}`,
        group_description: `group_description-${i}`,
        group_color: `#12456${i}`,
        group_image: `https://dummyimage.com/${i * 10}x${i * 100}`,
        group_order: 0,
        created_at: new Date(),
        created_by: 0,
        updated_at: new Date(),
        updated_by: 0,
      },
      file_list: [
        {
          filename: `filename-${i}`,
          file_id: `file_id-${i}`,
          filesize: i * 100,
          mimetype: 'application/zip',
          created_at: new Date(),
          created_by: 0,
          updated_at: new Date(),
          updated_by: 0,
        },
      ],
    }) satisfies RouterOutput['todo']['create'],
);

const [group1, group2, group3] = [1, 2, 3].map(
  (i) =>
    ({
      group_id: i,
      group_name: `group_name-${i}`,
      group_description: `group_description-${i}`,
      group_image: `group_image-${i}`,
      group_color: `group_color-${i}`,
      group_order: i,
      owner_id: i,
      created_at: new Date(),
      created_by: 0,
      updated_at: new Date(),
      updated_by: 0,
    }) satisfies RouterOutput['group']['get'],
);
