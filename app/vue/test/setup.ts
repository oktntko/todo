import { vi } from 'vitest';

/**
 * グローバルモック設定ファイル
 * すべてのテスト前に自動実行される
 *
 * vi.mock() でモック化したい外部依存は、ここに定義する
 * テスト固有の動作変更は各テストファイルで vi.doMock() を使用
 */

/**
 * tRPC のグローバルモック - 汎用Proxy版
 * - すべてのエンドポイントを自動的にモック化
 * - APIレスポンスの反映が不要（UIの動作テストに特化）
 * - 新しいエンドポイント追加時もコード変更不要
 *
 * 使用例:
 *   trpc.file.delete.mutate(data) => vi.fn()
 *   trpc.todo.create.mutate(data) => vi.fn()
 *   trpc.anything.deep.nested.query() => vi.fn()
 */
function createDeepMockProxy() {
  return new Proxy(
    // vi.spyOn() 対応: 実際のvi.fn()インスタンスを持つオブジェクト
    { mutate: vi.fn(), query: vi.fn() },
    {
      get: (target, prop) => {
        // 既存プロパティ（mutate, query）は実際の値を返す
        if (prop === 'mutate' || prop === 'query') {
          return target[prop];
        }
        // 新しいプロパティはネストされたProxyを返す
        return createDeepMockProxy();
      },
    },
  );
}

vi.mock('~/lib/trpc', () => ({
  trpc: new Proxy({}, { get: () => createDeepMockProxy() }),
}));

/**
 * DialogPlugin のグローバルモック
 * - デフォルト: ダイアログ確認を通す（Promise.resolve()）
 * - キャンセル時のみ各テストで vi.doMock() でオーバーライド
 */
vi.mock('~/plugin/DialogPlugin', () => ({
  useDialog: () => ({
    loading: vi.fn(() => ({ close: vi.fn() })),
    confirm: {
      warn: vi.fn(() => Promise.resolve()),
    },
  }),
}));

/**
 * ToastPlugin のグローバルモック
 * - 成功メッセージ表示用
 */
vi.mock('~/plugin/ToastPlugin', () => ({
  useToast: () => ({
    success: vi.fn(),
  }),
}));
