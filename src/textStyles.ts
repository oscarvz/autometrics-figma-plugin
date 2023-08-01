import { isLineHeightValue } from './typeGuards';
import {
  addToThemeObject,
  getCssVariableName,
  getSortedArrayFromSet,
  getSplitName,
} from './utils';

export function generateTextVariables(themeObject: {}) {
  const textStyles = figma.getLocalTextStyles();

  const textCssVariables = new Set<string>();

  for (const textStyle of textStyles) {
    const { fontName, fontSize, lineHeight, name } = textStyle;

    let lineHeightValue;

    if (isLineHeightValue(lineHeight)) {
      const unit = lineHeight.unit === 'PERCENT' ? '%' : 'px';
      lineHeightValue = `${lineHeight.value}${unit}`;
    }

    const cssShorthandValue = `normal ${fontSize}px${
      lineHeightValue ? ` / ${lineHeightValue}` : ''
    } ${fontName.family}`;

    const cssVariableName = getCssVariableName(name);
    const atomicCssVariable = `${cssVariableName}: ${cssShorthandValue};`;

    textCssVariables.add(atomicCssVariable);

    const paths = getSplitName(name);
    addToThemeObject(paths, cssVariableName, themeObject);
  }

  return { textCssVariables: getSortedArrayFromSet(textCssVariables) };
}
