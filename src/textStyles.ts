import { SPLIT_BY } from './constants';
import { isLineHeightValue } from './typeGuards';
import { addToThemeObject, getCssVariableName, getSplitName } from './utils';

export function generateTextVariables() {
  const textStyles = figma.getLocalTextStyles();

  const atomicCssVariables = new Set<string>();

  const theme = {};

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

    atomicCssVariables.add(atomicCssVariable);

    const paths = getSplitName(name);
    addToThemeObject(paths, cssVariableName, theme);
  }
}
