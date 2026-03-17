import type { TrpcPaths } from '@todo/express';

import { expect, test } from '@playwright/test';

import type { RouterOutput } from '~/lib/trpc';

import { FileFactory } from '../../../factory/FileFactory';
import { GroupFactory } from '../../../factory/GroupFactory';
import { SpaceFactory } from '../../../factory/SpaceFactory';
import { TodoFactory } from '../../../factory/TodoFactory';
import { jsonStringifyTrpcSuccessResponse, screenshotPath } from '../../../helper';

test.describe('scenario.test /todo/table', () => {
  test('ttt.', async ({ page }, testInfo) => {
    const space_id = crypto.randomUUID();

    // mock API
    await page.route('**/api/trpc/' + ('group.list' satisfies TrpcPaths) + '?**', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse([
          GroupFactory.create({
            group_name: `group_name-1`,
          }),
          GroupFactory.create({
            group_name: `group_name-2`,
          }),
          GroupFactory.create({
            group_name: `group_name-3`,
          }),
        ] satisfies RouterOutput['group']['list']),
      });
    });

    await page.route('**/api/trpc/' + ('space.list' satisfies TrpcPaths) + '?**', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse([
          SpaceFactory.create({ space_name: 'space_name-1' }),
        ] satisfies RouterOutput['space']['list']),
      });
    });

    // #region 検索画面を表示する
    await page.route(
      '**/api/trpc/' + ('todo.search' satisfies TrpcPaths) + '?**',
      async (route) => {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: jsonStringifyTrpcSuccessResponse({
            todo_list: [],
            total: 0,
          } satisfies RouterOutput['todo']['search']),
        });
      },
    );
    await page.goto(`/space/${space_id}/todo/table/`);
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
        return route.fulfill({
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
    await page.locator(`a[href="/space/${space_id}/todo/table/add"]`).click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // 登録画面に遷移すること
    await expect(page).toHaveURL(`/space/${space_id}/todo/table/add`);
    // #endregion
    // #endregion

    // #region 登録画面を表示する
    // #region 必須項目を入力する
    await page.locator('#group_id').click();
    await page.locator('option').filter({ hasText: 'group_name-1' }).click();
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
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse(todo1 satisfies RouterOutput['todo']['create']),
      });
    });
    await page.locator('button[type="submit"]').click();
    // 検索画面に遷移すること
    await expect(page).toHaveURL(`/space/${space_id}/todo/table`);
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion
    // #endregion

    // #region 検索画面を表示する
    // #region リンクをクリックする
    await page.route('**/api/trpc/' + ('todo.get' satisfies TrpcPaths) + '?**', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse(todo1 satisfies RouterOutput['todo']['get']),
      });
    });
    await page.locator(`a[href="/space/${space_id}/todo/table/${todo1.todo_id}"]`).click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // 変更画面に遷移すること
    await expect(page).toHaveURL(`/space/${space_id}/todo/table/${todo1.todo_id}`);
    // #endregion
    // #endregion

    // #region 変更画面を表示する
    // #region 必須項目を入力する
    await page.locator('#group_id').click();
    await page.locator('option').filter({ hasText: 'group_name-1' }).click();
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
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse(todo1 satisfies RouterOutput['todo']['update']),
      });
    });
    await page.locator('button[type="submit"]').click();
    // 検索画面に遷移すること
    await expect(page).toHaveURL(`/space/${space_id}/todo/table`);
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion
    // #endregion

    // #region 検索画面を表示する
    // #region リンクをクリックする
    await page.locator(`a[href="/space/${space_id}/todo/table/${todo1.todo_id}"]`).click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // 変更画面に遷移すること
    await expect(page).toHaveURL(`/space/${space_id}/todo/table/${todo1.todo_id}`);
    // #endregion
    // #endregion

    // #region 変更画面を表示する
    // #region 削除ボタンをクリックする
    await page.route('**/api/trpc/' + ('todo.delete' satisfies TrpcPaths), async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: jsonStringifyTrpcSuccessResponse(todo1 satisfies RouterOutput['todo']['delete']),
      });
    });
    await page.locator('button[type="button"]').filter({ hasText: 'Delete' }).click();
    await page.screenshot({ path: screenshotPath(testInfo) });
    // 確認ダイアログをクリックする
    await page.locator('button[type="submit"]').filter({ hasText: 'YES' }).click();
    // 検索画面に遷移すること
    await expect(page).toHaveURL(`/space/${space_id}/todo/table`);
    await page.screenshot({ path: screenshotPath(testInfo) });
    // #endregion
    // #endregion
  });
});

const [todo1, todo2, todo3] = [1, 2, 3].map(
  (i) =>
    ({
      ...TodoFactory.create({
        title: `title-${i}`,
      }),
      group: GroupFactory.create({
        group_name: `${i}`,
      }),
      file_list: [
        FileFactory.create({
          filename: `filename-${i}`,
        }),
      ],
    }) satisfies RouterOutput['todo']['create'],
);
