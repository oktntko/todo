import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// グローバルモック
// トップレベルで宣言する
vi.mock('~/lib/trpc', () => ({
  trpc: {
    file: {
      delete: {
        mutate: vi.fn(),
      },
    },
  },
}));

describe('MyDownloadFileList', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  test('renders correctly with no files', async () => {
    // arrange
    // nothing to do

    // act
    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        file_list: [],
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
        file_list: files,
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
    // vi.mock だと関数の巻き上げが起きるため、
    // 変数を代入すると `downloadSingleFile is not defined` が起きる。
    // vi.doMock を使えば関数の巻き上げが起きない。
    vi.doMock('~/composable/useFile', async () => ({
      useFile: () => ({
        downloadSingleFile,
      }),
    }));

    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        file_list: files,
      },
    });

    // act
    await wrapper.find('li button').trigger('click');

    // assert
    expect(downloadSingleFile).toHaveBeenCalledWith({ file_id: '1' });
  });

  test('calls trpc.file.delete.mutate and emits deleted event when delete button is clicked and confirmed', async () => {
    // arrange
    const files = [{ file_id: '1', filename: 'test1.txt', updated_at: new Date() }];

    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        file_list: files,
      },
      global: {
        mocks: {
          $dialog: { confirm: vi.fn(() => Promise.resolve(true)) },
          $loading: { open: vi.fn(() => ({ close: vi.fn() })) },
          $toast: { success: vi.fn() },
        },
      },
    });

    const { trpc } = await import('~/lib/trpc');
    const deleteMutateSpy = vi.spyOn(trpc.file.delete, 'mutate');

    // act
    await wrapper.find('[aria-label="close"]').trigger('click');

    // assert
    expect(wrapper.vm.$dialog.confirm).toHaveBeenCalledWith(
      `Do you really want to delete this file?\n'test1.txt'`,
    );
    expect(wrapper.vm.$dialog.loading).toHaveBeenCalled();
    expect(deleteMutateSpy).toHaveBeenCalledWith(files[0]);
    expect(wrapper.vm.$toast.success).toHaveBeenCalledWith('Data has been deleted.');
    expect(wrapper.emitted('deleted')).toEqual([[0]]);
    expect(wrapper.vm.file_list).toEqual([]); // Check if file is removed from the list
  });

  test('does not delete file if confirmation is cancelled', async () => {
    // arrange
    const files = [{ file_id: '1', filename: 'test1.txt', updated_at: new Date() }];

    const { default: MyDownloadFileList } = await import('~/component/MyDownloadFileList.vue');
    const wrapper = mount(MyDownloadFileList, {
      props: {
        file_list: files,
      },
      global: {
        mocks: {
          $dialog: { confirm: vi.fn(() => Promise.resolve(false)) },
          $loading: { open: vi.fn(() => ({ close: vi.fn() })) },
          $toast: { success: vi.fn() },
        },
      },
    });

    const { trpc } = await import('~/lib/trpc');
    const deleteMutateSpy = vi.spyOn(trpc.file.delete, 'mutate');

    // act
    await wrapper.find('[aria-label="close"]').trigger('click');

    // assert
    expect(wrapper.vm.$dialog.confirm).toHaveBeenCalled();
    expect(deleteMutateSpy).not.toHaveBeenCalled();
    expect(wrapper.vm.$dialog.loading).not.toHaveBeenCalled();
    expect(wrapper.vm.$toast.success).not.toHaveBeenCalled();
    expect(wrapper.emitted('deleted')).toBeUndefined();
    expect(wrapper.vm.file_list).toEqual(files); // File should still be in the list
  });
});
