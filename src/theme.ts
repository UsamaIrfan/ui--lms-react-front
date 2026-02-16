/**
 * LMS Design System — Theme Constants
 *
 * TypeScript-accessible design tokens that mirror the CSS custom properties
 * defined in globals.css. Use these when you need token values in JS/TS
 * (e.g. charting libraries, inline styles, canvas rendering).
 *
 * For Tailwind utility classes, use the semantic class names directly:
 *   bg-primary-base, text-error-base, border-stroke-soft-200, etc.
 */

/* ================================================================
   Color Scales
   ================================================================ */

export const gray = {
  0: "#ffffff",
  50: "#f8f9fb",
  100: "#eef0f4",
  200: "#d5d9e2",
  300: "#b8bfcc",
  400: "#9ba3b3",
  500: "#717b8e",
  600: "#525c6e",
  700: "#3d4654",
  800: "#282f3d",
  900: "#161b26",
  950: "#0a0d14",
} as const;

export const blue = {
  50: "#eef4ff",
  100: "#d9e6ff",
  200: "#bbcfff",
  300: "#8badff",
  400: "#5481ff",
  500: "#335cff",
  600: "#1b40f5",
  700: "#132de1",
  800: "#1626b6",
  900: "#18258f",
  950: "#141957",
} as const;

export const red = {
  50: "#fef2f2",
  100: "#fee2e2",
  200: "#fecaca",
  300: "#fca5a5",
  400: "#f87171",
  500: "#ef4444",
  600: "#dc2626",
  700: "#b91c1c",
  800: "#991b1b",
  900: "#7f1d1d",
  950: "#450a0a",
} as const;

export const green = {
  50: "#f0fdf4",
  100: "#dcfce7",
  200: "#bbf7d0",
  300: "#86efac",
  400: "#4ade80",
  500: "#22c55e",
  600: "#16a34a",
  700: "#15803d",
  800: "#166534",
  900: "#14532d",
  950: "#052e16",
} as const;

export const yellow = {
  50: "#fefce8",
  100: "#fef9c3",
  200: "#fef08a",
  300: "#fde047",
  400: "#facc15",
  500: "#eab308",
  600: "#ca8a04",
  700: "#a16207",
  800: "#854d0e",
  900: "#713f12",
  950: "#422006",
} as const;

export const orange = {
  50: "#fff7ed",
  100: "#ffedd5",
  200: "#fed7aa",
  300: "#fdba74",
  400: "#fb923c",
  500: "#f97316",
  600: "#ea580c",
  700: "#c2410c",
  800: "#9a3412",
  900: "#7c2d12",
  950: "#431407",
} as const;

export const purple = {
  50: "#faf5ff",
  100: "#f3e8ff",
  200: "#e9d5ff",
  300: "#d8b4fe",
  400: "#c084fc",
  500: "#a855f7",
  600: "#9333ea",
  700: "#7e22ce",
  800: "#6b21a8",
  900: "#581c87",
  950: "#3b0764",
} as const;

export const sky = {
  50: "#f0f9ff",
  100: "#e0f2fe",
  200: "#bae6fd",
  300: "#7dd3fc",
  400: "#38bdf8",
  500: "#0ea5e9",
  600: "#0284c7",
  700: "#0369a1",
  800: "#075985",
  900: "#0c4a6e",
  950: "#082f49",
} as const;

export const pink = {
  50: "#fdf2f8",
  100: "#fce7f3",
  200: "#fbcfe8",
  300: "#f9a8d4",
  400: "#f472b6",
  500: "#ec4899",
  600: "#db2777",
  700: "#be185d",
  800: "#9d174d",
  900: "#831843",
  950: "#500724",
} as const;

export const teal = {
  50: "#f0fdfa",
  100: "#ccfbf1",
  200: "#99f6e4",
  300: "#5eead4",
  400: "#2dd4bf",
  500: "#14b8a6",
  600: "#0d9488",
  700: "#0f766e",
  800: "#115e59",
  900: "#134e4a",
  950: "#042f2e",
} as const;

export const neutral = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#e5e5e5",
  300: "#d4d4d4",
  400: "#a3a3a3",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
  950: "#0a0a0a",
} as const;

/** All base color scales keyed by name */
export const colors = {
  gray,
  blue,
  red,
  green,
  yellow,
  orange,
  purple,
  sky,
  pink,
  teal,
  neutral,
} as const;

/* ================================================================
   Semantic Tokens
   ================================================================ */

/** Primary brand color tokens */
export const primary = {
  base: blue[500],
  dark: blue[950],
  darker: blue[900],
} as const;

/** Background semantic tokens */
export const bg = {
  strong: gray[950],
  surface: gray[800],
  sub: gray[300],
  soft: gray[200],
  weak: gray[50],
  white: gray[0],
} as const;

/** Text semantic tokens */
export const text = {
  strong: gray[950],
  sub: gray[600],
  soft: gray[400],
  disabled: gray[300],
  white: gray[0],
} as const;

/** Stroke / border semantic tokens */
export const stroke = {
  strong: gray[950],
  sub: gray[300],
  soft: gray[200],
  white: gray[0],
} as const;

