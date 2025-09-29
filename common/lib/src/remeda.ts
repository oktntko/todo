import * as r from 'remeda';

const R = {
  ...r,
  rgb,
  rgba,
};

function calcRgb(hex: string) {
  if (!hex) {
    return { r: 0, g: 0, b: 0 };
  }

  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((x) => x + x)
      .join('');
  }
  const num = parseInt(hex, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgb(hex: string) {
  const { r, g, b } = calcRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = calcRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export { R };
