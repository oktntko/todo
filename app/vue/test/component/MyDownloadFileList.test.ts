import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * グローバルモックは test/setup.ts で管理されており、
 * すべてのテスト前に自動で読み込まれる
 *
 * このテストファイルでは、テスト固有のモック上書きのみを行う
 */

describe('MyDownloadFileList', () => {
  /**
   * beforeEach: 各テスト前に実行
   * - vi.resetModules() - モジュールキャッシュをリセットして、各テストに新しいインスタンスを提供
   * - vi.clearAllMocks() - すべてのモック（spy含む）の呼び出し履歴をクリア
   */
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('renders correctly with no files', async () => {
    // act
    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        modelValueFileList: [],
      },
    });

    // assert
    expect(wrapper.find('ul').exists()).toBe(true);
    expect(wrapper.findAll('li').length).toBe(0);
  });

  test('renders correctly with files', async () => {
    // arrange
    const files = [
      { file_id: '1', filename: 'test1.txt', updated_at: new Date() },
      { file_id: '2', filename: 'test2.pdf', updated_at: new Date() },
    ];

    // act
    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        modelValueFileList: files,
      },
    });

    // assert
    expect(wrapper.findAll('li').length).toBe(2);
    expect(wrapper.text()).toContain('test1.txt');
    expect(wrapper.text()).toContain('test2.pdf');
  });

  test('calls downloadSingleFile when download button is clicked', async () => {
    // arrange
    const files = [{ file_id: '1', filename: 'test1.txt', updated_at: new Date() }];

    const downloadSingleFile = vi.fn();
    /**
     * vi.doMock() - テスト内で宣言するモック関数
     * - ホイスティングが発生しないため、テスト内で動的にモック値を変更できる
     * - vi.mock だと関数の巻き上げが起きる
     * - vi.doMock を使えば関数の巻き上げが起きない
     */
    vi.doMock('~/composable/useFile', async () => ({
      useFile: () => ({
        downloadSingleFile,
      }),
    }));

    // act
    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        modelValueFileList: files,
      },
    });

    await wrapper.find('li button').trigger('click');

    // assert
    expect(downloadSingleFile).toHaveBeenCalledWith({ file_id: '1' });
  });

  test('calls trpc.file.delete.mutate and emits deleted event when delete button is clicked and confirmed', async () => {
    // arrange
    const dialogConfirmWarn = vi.fn(() => Promise.resolve('YES'));
    const dialogLoading = vi.fn(() => ({ close: vi.fn() }));
    vi.doMock('~/plugin/DialogPlugin', () => ({
      useDialog: () => ({
        loading: dialogLoading,
        confirm: {
          warn: dialogConfirmWarn,
        },
      }),
    }));

    const toastSuccess = vi.fn();
    vi.doMock('~/plugin/ToastPlugin', () => ({
      useToast: () => ({
        success: toastSuccess,
      }),
    }));

    const trpcFileDeleteMutate = vi.fn();
    vi.doMock('~/lib/trpc', () => ({
      trpc: {
        file: {
          delete: {
            mutate: trpcFileDeleteMutate,
          },
        },
      },
    }));

    const files = [{ file_id: '1', filename: 'test1.txt', updated_at: new Date() }];

    // act
    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        modelValueFileList: files,
      },
    });

    // act
    await wrapper.find('[aria-label="close"]').trigger('click');

    // assert
    expect(dialogConfirmWarn).toHaveBeenCalledWith(
      `Do you really want to delete this file?\n'test1.txt'`,
    );
    expect(dialogLoading).toHaveBeenCalled();
    expect(trpcFileDeleteMutate).toHaveBeenCalledWith(files[0]);
    expect(toastSuccess).toHaveBeenCalledWith('Data has been deleted.');
    expect(wrapper.emitted('deleted')).toEqual([[0]]);
    expect(wrapper.vm.modelValueFileList).toEqual([]); // Check if file is removed from the list
  });

  test('does not delete file if confirmation is cancelled', async () => {
    // arrange
    const dialogConfirmWarn = vi.fn(() => Promise.reject('cancel'));
    const dialogLoading = vi.fn(() => ({ close: vi.fn() }));
    /**
     * vi.doMock() - このテストだけ、DialogPluginをオーバーライド
     * - warn() が Promise.reject('cancel') を返すように上書き
     * - グローバル設定を特定のテストのみ変更したいときに使用
     */
    vi.doMock('~/plugin/DialogPlugin', () => ({
      useDialog: () => ({
        loading: dialogLoading,
        confirm: {
          warn: dialogConfirmWarn,
        },
      }),
    }));

    const toastSuccess = vi.fn();
    vi.doMock('~/plugin/ToastPlugin', () => ({
      useToast: () => ({
        success: toastSuccess,
      }),
    }));

    const trpcFileDeleteMutate = vi.fn();
    vi.doMock('~/lib/trpc', () => ({
      trpc: {
        file: {
          delete: {
            mutate: trpcFileDeleteMutate,
          },
        },
      },
    }));

    const files = [{ file_id: '1', filename: 'test1.txt', updated_at: new Date() }];

    // act
    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        modelValueFileList: files,
      },
    });

    await wrapper.find('[aria-label="close"]').trigger('click');

    // assert
    // ダイアログが正しく呼ばれたことを確認（メッセージ内容の妥当性検証）
    expect(dialogConfirmWarn).toHaveBeenCalledWith(
      `Do you really want to delete this file?\n'test1.txt'`,
    );
    // キャンセル時は削除処理が実行されないことを確認
    expect(trpcFileDeleteMutate).not.toHaveBeenCalled();
    expect(dialogLoading).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(wrapper.emitted('deleted')).toBeUndefined();
    expect(wrapper.vm.modelValueFileList).toEqual(files); // File should still be in the list
  });
});
