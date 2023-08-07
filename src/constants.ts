/**
 *  Split by dash, slash, backslash & space
 */
export const SPLIT_BY = /[-/ _\\]/;

// TODO: Add font italic styles
/**
 * Map of font weights coming from Figma.
 * ... why isn't this typed in the Figma API?
 */
export const FONT_WEIGHT_MAP = {
  THIN: 100,
  EXTRA_LIGHT: 200,
  LIGHT: 300,
  REGULAR: 400,
  MEDIUM: 500,
  SEMI_BOLD: 600,
  BOLD: 700,
  EXTRA_BOLD: 800,
  BLACK: 900,
} as const;
