import { isLineHeightValue } from './typeGuards';
import { addToThemeObject, getCssVariable, getSplitName } from './utils';

const PREFIX = 'font';

export function generateTextVariables(themeObject: object) {
  const textStyles = figma.getLocalTextStyles();

  const textCssVariables = new Set<string>();

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
