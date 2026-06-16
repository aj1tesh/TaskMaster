export const THEME_DARK = {
  bgBase: "#0e0e0e",
  bgSurface: "#161616",
  bgRaised: "#1f1f1f",
  border: "#2a2a2a",
  textPrimary: "#f0f0f0",
  textMuted: "#a3a3a3",
} as const;

export const THEME_LIGHT = {
  bgBase: "#f9f9f8",
  bgSurface: "#ffffff",
  bgRaised: "#f2f1ef",
  border: "#d8d7d5",
  textPrimary: "#141414",
  textMuted: "#5c5c5c",
} as const;

const TEXT_ON_DARK = THEME_DARK.textPrimary;
const TEXT_ON_LIGHT = THEME_LIGHT.textPrimary;
const MUTED_ON_DARK = THEME_DARK.textMuted;
const MUTED_ON_LIGHT = THEME_LIGHT.textMuted;

function parseHex(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function lerpHex(a: string, b: string, t: number) {
  const c1 = parseHex(a);
  const c2 = parseHex(b);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const bl = Math.round(c1.b + (c2.b - c1.b) * t);
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function relativeLuminance(hex: string) {
  const { r, g, b } = parseHex(hex);
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(bgHex: string, textHex: string) {
  const l1 = relativeLuminance(bgHex);
  const l2 = relativeLuminance(textHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pick light or dark text; never return a mid-gray that merges with the background. */
function readableText(
  bgHex: string,
  lightText: string,
  darkText: string,
  minRatio: number
): string {
  const onDark = contrastRatio(bgHex, lightText);
  const onLight = contrastRatio(bgHex, darkText);

  if (onDark >= minRatio && onLight >= minRatio) {
    return relativeLuminance(bgHex) > 0.45 ? darkText : lightText;
  }
  if (onDark >= minRatio) return lightText;
  if (onLight >= minRatio) return darkText;
  return relativeLuminance(bgHex) > 0.45 ? "#000000" : "#ffffff";
}

/** Muted text: softer than primary but still readable on the surface. */
function readableMuted(bgHex: string, primaryText: string): string {
  const candidates = [MUTED_ON_DARK, MUTED_ON_LIGHT, primaryText];
  let best = primaryText;
  let bestRatio = 0;

  for (const candidate of candidates) {
    const ratio = contrastRatio(bgHex, candidate);
    if (ratio >= 3 && ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
  }

  if (bestRatio >= 3) return best;
  return readableText(bgHex, TEXT_ON_DARK, TEXT_ON_LIGHT, 3);
}

/** Borders must stay visible against the surface they sit on. */
function readableBorder(bgSurface: string, t: number): string {
  const lerped = lerpHex(THEME_DARK.border, THEME_LIGHT.border, t);
  if (contrastRatio(bgSurface, lerped) >= 1.4) return lerped;

  const surfaceLum = relativeLuminance(bgSurface);
  return surfaceLum > 0.45
    ? lerpHex(bgSurface, "#000000", 0.22)
    : lerpHex(bgSurface, "#ffffff", 0.18);
}

function readCssVar(name: string) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function getThemeCssColors() {
  return {
    bgSurface: readCssVar("--bg-surface"),
    border: readCssVar("--border"),
    textMuted: readCssVar("--text-muted"),
    textPrimary: readCssVar("--text-primary"),
  };
}

/** 0 = dark, 100 = light */
export function applyThemeLevel(level: number) {
  const t = Math.max(0, Math.min(100, level)) / 100;
  const root = document.documentElement;

  const bgBase = lerpHex(THEME_DARK.bgBase, THEME_LIGHT.bgBase, t);
  const bgSurface = lerpHex(THEME_DARK.bgSurface, THEME_LIGHT.bgSurface, t);
  const bgRaised = lerpHex(THEME_DARK.bgRaised, THEME_LIGHT.bgRaised, t);
  const border = readableBorder(bgSurface, t);

  const textPrimary = readableText(bgBase, TEXT_ON_DARK, TEXT_ON_LIGHT, 4.5);
  const textMuted = readableMuted(bgSurface, textPrimary);

  const baseLum = relativeLuminance(bgBase);

  root.style.setProperty("--bg-base", bgBase);
  root.style.setProperty("--bg-surface", bgSurface);
  root.style.setProperty("--bg-raised", bgRaised);
  root.style.setProperty("--border", border);
  root.style.setProperty("--text-primary", textPrimary);
  root.style.setProperty("--text-muted", textMuted);
  root.style.colorScheme = baseLum > 0.45 ? "light" : "dark";

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("theme-change", { detail: { level } })
    );
  }
}

export function themeLevelFromLegacy(theme?: "dark" | "light"): number {
  return theme === "light" ? 100 : 0;
}

export function legacyThemeFromLevel(level: number): "dark" | "light" {
  return level >= 50 ? "light" : "dark";
}

export function getFirstName(name?: string | null): string {
  if (!name?.trim()) return "there";
  return name.trim().split(/\s+/)[0];
}
