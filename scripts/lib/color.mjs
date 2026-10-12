/** Colour parsing and checks used by the scanner. Channels are 0–255, alpha 0–1. */
export function parseColor(css) {
  if (!css) return null;
  const s = css.trim().toLowerCase();
  let m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
  if (m) {
    let a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    if (a === 0) return null;
    return { r: Math.round(+m[1]), g: Math.round(+m[2]), b: Math.round(+m[3]), a };
  }
  m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) {
    const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  return null;
}

export const toHex = ({ r, g, b }) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

export function hsl({ r, g, b }) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

const lin = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

/** WCAG contrast ratio. A translucent foreground is composited over the background first. */
export function contrast(fg, bg) {
  const f = fg.a < 1 ? { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) } : fg;
  const [a, b] = [luminance(f), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

export function gradientColors(css) {
  return (css.match(/rgba?\([^)]*\)|#[0-9a-f]{3,6}\b/gi) ?? []).map(parseColor).filter(Boolean);
}

/** Tailwind's default indigo/violet/purple — the colour of "an AI made this". */
export const TAILWIND_SLOP = ["#6366f1", "#8b5cf6", "#4f46e5", "#7c3aed", "#a855f7", "#818cf8"];

export function isPurpleBlueGradient(css) {
  const stops = gradientColors(css).map(hsl).filter((c) => c.s > 0.35);
  return stops.some((c) => c.h >= 255 && c.h <= 300) && stops.some((c) => c.h >= 190 && c.h < 255);
}
