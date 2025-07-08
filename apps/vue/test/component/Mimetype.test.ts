import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';
import { MimetypeIcon, MimetypePreview } from '~/component/Mimetype';

// cSpell:ignore msword openxmlformats officedocument wordprocessingml spreadsheetml presentationml gltf
describe('MimetypeIcon', () => {
  test.each`
    mimetype                                                                       | expected
    ${'application/msword'}                                                        | ${'icon-[vscode-icons--file-type-word]'}
    ${'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}   | ${'icon-[vscode-icons--file-type-word]'}
    ${'application/vnd.ms-excel'}                                                  | ${'icon-[vscode-icons--file-type-excel]'}
    ${'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}         | ${'icon-[vscode-icons--file-type-excel]'}
    ${'application/vnd.ms-powerpoint'}                                             | ${'icon-[vscode-icons--file-type-powerpoint]'}
    ${'application/vnd.openxmlformats-officedocument.presentationml.presentation'} | ${'icon-[vscode-icons--file-type-powerpoint]'}
    ${'application/pdf'}                                                           | ${'icon-[vscode-icons--file-type-pdf2]'}
    ${'application/zip'}                                                           | ${'icon-[vscode-icons--file-type-zip]'}
    ${'application/x-zip-compressed'}                                              | ${'icon-[vscode-icons--file-type-zip]'}
    ${'application/octet-stream'}                                                  | ${'icon-[vscode-icons--default-file]'}
    ${'audio/mpeg'}                                                                | ${'icon-[vscode-icons--file-type-audio]'}
    ${'example/json'}                                                              | ${'icon-[vscode-icons--default-file]'}
    ${'font/woff'}                                                                 | ${'icon-[vscode-icons--file-type-font]'}
    ${'haptics/json'}                                                              | ${'icon-[vscode-icons--default-file]'}
    ${'image/png'}                                                                 | ${'icon-[vscode-icons--file-type-image]'}
    ${'message/http'}                                                              | ${'icon-[vscode-icons--default-file]'}
    ${'model/gltf-binary'}                                                         | ${'icon-[vscode-icons--default-file]'}
    ${'multipart/form-data'}                                                       | ${'icon-[vscode-icons--default-file]'}
    ${'text/plain'}                                                                | ${'icon-[vscode-icons--file-type-text]'}
    ${'video/mp4'}                                                                 | ${'icon-[vscode-icons--file-type-video]'}
    ${'unknown/type'}                                                              | ${'icon-[vscode-icons--default-file]'}
  `('should return $expected for $mimetype', ({ mimetype, expected }) => {
    expect(MimetypeIcon({ mimetype })).toBe(expected);
  });
});

describe('MimetypePreview', () => {
  // Mock import.meta.env
  vi.stubGlobal('import', {
    meta: {
      env: {
        BASE_URL: '/',
      },
    },
  });

  test('should render nothing for application types', () => {
    const wrapper = mount(MimetypePreview, {
      props: { file_id: '123', mimetype: 'application/pdf' },
    });
    expect(wrapper.html()).toBe('');
  });

  test('should render audio element for audio types', () => {
    const wrapper = mount(MimetypePreview, {
      props: { file_id: '123', mimetype: 'audio/mpeg' },
    });
    const audio = wrapper.find('audio');
    expect(audio.exists()).toBe(true);
    expect(audio.attributes('controls')).toBeDefined();
    expect(audio.attributes('src')).toBe('/api/file/download/single/123');
  });

  test('should render img element for image types', () => {
    const wrapper = mount(MimetypePreview, {
      props: { file_id: '123', mimetype: 'image/png' },
    });
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/api/file/download/single/123');
  });

  test('should render video element for video types', () => {
    const wrapper = mount(MimetypePreview, {
      props: { file_id: '123', mimetype: 'video/mp4' },
    });
    const video = wrapper.find('video');
    expect(video.exists()).toBe(true);
    expect(video.attributes('controls')).toBeDefined();
    const source = video.find('source');
    expect(source.exists()).toBe(true);
    expect(source.attributes('src')).toBe('/api/file/download/single/123');
    expect(source.attributes('type')).toBe('video/mp4');
  });

  test('should render nothing for other types', () => {
    const wrapper = mount(MimetypePreview, {
      props: { file_id: '123', mimetype: 'text/plain' },
    });
    expect(wrapper.html()).toBe('');
  });
});
