import * as r from 'remeda';

const R = {
  ...r,
  rgb,
  rgba,
  hex,
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

function hex(rgb: string): string {
  // "rgb(255, 0, 0)" → ["255","0","0"]
  // "rgba(255, 0, 0, 0.6)" → ["255","0","0","0","6"] ← 小数点で分かれても先頭3つだけ取る
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';

  const [r, g, b] = match.map(Number);

  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();

  return `#${toHex(r!)}${toHex(g!)}${toHex(b!)}`;
}

export { R };