/** Status color tokens — each with dark / base / light / lighter */
export const status = {
  faded: {
    dark: gray[400],
    base: gray[300],
    light: gray[200],
    lighter: gray[100],
  },
  information: {
    dark: blue[700],
    base: blue[500],
    light: blue[300],
    lighter: blue[100],
  },
  warning: {
    dark: yellow[700],
    base: yellow[500],
    light: yellow[300],
    lighter: yellow[100],
  },
  error: {
    dark: red[600],
    base: red[500],
    light: red[300],
    lighter: red[100],
  },
  success: {
    dark: green[600],
    base: green[500],
    light: green[300],
    lighter: green[100],
  },
  away: {
    dark: yellow[700],
    base: yellow[500],
    light: yellow[300],
    lighter: yellow[100],
  },
  feature: {
    dark: purple[700],
    base: purple[500],
    light: purple[300],
    lighter: purple[100],
  },
  verified: {
    dark: sky[700],
    base: sky[500],
    light: sky[300],
    lighter: sky[100],
  },
  highlighted: {
    dark: orange[700],
    base: orange[500],
    light: orange[300],
    lighter: orange[100],
  },
  stable: {
    dark: teal[700],
    base: teal[500],
    light: teal[300],
    lighter: teal[100],
  },
} as const;

/* ================================================================
   Typography Scale
   ================================================================ */

export const typography = {
  title: {
    h1: {
      size: "3.5rem",
      lineHeight: "4rem",
      letterSpacing: "-0.01em",
      weight: 500,
    },
    h2: {
      size: "2.5rem",
      lineHeight: "3rem",
      letterSpacing: "-0.01em",
      weight: 500,
    },
    h3: {
      size: "2rem",
      lineHeight: "2.5rem",
      letterSpacing: "-0.01em",
      weight: 500,
    },
    h4: {
      size: "1.75rem",
      lineHeight: "2.25rem",
      letterSpacing: "-0.005em",
      weight: 500,
    },
    h5: {
      size: "1.5rem",
      lineHeight: "2rem",
      letterSpacing: "-0.005em",
      weight: 500,
    },
    h6: {
      size: "1.25rem",
      lineHeight: "1.75rem",
      letterSpacing: "-0.005em",
      weight: 500,
    },
  },
  label: {
    xl: {
      size: "1.5rem",
      lineHeight: "2rem",
      letterSpacing: "0em",
      weight: 500,
    },
    lg: {
      size: "1.125rem",
      lineHeight: "1.5rem",
      letterSpacing: "0em",
      weight: 500,
    },
    md: {
      size: "1rem",
      lineHeight: "1.5rem",
      letterSpacing: "0em",
      weight: 500,
    },
    sm: {
      size: "0.875rem",
      lineHeight: "1.25rem",
      letterSpacing: "0em",
      weight: 500,
    },
    xs: {
      size: "0.75rem",
      lineHeight: "1rem",
      letterSpacing: "0em",
      weight: 500,
    },
  },
  paragraph: {
    xl: {
      size: "1.5rem",
      lineHeight: "2rem",
      letterSpacing: "0em",
      weight: 400,
    },
    lg: {
      size: "1.125rem",
      lineHeight: "1.75rem",
      letterSpacing: "0em",
      weight: 400,
    },
    md: {
      size: "1rem",
      lineHeight: "1.5rem",
      letterSpacing: "0em",
      weight: 400,
    },
    sm: {
      size: "0.875rem",
      lineHeight: "1.25rem",
      letterSpacing: "0em",
      weight: 400,
    },
    xs: {
      size: "0.75rem",
      lineHeight: "1rem",
      letterSpacing: "0em",
      weight: 400,
    },
  },
  subheading: {
    md: {
      size: "1rem",
      lineHeight: "1.5rem",
      letterSpacing: "0.06em",
      weight: 500,
    },
    sm: {
      size: "0.875rem",
      lineHeight: "1.25rem",
      letterSpacing: "0.06em",
      weight: 500,
    },
    xs: {
      size: "0.75rem",
      lineHeight: "1rem",
      letterSpacing: "0.06em",
      weight: 500,
    },
    "2xs": {
      size: "0.6875rem",
      lineHeight: "0.75rem",
      letterSpacing: "0.06em",
      weight: 500,
    },
  },
} as const;

/* ================================================================
   Shadows
   ================================================================ */

export const shadows = {
  xs: "0 1px 2px 0 rgba(10, 13, 20, 0.03)",
  sm: "0 2px 4px 0 rgba(10, 13, 20, 0.03), 0 1px 2px 0 rgba(10, 13, 20, 0.08)",
  md: "0 16px 32px -12px rgba(10, 13, 20, 0.08)",
  tooltip:
    "0 12px 24px 0 rgba(10, 13, 20, 0.08), 0 1px 2px 0 rgba(10, 13, 20, 0.08)",
} as const;

/* ================================================================
   Breakpoints
   ================================================================ */

export const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/* ================================================================
   Border Radius
   ================================================================ */

export const radius = {
  10: "0.625rem",
  20: "1.25rem",
} as const;

/* ================================================================
   TypeScript Types
   ================================================================ */

export type ColorScale = typeof gray;
export type ColorScaleName = keyof typeof colors;
export type SemanticBg = keyof typeof bg;
export type SemanticText = keyof typeof text;
export type SemanticStroke = keyof typeof stroke;
export type StatusName = keyof typeof status;
export type StatusVariant = "dark" | "base" | "light" | "lighter";
export type TypographyCategory = keyof typeof typography;
export type BreakpointName = keyof typeof breakpoints;
