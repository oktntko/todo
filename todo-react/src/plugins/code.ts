const YUSENDO = [
  {
    label: "高",
    value: "HIGH",
  },
  {
    label: "中",
    value: "MIDDLE",
  },
  {
    label: "低",
    value: "LOW",
  },
];

export const code = {
  yusendo: YUSENDO,
};

export const toLabel = {
  yusendo: (value?: string | null) => {
    return YUSENDO.find((data) => data.value === value)?.label;
  },
};
