import { isLineHeightValue } from './typeGuards';
import {
  addToThemeObject,
  getCssVariableName,
  getSortedArrayFromSet,
  getSplitName,
} from './utils';

const PREFIX = 'font';

export function generateTextVariables(themeObject: object) {
  const textStyles = figma.getLocalTextStyles();

  const textCssVariables = new Set<string>();

  // regular 400
  // medium 500
  for (const textStyle of textStyles) {
    const { fontName, fontSize, lineHeight, name } = textStyle;

    let lineHeightValue;

    if (isLineHeightValue(lineHeight)) {
      const unit = lineHeight.unit === 'PERCENT' ? '%' : 'px';
      lineHeightValue = `${lineHeight.value}${unit}`;
    }

    // TODO: fix hardcoded font style
    const cssShorthandValue = `normal ${fontSize}px${
      lineHeightValue ? ` / ${lineHeightValue}` : ''
    } ${fontName.family}`;

    const cssVariableName = getCssVariableName(name, { prefix: PREFIX });
    const atomicCssVariable = `${cssVariableName}: ${cssShorthandValue};`;

    textCssVariables.add(atomicCssVariable);

    const paths = getSplitName(name);
    const prefixedPaths = [PREFIX, ...paths];
    addToThemeObject(prefixedPaths, cssVariableName, themeObject);
  }

  return { textCssVariables: getSortedArrayFromSet(textCssVariables) };
}
