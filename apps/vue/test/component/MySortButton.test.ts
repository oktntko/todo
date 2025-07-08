import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import MySortButton from '~/component/MySortButton.vue';

describe('MySortButton', () => {
  test('renders correctly when not sorted', () => {
    const wrapper = mount(MySortButton, {
      props: {
        field: 'name',
        sort: {
          field: 'id',
          order: '',
        },
      },
    });
    expect(wrapper.find('button').classes()).not.toContain('text-blue-500');
    expect(wrapper.find('span').classes()).toContain('icon-[fa6-solid--sort]');
    expect(wrapper.find('button').attributes('title')).toBe('');
  });

  test('renders correctly when sorted ascending', () => {
    const wrapper = mount(MySortButton, {
      props: {
        field: 'name',
        sort: {
          field: 'name',
          order: 'asc',
        },
      },
    });
    expect(wrapper.find('button').classes()).toContain('text-blue-500');
    expect(wrapper.find('span').classes()).toContain('icon-[fa6-solid--sort-up]');
    expect(wrapper.find('button').attributes('title')).toBe('asc');
  });

  test('renders correctly when sorted descending', () => {
    const wrapper = mount(MySortButton, {
      props: {
        field: 'name',
        sort: {
          field: 'name',
          order: 'desc',
        },
      },
    });
    expect(wrapper.find('button').classes()).toContain('text-blue-500');
    expect(wrapper.find('span').classes()).toContain('icon-[fa6-solid--sort-down]');
    expect(wrapper.find('button').attributes('title')).toBe('desc');
  });

  test('emits click event when clicked', async () => {
    const wrapper = mount(MySortButton, {
      props: {
        field: 'name',
        sort: {
          field: 'id',
          order: '',
        },
      },
    });
    await wrapper.find('button').trigger('click');
    // `MySortButton` コンポーネントが `click` イベントを少なくとも1回発火したこと
    expect(wrapper.emitted().click).toBeTruthy();
  });
});
