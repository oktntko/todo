import type { JSX } from 'vue/jsx-runtime';

// vue から直接 export すると oxlint が解釈できないのでtsファイルで書く。
// たぶん、 .d.tsでも大丈夫だけど import が必要な型を使っていたので ts で書く ＆ export する。

export type DownloadFile = {
  file_id: string;
  filename: string;
  updated_at: Date;
};

export type MyDropdownSlots = {
  default?: () => JSX.Element;
  button?: (params: { toggle: () => void }) => JSX.Element;
};
