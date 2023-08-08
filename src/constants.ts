/**
 *  Split by dash, slash, backslash & space
 */
export const SPLIT_BY = /[-/ _\\]/;

// TODO: Add font italic styles
/**
 * Map of font weights coming from Figma.
 * ... why isn't this typed in the Figma API?
 * Update: discovered that different environments have these names either split
 * but an underscore whereas the other one doesn't have an underscore.
 * Needs some more investigation 🕵️
 */
export const FONT_WEIGHT_MAP = {
  THIN: 100,
  EXTRALIGHT: 200,
  LIGHT: 300,
  REGULAR: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
  EXTRABOLD: 800,
  BLACK: 900,
} as const;
