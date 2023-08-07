import { FONT_WEIGHT_MAP } from './constants';

export function isRgbaValue(value: VariableValue): value is RGBA {
  const values = Object.keys(value);

  return (
    values.includes('r') &&
    values.includes('g') &&
    values.includes('b') &&
    values.includes('a')
  );
}

export function isRgbValue(value: VariableValue): value is RGB {
  const values = Object.keys(value);

  return (
    values.includes('r') &&
    values.includes('g') &&
    values.includes('b') &&
    !values.includes('a')
  );
}

export function isVariableAlias(value: VariableValue): value is VariableAlias {
  const isObject = typeof value === 'object';
  const isColorValue = isRgbaValue(value) || isRgbValue(value);

  return isObject && !isColorValue && value.type === 'VARIABLE_ALIAS';
}

const lineHeightValueUnit = ['PIXELS', 'PERCENT'] as const;

type LineHeightValueUnit = (typeof lineHeightValueUnit)[number];

type LineHeightValue = Extract<LineHeight, { unit: LineHeightValueUnit }>;

export function isLineHeightValue(
  lineHeight: LineHeight,
): lineHeight is LineHeightValue {
  return lineHeight.unit === 'PIXELS' || lineHeight.unit === 'PERCENT';
}

export function isInnerShadowEffect(
  effect: Effect,
): effect is InnerShadowEffect {
  return effect.type === 'INNER_SHADOW';
}

type FontWeight = keyof typeof FONT_WEIGHT_MAP;

export function isFontWeightValue(value: string): value is FontWeight {
  return value in FONT_WEIGHT_MAP;
}
