import {
  addToThemeObject,
  getColorValue,
  getCssVariable,
  getSortedArrayFromSet,
  getSplitName,
} from './utils';

const PREFIX = 'effect';

export function generateEffects(themeObject: object) {
  const effectStyles = figma.getLocalEffectStyles();

  const effectCssVariables = new Set<string>();

  for (const { effects, name } of effectStyles) {
    for (const effect of effects) {
      switch (effect.type) {
        case 'DROP_SHADOW':
          handleDropShadowEffect(effect, name, effectCssVariables, themeObject);
          break;
        case 'INNER_SHADOW':
          break;
        case 'LAYER_BLUR':
          break;
        case 'BACKGROUND_BLUR':
          break;
      }
    }
  }

  return {
    effectCssVariables: getSortedArrayFromSet(effectCssVariables),
  };
}

function handleDropShadowEffect(
  effect: DropShadowEffect,
  name: EffectStyle['name'],
  effectCssVariables: Set<string>,
  themeObject: object,
) {
  const { color, offset, radius, spread } = effect;
  const colorValue = getColorValue(color);

  const boxShadowCssValue = `${offset.x}px ${offset.y}px ${radius}px ${spread}px ${colorValue}`;
  const { cssVariable, cssVariableName } = getCssVariable(
    name,
    boxShadowCssValue,
    {
      prefix: PREFIX,
    },
  );

  effectCssVariables.add(cssVariable);

  const paths = getSplitName(name);
  const prefixedPaths = [PREFIX, ...paths];
  addToThemeObject(prefixedPaths, cssVariableName, themeObject);
}
