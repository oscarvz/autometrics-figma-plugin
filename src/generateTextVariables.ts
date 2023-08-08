import { FONT_WEIGHT_MAP, SPLIT_BY } from './constants';
import { isFontWeightValue, isLineHeightValue } from './typeGuards';
import { addToThemeObject, getCssVariable, getSplitName } from './utils';

const PREFIX = 'font';

export function generateTextVariables(themeObject: object) {
  const textStyles = figma.getLocalTextStyles();

  const textCssVariables = new Set<string>();

  for (const textStyle of textStyles) {
    const { fontName, fontSize, lineHeight, name } = textStyle;

    let lineHeightValue: string | number = 1;
    if (isLineHeightValue(lineHeight)) {
      const unit = lineHeight.unit === 'PERCENT' ? '%' : 'px';
      lineHeightValue = `${lineHeight.value}${unit}`;
    }

    const fontStyle = fontName.style.toUpperCase().split(SPLIT_BY).join('');
    const isFontWeight = isFontWeightValue(fontStyle);
    const fontWeightValue =
      FONT_WEIGHT_MAP[isFontWeight ? fontStyle : 'REGULAR'];

    const cssShorthandValue = `${fontWeightValue} ${fontSize}px / ${lineHeightValue} ${fontName.family}`;

    const { cssVariable, cssVariableName } = getCssVariable(
      name,
      cssShorthandValue,
      {
        prefix: PREFIX,
      },
    );

    textCssVariables.add(cssVariable);

    const paths = getSplitName(name);
    const prefixedPaths = [PREFIX, ...paths];
    addToThemeObject(prefixedPaths, cssVariableName, themeObject);
  }

  return { textCssVariables: [...textCssVariables] };
}
