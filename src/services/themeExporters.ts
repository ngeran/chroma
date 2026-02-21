import { ColorScheme } from '../types/theme';
import { generateToml } from './tomlExporter';

export type ExportFormat = 'toml' | 'btop' | 'ghostty' | 'hyprlock' | 'neovim' | 'waybar' | 'walker';

const hexToRgbStr = (hex: string, alpha?: number) => {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return alpha !== undefined ? `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(1)})` : `rgb(${r}, ${g}, ${b})`;
};

const hexToNs = (hex: string) => hex.replace('#', '');

export interface ExporterConfig {
  id: ExportFormat;
  name: string;
  ext: string;
  filename: (scheme: ColorScheme) => string;
  generate: (scheme: ColorScheme) => string;
}

export const exporters: ExporterConfig[] = [
  {
    id: 'toml',
    name: 'Omarchy Colors',
    ext: '.toml',
    filename: () => 'colors.toml',
    generate: generateToml,
  },
  {
    id: 'btop',
    name: 'Btop System Monitor',
    ext: '.theme',
    filename: (s) => `${s.name.toLowerCase()}.theme`,
    generate: (scheme) => `# ============================================================================
# 🌌 ${scheme.name.toUpperCase()} - btop System Monitor
# ============================================================================
# OLED Optimized: Pure Black backgrounds, low-luminance spectral accents.
# ============================================================================

# ----------------------------------------------------------------------------
# CORE COLORS (${scheme.name} Palette)
# ----------------------------------------------------------------------------

theme[main_bg]="${scheme.core.background}"
theme[main_fg]="${scheme.core.foreground}"
theme[title]="${scheme.terminal.color15}"
theme[hi_fg]="${scheme.core.accent_bright}"
theme[selected_bg]="${scheme.core.selection_bg}"
theme[selected_fg]="${scheme.core.selection_fg}"
theme[inactive_fg]="${scheme.terminal.color0}"
theme[proc_misc]="${scheme.terminal.color4}"

# Box Outlines
theme[cpu_box]="${scheme.core.selection_bg}"
theme[mem_box]="${scheme.core.selection_bg}"
theme[net_box]="${scheme.core.selection_bg}"
theme[proc_box]="${scheme.core.selection_bg}"
theme[div_line]="${scheme.core.selection_bg}"

# Temperature Graph
theme[temp_start]="${scheme.terminal.color6}"
theme[temp_mid]="${scheme.terminal.color11}"
theme[temp_end]="${scheme.terminal.color9}"

# CPU Usage Graph
theme[cpu_start]="${scheme.core.selection_bg}"
theme[cpu_mid]="${scheme.terminal.color14}"
theme[cpu_end]="${scheme.terminal.color15}"

# Memory Meters
theme[free_start]="${scheme.terminal.color2}"
theme[free_mid]="${scheme.terminal.color10}"
theme[free_end]="${scheme.core.foreground}"

theme[cached_start]="${scheme.terminal.color5}"
theme[cached_mid]="${scheme.terminal.color13}"
theme[cached_end]="${scheme.terminal.color15}"

theme[available_start]="${scheme.terminal.color6}"
theme[available_mid]="${scheme.terminal.color14}"
theme[available_end]="${scheme.terminal.color15}"

theme[used_start]="${scheme.terminal.color3}"
theme[used_mid]="${scheme.terminal.color11}"
theme[used_end]="${scheme.terminal.color9}"

# Network Graphs
theme[download_start]="${scheme.terminal.color6}"
theme[download_mid]="${scheme.terminal.color14}"
theme[download_end]="${scheme.terminal.color15}"

theme[upload_start]="${scheme.terminal.color5}"
theme[upload_mid]="${scheme.terminal.color13}"
theme[upload_end]="${scheme.terminal.color15}"

# Process Graph
theme[process_start]="${scheme.terminal.color6}"
theme[process_mid]="${scheme.terminal.color14}"
theme[process_end]="${scheme.core.accent_bright}"
`,
  },
  {
    id: 'ghostty',
    name: 'Ghostty Terminal',
    ext: '.conf',
    filename: () => `ghostty.conf`,
    generate: (scheme) => `# ============================================================================
# 🌌 ${scheme.name.toUpperCase()} - Ghostty Terminal Configuration
# ============================================================================
# OLED Optimized: Pure Black backgrounds, low-luminance spectral accents.
# ============================================================================

# ----------------------------------------------------------------------------
# CORE UI (${scheme.name} Palette)
# ----------------------------------------------------------------------------

background = ${hexToNs(scheme.core.background)}
foreground = ${hexToNs(scheme.core.foreground)}

cursor-color = ${hexToNs(scheme.core.accent_bright)}
cursor-text = 000000
cursor-style = block
cursor-style-blink = false

selection-background = ${hexToNs(scheme.core.selection_bg)}
selection-foreground = ${hexToNs(scheme.core.selection_fg)}

# ----------------------------------------------------------------------------
# WINDOW APPEARANCE
# ----------------------------------------------------------------------------
window-padding-x = 10
window-padding-y = 10
window-decoration = false
confirm-close-surface = false

# ----------------------------------------------------------------------------
# TERMINAL PALETTE (ANSI 16)
# ----------------------------------------------------------------------------

palette = 0=${hexToNs(scheme.terminal.color0)}
palette = 1=${hexToNs(scheme.terminal.color1)}
palette = 2=${hexToNs(scheme.terminal.color2)}
palette = 3=${hexToNs(scheme.terminal.color3)}
palette = 4=${hexToNs(scheme.terminal.color4)}
palette = 5=${hexToNs(scheme.terminal.color5)}
palette = 6=${hexToNs(scheme.terminal.color6)}
palette = 7=${hexToNs(scheme.terminal.color7)}
palette = 8=${hexToNs(scheme.terminal.color8)}
palette = 9=${hexToNs(scheme.terminal.color9)}
palette = 10=${hexToNs(scheme.terminal.color10)}
palette = 11=${hexToNs(scheme.terminal.color11)}
palette = 12=${hexToNs(scheme.terminal.color12)}
palette = 13=${hexToNs(scheme.terminal.color13)}
palette = 14=${hexToNs(scheme.terminal.color14)}
palette = 15=${hexToNs(scheme.terminal.color15)}

# Performance & Render matching
adjust-cursor-thickness = 1
# font-family = "JetBrains Mono"
# font-size = 12
`,
  },
  {
    id: 'hyprlock',
    name: 'Hyprlock',
    ext: '.conf',
    filename: () => `hyprlock.conf`,
    generate: (scheme) => `# ============================================================================
# 🌌 ${scheme.name.toUpperCase()} - Hyprlock Configuration
# ============================================================================

# CORE SURFACES
$background_color   = ${hexToRgbStr(scheme.core.background, 1.0)}
$inner_color        = ${hexToRgbStr(scheme.core.background, 1.0)}
$outer_color        = ${hexToRgbStr(scheme.terminal.color6, 0.4)}
$overlay_color      = rgba(0, 0, 0, 0.5)

# TYPOGRAPHY
$font_color         = ${hexToRgbStr(scheme.terminal.color15, 1.0)}
$placeholder_color  = ${hexToRgbStr(scheme.terminal.color7, 0.7)}

# STATE COLORS
$check_color        = ${hexToRgbStr(scheme.terminal.color14, 1.0)}
$highlight_color    = ${hexToRgbStr(scheme.core.accent_bright, 0.6)}
$typing_color       = ${hexToRgbStr(scheme.terminal.color4, 1.0)}
$error_color        = ${hexToRgbStr(scheme.terminal.color9, 1.0)}
$warning_color      = ${hexToRgbStr(scheme.terminal.color11, 1.0)}
`,
  },
  {
    id: 'neovim',
    name: 'Neovim (Nightfox)',
    ext: '.lua',
    filename: () => `neovim.lua`,
    generate: (scheme) => `return {
  "EdenEast/nightfox.nvim",
  lazy = false,
  priority = 1000,
  dependencies = {
    "folke/snacks.nvim",
    "nvim-tree/nvim-web-devicons",
    "nvim-lualine/lualine.nvim",
  },

  config = function()
    local nightfox = require('nightfox')
    local Shade = require('nightfox.lib.shade')

    local singularity = {
      void    = "${scheme.core.background}",
      silver  = "${scheme.terminal.color15}",
      ash     = "${scheme.core.foreground}",
      gas     = "${scheme.terminal.color7}",
      cyan    = "${scheme.terminal.color14}",
      photon  = "${scheme.core.accent_bright}",
      gravity = "${scheme.core.selection_bg}",
      flare   = "${scheme.terminal.color9}",
      nebula  = "${scheme.terminal.color10}",
      gold    = "${scheme.terminal.color11}",
      pulsar  = "${scheme.terminal.color13}",
    }

    local cosmos_palette = {
      bg0     = singularity.void,
      bg1     = singularity.void,
      bg2     = "${scheme.terminal.color0}",
      bg3     = "${scheme.core.selection_bg}",
      fg0     = singularity.silver,
      fg1     = singularity.ash,
      fg3     = singularity.gas,
      sel0    = singularity.gravity,
      sel1    = singularity.cyan,
      comment = singularity.gas,

      red     = Shade.new(singularity.flare, "${scheme.terminal.color1}", "${scheme.terminal.color1}"),
      orange  = Shade.new(singularity.gold, "${scheme.terminal.color3}", "${scheme.terminal.color3}"),
      yellow  = Shade.new(singularity.gold, "${scheme.terminal.color11}", "${scheme.terminal.color3}"),
      green   = Shade.new(singularity.nebula, "${scheme.terminal.color2}", "${scheme.terminal.color2}"),
      cyan    = Shade.new(singularity.cyan, "${scheme.terminal.color6}", "${scheme.terminal.color6}"),
      blue    = Shade.new(singularity.photon, "${scheme.terminal.color12}", "${scheme.terminal.color4}"),
      magenta = Shade.new(singularity.pulsar, "${scheme.terminal.color5}", "${scheme.terminal.color5}"),
      white   = Shade.new(singularity.silver, "${scheme.terminal.color15}", "${scheme.terminal.color7}"),
    }

    nightfox.setup({
      options = {
        style = "carbonfox",
        dim_inactive = true,
        styles = { comments = "italic", functions = "bold", keywords = "bold" },
      },
      palettes = {
        carbonfox = cosmos_palette
      },
      specs = {
        carbonfox = {
          syntax = {
            keyword  = "red",
            func     = "cyan",
            string   = "green",
            number   = "magenta",
            variable = "fg1",
            const    = "orange",
          }
        }
      },
      groups = {
        all = {
          Normal        = { bg = "palette.bg0", fg = "palette.fg1" },
          LineNr        = { fg = "palette.bg4" },
          CursorLineNr  = { fg = "palette.cyan", style = "bold" },
          NeoTreeNormal = { bg = "palette.bg0" },
          Visual        = { bg = "palette.sel0" },
          CursorLine    = { bg = "palette.bg3" },
          StatusLine    = { bg = "palette.bg0", fg = "palette.fg1" },
          VertSplit     = { fg = "palette.bg2" },
        }
      }
    })

    vim.cmd("colorscheme carbonfox")

    local lualine_theme = {
      normal = {
        a = { fg = singularity.photon, bg = singularity.void, gui = "bold" },
        b = { fg = singularity.silver, bg = singularity.void },
        c = { fg = singularity.gas, bg = singularity.void },
      },
      insert = {
        a = { fg = singularity.nebula, bg = singularity.void, gui = "bold" },
        b = { fg = singularity.silver, bg = singularity.void },
        c = { fg = singularity.gas, bg = singularity.void },
      },
      visual = {
        a = { fg = singularity.pulsar, bg = singularity.void, gui = "bold" },
        b = { fg = singularity.silver, bg = singularity.void },
        c = { fg = singularity.gas, bg = singularity.void },
      },
      inactive = {
        a = { fg = singularity.gas, bg = singularity.void },
        c = { fg = singularity.gas, bg = singularity.void },
      },
    }

    require('lualine').setup({
      options = {
        theme = lualine_theme,
        component_separators = '',
        section_separators = '',
        globalstatus = true,
      },
    })
  end,
}
`,
  },
  {
    id: 'waybar',
    name: 'Waybar',
    ext: '.css',
    filename: () => `waybar.css`,
    generate: (scheme) => `/* ============================================================================
 * 🌌 ${scheme.name.toUpperCase()} - Waybar Status Bar
 * ============================================================================
 */

@define-color background     ${scheme.core.background};
@define-color background-alt ${scheme.terminal.color0}; /* Dark Matter */
@define-color border         ${scheme.core.selection_bg}; /* Gravity Blue */

@define-color text-primary   ${scheme.core.foreground}; /* Deep Ash Teal */
@define-color silver         ${scheme.terminal.color15}; /* Spectral Silver */
@define-color cyan           ${scheme.terminal.color14}; /* Ionized Cyan */
@define-color photon         ${scheme.core.accent_bright}; /* Photon Blue */

@define-color success        ${scheme.terminal.color2}; /* Nebula Green */
@define-color warning        ${scheme.terminal.color11}; /* Starfire Gold */
@define-color error          ${scheme.terminal.color9}; /* Solar Flare Red */
@define-color info           ${scheme.terminal.color12}; /* Comet Blue */

* {
    font-family: "MesloLGS NF", "Meslo Nerd Font", sans-serif;
    font-size: 13px;
    min-height: 0;
    border: none;
    box-shadow: none;
}

window#waybar {
    background-color: @background;
    color: @text-primary;
    border-bottom: 1px solid @border;
}

#workspaces button {
    background-color: transparent;
    color: @text-primary;
    padding: 0 8px;
    margin: 4px 2px;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
}

#workspaces button.active {
    background-color: transparent;
    color: @silver;
    border-bottom: 2px solid #2a4a4a;
}

#workspaces button.urgent {
    color: @error;
    border-bottom: 2px solid @error;
}

#workspaces button:hover {
    background-color: @background-alt;
    color: @photon;
    border-bottom: 2px solid @photon;
}

#clock, #battery, #cpu, #memory, #temperature, #network, #pulseaudio, #bluetooth, #tray {
    padding: 0 10px;
    margin: 4px 0px;
    background-color: transparent;
    color: @text-primary;
}

#clock { color: @silver; font-weight: bold; }
#battery { color: @success; }
#battery.charging { color: @photon; }
#battery.warning:not(.charging) { color: @warning; }
#battery.critical:not(.charging) { color: @error; font-weight: bold; }

#cpu { color: @info; }
#memory { color: @cyan; }
#temperature { color: @success; }
#temperature.critical { color: @error; }

#network { color: @cyan; }
#network.disconnected { color: @error; }

#pulseaudio { color: @text-primary; }
#pulseaudio.muted { color: @background-alt; }

#tray { margin-right: 8px; }

tooltip {
    background-color: @background;
    color: @silver;
    border: 1px solid @cyan;
    border-radius: 0px;
}
`,
  },
  {
    id: 'walker',
    name: 'Walker Launcher',
    ext: '.css',
    filename: () => `walker.css`,
    generate: (scheme) => `/* ============================================================================
 * 🌌 ${scheme.name.toUpperCase()} - Walker Application Launcher
 * ============================================================================
 */

@define-color base           ${scheme.core.background};
@define-color text           ${scheme.core.foreground};
@define-color silver         ${scheme.terminal.color15};
@define-color border         ${scheme.core.selection_bg};
@define-color accent         ${scheme.terminal.color14};
@define-color photon         ${scheme.core.accent_bright};
@define-color selection-bg   ${scheme.terminal.color0};
@define-color text-dim       ${scheme.terminal.color7};

window {
    background-color: @base;
    border: 1px solid @border;
    border-radius: 0px;
}

entry {
    background-color: @base;
    color: @silver;
    border-bottom: 1px solid @border;
    padding: 12px 16px;
    caret-color: @photon;
}

entry:focus { border-bottom-color: @accent; }
entry placeholder { color: @text-dim; }

list {
    background-color: @base;
    padding: 8px 0;
}

row {
    background-color: transparent;
    color: @text;
    padding: 8px 16px;
    transition: all 0.2s ease;
}

row:hover {
    background-color: @selection-bg;
    color: @silver;
}

row:selected,
row:active {
    background-color: @selection-bg;
    color: @silver;
    border-left: 2px solid @photon;
}

label.title { color: @silver; font-weight: bold; }
label.subtitle { color: @text-dim; font-size: 11px; }
.match { color: @photon; font-weight: bold; }
row:selected label.title { color: @photon; }

scrollbar slider {
    background-color: @border;
    border-radius: 0px;
    min-width: 4px;
}

button {
    background-color: @base;
    color: @text;
    border: 1px solid @border;
    border-radius: 0px;
    padding: 6px 12px;
}

button:hover {
    background-color: @selection-bg;
    border-color: @accent;
    color: @photon;
}
`,
  }
];

export function generateExportFile(scheme: ColorScheme, formatId: ExportFormat): string {
  const exporter = exporters.find(e => e.id === formatId);
  if (!exporter) return '';
  return exporter.generate(scheme);
}

export function downloadExportFile(scheme: ColorScheme, formatId: ExportFormat) {
  const exporter = exporters.find(e => e.id === formatId);
  if (!exporter) return;
  
  const content = exporter.generate(scheme);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = exporter.filename(scheme);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
