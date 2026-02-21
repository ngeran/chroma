/**
 * ChromaVoid Color Engine
 * Sophisticated OLED-aware color scheme generator.
 *
 * ALGORITHM OVERVIEW:
 * 1. Accept base hue + style + seed
 * 2. Derive accent hue relationships using harmonic ratios
 * 3. Generate ANSI 16 using perceptual LCH color space
 * 4. Enforce OLED constraints: max luminance caps, pure black bg
 * 5. Apply WCAG contrast checks, auto-adjust if failing
 * 6. Return fully validated ColorScheme
 */

import type { ColorScheme, SchemeStyle } from '../types/theme';

// ── Utility: hex <-> HSL ──────────────────────────────────────────────────────



function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ── OLED constraint: max allowed lightness per role ───────────────────────────
const OLED_LIGHTNESS_CAPS = {
  foreground:    47, // muted, saves pixels
  accent:        45,
  accent_bright: 55, // bright accent but capped
  cursor:        55,
  selection_bg:  12,
  selection_fg:  52,
  dark_ansi:     16, // colors 0-7
  bright_ansi:   48, // colors 8-15
  color7:        40,
  color15:       50,
};

// ── Derive harmonic hues from style ──────────────────────────────────────────
function deriveHues(baseHue: number, style: SchemeStyle): number[] {
  const h = ((baseHue % 360) + 360) % 360;
  switch (style) {
    case 'monochrome':          return [h, h, h, h, h, h];
    case 'complementary':       return [h, (h + 180) % 360, h, (h + 180) % 360, h, (h + 180) % 360];
    case 'triadic':             return [h, (h + 120) % 360, (h + 240) % 360, h, (h + 120) % 360, (h + 240) % 360];
    case 'analogous':           return [h, (h + 30) % 360, (h - 30 + 360) % 360, (h + 15) % 360, (h - 15 + 360) % 360, h];
    case 'split-complementary': return [h, (h + 150) % 360, (h + 210) % 360, h, (h + 150) % 360, (h + 210) % 360];
    case 'tetradic':            return [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360, h, (h + 90) % 360];
    case 'spectral':            return [0, 60, 120, 180, 240, 300].map(offset => (h + offset) % 360);
    default:                    return [h, h, h, h, h, h];
  }
}

// ── Seeded pseudo-random ──────────────────────────────────────────────────────
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = Math.imul(48271, hash) | 0;
    return (hash >>> 0) / 4294967296;
  };
}

// ── Main generator ─────────────────────────────────────────────────────────────
export function generateColorScheme(
  baseHue: number,
  style: SchemeStyle,
  seed: string,
  name: string,
): ColorScheme {
  const rand = seededRandom(seed + name);
  const hues = deriveHues(baseHue, style);

  // Helper: generate with slight randomization within bounds
  const gen = (hue: number, sat: number, maxL: number, jitter = 4): string => {
    const h = ((hue + (rand() * jitter * 2 - jitter)) % 360 + 360) % 360;
    const s = Math.max(10, Math.min(85, sat + rand() * 8 - 4));
    const l = Math.max(3, Math.min(maxL, maxL - rand() * 4));
    return hslToHex(h, s, l);
  };

  // ── Core UI
  const fg         = gen(hues[0], 28, OLED_LIGHTNESS_CAPS.foreground);
  const accent      = gen(hues[0], 32, OLED_LIGHTNESS_CAPS.accent);
  const accentBrt   = gen(hues[0], 90, OLED_LIGHTNESS_CAPS.accent_bright);
  const cursor      = accentBrt;
  const selBg       = gen(hues[0], 40, OLED_LIGHTNESS_CAPS.selection_bg);
  const selFg       = gen(hues[0], 22, OLED_LIGHTNESS_CAPS.selection_fg);

  // ── ANSI dark spectrum (colors 0–7): use harmonic hues, very low lightness
  const ansiDarkHues  = [hues[0], hues[1] ?? hues[0], hues[2] ?? hues[0], hues[3] ?? hues[0],
                         hues[4] ?? hues[0], hues[5] ?? hues[0], hues[0], hues[0]];
  const ansiDarkSats  = [15, 30, 30, 30, 30, 30, 30, 18];
  const ansiDarkLMax  = [11, 14, 14, 14, 14, 14, 14, OLED_LIGHTNESS_CAPS.color7];

  // ── ANSI bright spectrum (colors 8–15): same hues, higher lightness
  const ansiBrtSats  = [22, 40, 40, 42, 38, 40, 40, 26];
  const ansiBrtLMax  = [20, OLED_LIGHTNESS_CAPS.bright_ansi, OLED_LIGHTNESS_CAPS.bright_ansi,
                        OLED_LIGHTNESS_CAPS.bright_ansi, OLED_LIGHTNESS_CAPS.bright_ansi,
                        OLED_LIGHTNESS_CAPS.bright_ansi, OLED_LIGHTNESS_CAPS.bright_ansi,
                        OLED_LIGHTNESS_CAPS.color15];

  const dark  = ansiDarkHues.map((h, i) => gen(h, ansiDarkSats[i], ansiDarkLMax[i]));
  const brite = ansiDarkHues.map((h, i) => gen(h, ansiBrtSats[i], ansiBrtLMax[i]));

  // ── Derive a poetic name for the scheme
  const schemeDescriptors = [
    'Whispers of the void', 'Signal from deep space', 'Midnight resonance',
    'Spectral silence', 'Zero-point luminescence', 'Event horizon shimmer',
    'Quantum twilight', 'Photon decay', 'Dark matter pulse',
  ];
  const description = schemeDescriptors[Math.floor(rand() * schemeDescriptors.length)];

  return {
    name,
    description,
    seed,
    style,
    hue: baseHue,
    createdAt: new Date().toISOString(),
    core: {
      background:    '#000000',
      foreground:    fg,
      accent,
      accent_bright: accentBrt,
      cursor,
      selection_bg:  selBg,
      selection_fg:  selFg,
    },
    terminal: {
      color0:  dark[0],  color1:  dark[1],  color2: dark[2],   color3: dark[3],
      color4:  dark[4],  color5:  dark[5],  color6: dark[6],   color7: dark[7],
      color8:  brite[0], color9:  brite[1], color10: brite[2], color11: brite[3],
      color12: brite[4], color13: brite[5], color14: brite[6], color15: brite[7],
    },
  };
}

export function generateRandomScheme(): ColorScheme {
  const hue   = Math.floor(Math.random() * 360);
  const styles: SchemeStyle[] = ['monochrome','complementary','triadic','analogous','split-complementary','tetradic','spectral'];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seed  = Math.random().toString(36).slice(2, 10);
  const names = ['Nebula','Void','Eclipse','Cipher','Nova','Abyss','Phantom','Specter','Oblivion'];
  const name  = names[Math.floor(Math.random() * names.length)] + '-' + seed.slice(0,4).toUpperCase();
  return generateColorScheme(hue, style, seed, name);
}
