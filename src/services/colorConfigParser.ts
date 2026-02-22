export interface ExtractedColor {
  key: string;
  hex: string;
  comment: string;
  role: ColorRole;
}

export type ColorRole =
  | 'background'
  | 'foreground'
  | 'cursor'
  | 'selection'
  | 'comment'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'accent-cyan'
  | 'accent'
  | 'accent-magenta'
  | 'ansi'
  | 'bright'
  | 'color';

export type FileType = 'neovim-lua' | 'waybar-css' | 'ghostty-conf' | 'color-toml' | 'generic';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const ch = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function normalizeHex(h: string): string | null {
  const cleaned = h.replace('#', '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return '#' + cleaned.toUpperCase();
  }
  return null;
}

export function detectFileType(content: string, filename = ''): FileType {
  const fn = filename.toLowerCase();
  if (fn.endsWith('.lua') || content.includes('nightfox') || content.includes('Shade.new')) return 'neovim-lua';
  if (fn.endsWith('.css') || content.includes('@define-color') || content.includes('window#waybar')) return 'waybar-css';
  if (fn.endsWith('.conf') || content.includes('cursor-color') || content.includes('palette =')) return 'ghostty-conf';
  if (fn.endsWith('.toml') || content.includes('color0') || content.includes('[colors]')) return 'color-toml';
  return 'generic';
}

export function fileTypeLabel(t: FileType): string {
  const labels: Record<FileType, string> = {
    'neovim-lua': 'Neovim / nightfox.lua',
    'waybar-css': 'Waybar / style.css',
    'ghostty-conf': 'Ghostty / ghostty.conf',
    'color-toml': 'Color / .toml',
    'generic': 'Generic Config',
  };
  return labels[t] || 'Config File';
}

function inferRole(key: string, _hex: string): ColorRole {
  const k = key.toLowerCase();

  if (k.includes('bg') || k.includes('background') || k.includes('void') || k.includes('dm')) return 'background';
  if (k.includes('fg') || k.includes('foreground') || k.includes('text') || k.includes('ash') || k.includes('silver')) return 'foreground';
  if (k.includes('cursor')) return 'cursor';
  if (k.includes('sel') || k.includes('selection') || k.includes('visual') || k.includes('gravity')) return 'selection';
  if (k.includes('comment') || k.includes('gas') || k.includes('muted') || k.includes('dim')) return 'comment';
  if (k.includes('error') || k.includes('flare') || k.includes('red') || k.includes('crit')) return 'error';
  if (k.includes('warn') || k.includes('gold') || k.includes('yellow') || k.includes('orange')) return 'warning';
  if (k.includes('success') || k.includes('nebula') || k.includes('green') || k.includes('mint')) return 'success';
  if (k.includes('info') || k.includes('blue') || k.includes('glacier')) return 'info';
  if (k.includes('cyan') || k.includes('teal') || k.includes('frost')) return 'accent-cyan';
  if (k.includes('photon') || k.includes('accent')) return 'accent';
  if (k.includes('magenta') || k.includes('pulsar') || k.includes('lilac') || k.includes('purple')) return 'accent-magenta';
  if (k.match(/^\d+$/) || k.includes('palette')) {
    const n = parseInt(k.replace('palette=', ''));
    if (n >= 8) return 'bright';
    return 'ansi';
  }
  return 'color';
}

export function extractColors(content: string, fileType: FileType): ExtractedColor[] {
  const colors: ExtractedColor[] = [];
  const seen = new Set<string>();

  if (fileType === 'waybar-css') {
    const re = /@define-color\s+([\w\-]+)\s+#([0-9a-fA-F]{6})\s*;?([^;]*)?/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const key = m[1];
      const hex = normalizeHex(m[2]);
      const comment = (m[3] || '').replace(/\/\*|\*\//g, '').trim();
      if (hex && !seen.has(hex + key)) {
        colors.push({ key, hex, comment, role: inferRole(key, hex) });
        seen.add(hex + key);
      }
    }
  }

  if (fileType === 'ghostty-conf') {
    const re1 = /^([\w\-]+)\s*=\s*([0-9a-fA-F]{6})\s*(?:#(.*))?$/gm;
    let m;
    while ((m = re1.exec(content)) !== null) {
      const key = m[1];
      const hex = normalizeHex(m[2]);
      const comment = (m[3] || '').trim();
      if (hex && !seen.has(hex + key)) {
        colors.push({ key, hex, comment, role: inferRole(key, hex) });
        seen.add(hex + key);
      }
    }
    const re2 = /palette\s*=\s*(\d+)=([0-9a-fA-F]{6})/g;
    while ((m = re2.exec(content)) !== null) {
      const key = 'palette=' + m[1];
      const hex = normalizeHex(m[2]);
      if (hex && !seen.has(hex + key)) {
        colors.push({ key, hex, comment: '', role: inferRole(key, hex) });
        seen.add(hex + key);
      }
    }
  }

  if (fileType === 'color-toml' || fileType === 'generic') {
    const re = /^[ \t]*([\w\-]+)[ \t]*=[ \t]*"#?([0-9a-fA-F]{6})"[ \t]*(?:#(.*))?$/gm;
    let m;
    while ((m = re.exec(content)) !== null) {
      const key = m[1];
      const hex = normalizeHex(m[2]);
      const comment = (m[3] || '').trim();
      if (hex && !seen.has(hex + key)) {
        colors.push({ key, hex, comment, role: inferRole(key, hex) });
        seen.add(hex + key);
      }
    }
  }

  if (fileType === 'neovim-lua') {
    const re = /(\w+)\s*=\s*"#([0-9a-fA-F]{6})",?\s*(?:--(.*))?/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const key = m[1];
      const hex = normalizeHex(m[2]);
      const comment = (m[3] || '').trim();
      if (hex && !seen.has(hex + key) && key !== 'return') {
        colors.push({ key, hex, comment, role: inferRole(key, hex) });
        seen.add(hex + key);
      }
    }
    const re2 = /"#([0-9a-fA-F]{6})"/g;
    while ((m = re2.exec(content)) !== null) {
      const hex = normalizeHex(m[1]);
      if (hex && !seen.has(hex)) {
        const ctx = content.substring(Math.max(0, m.index - 30), m.index + 10);
        const keyMatch = ctx.match(/(\w+)\s*=\s*$/);
        const key = keyMatch ? keyMatch[1] : hex;
        seen.add(hex);
        if (!colors.find((c) => c.hex === hex)) {
          colors.push({ key, hex, comment: '', role: inferRole(key, hex) });
        }
      }
    }
  }

  if (colors.length === 0) {
    const re = /#([0-9a-fA-F]{6})\b/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const hex = normalizeHex(m[1]);
      if (hex && !seen.has(hex)) {
        seen.add(hex);
        colors.push({ key: hex, hex, comment: '', role: inferRole(hex, hex) });
      }
    }
  }

  return colors;
}

export function roleColor(role: ColorRole): string {
  const map: Record<string, string> = {
    background: '#2a3233',
    foreground: '#94a8a8',
    cursor: '#2d8a8a',
    selection: '#48678c',
    comment: '#667a7a',
    error: '#d16969',
    warning: '#c9a96e',
    success: '#76a882',
    info: '#6b8eb3',
    'accent-cyan': '#65b3b3',
    accent: '#2d8a8a',
    'accent-magenta': '#a87eb0',
  };
  for (const [k, v] of Object.entries(map)) {
    if (role.startsWith(k)) return v;
  }
  return '#94a8a8';
}
