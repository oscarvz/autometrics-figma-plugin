import {
  addToThemeObject,
  getColorValue,
  getCssVariableName,
  getSortedArrayFromSet,
  getSplitName,
} from './utils';

const PREFIX = 'effect';

export function generateEffects(themeObject: object) {
  const effectStyles = figma.getLocalEffectStyles();

  const effectCssVariables = new Set<string>();

  for (const { effects, name } of effectStyles) {
    const effect = effects[0];

    if (isDropShadowEffect(effect)) {
      const { color, offset, radius, spread } = effect;
      const colorValue = getColorValue(color);

      const boxShadowCssValue = `${offset.x}px ${offset.y}px ${radius}px ${spread}px ${colorValue}`;
      const cssVariableName = getCssVariableName(name, { prefix: PREFIX });

      effectCssVariables.add(`${cssVariableName}: ${boxShadowCssValue};`);

      const paths = getSplitName(name);
      const prefixedPaths = [PREFIX, ...paths];
      addToThemeObject(prefixedPaths, cssVariableName, themeObject);
    }
  }

  return {
    effectCssVariables: getSortedArrayFromSet(effectCssVariables),
  };
}

function isDropShadowEffect(effect: Effect): effect is DropShadowEffect {
  return effect.type === 'DROP_SHADOW';
}
