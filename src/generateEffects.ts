import { isInnerShadowEffect } from './typeGuards';
import {
  addToThemeObject,
  getColorValue,
  getCssVariable,
  getSplitName,
} from './utils';

const PREFIX = 'effect';

export function generateEffects(themeObject: object) {
  const effectStyles = figma.getLocalEffectStyles();

  const effectCssVariables = new Set<string>();

  for (const { effects, name } of effectStyles) {
    const variableValues = new Set<string>();
    const hasMultipleEffects = effects.length > 1;

    for (const effect of effects) {
      switch (effect.type) {
        case 'INNER_SHADOW':
        case 'DROP_SHADOW': {
          const variableValue = handleShadowEffect(effect, hasMultipleEffects);
          if (variableValue) {
            variableValues.add(variableValue);
          }
          break;
        }
        case 'BACKGROUND_BLUR':
        case 'LAYER_BLUR': {
          const variableValue = handleBlurEffect(effect);
          variableValues.add(variableValue);
          break;
        }
      }
    }

    const cssVariableValue = Array.from(variableValues).join(' ');
    const { cssVariable, cssVariableName } = getCssVariable(
      name,
      cssVariableValue,
    );
    effectCssVariables.add(cssVariable);

    const paths = getSplitName(name);
    const prefixedPaths = [PREFIX, ...paths];
    addToThemeObject(prefixedPaths, cssVariableName, themeObject);
  }

  return {
    effectCssVariables: [...effectCssVariables],
  };
}

function handleShadowEffect(
  effect: DropShadowEffect | InnerShadowEffect,
  hasMultipleEffects: boolean,
) {
  const { color, offset, radius, spread } = effect;
  const colorValue = getColorValue(color);
  const isInnerEffect = isInnerShadowEffect(effect);

  const cssShadowValue = `${offset.x}px ${offset.y}px ${radius}px ${spread}px ${colorValue}`;
  const cssValue = `${isInnerEffect ? 'inset ' : ''}${cssShadowValue}`;

  if (hasMultipleEffects) {
    // Return early when combining multiple effects that contains an inner
    // shadow as it's unsupported by `drop-shadow()`
    // https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow
    if (isInnerEffect) {
      return;
    }

    return `drop-shadow(${cssValue})`;
  }

  return cssValue;
}

function handleBlurEffect({ radius }: BlurEffect) {
  const cssValue = `blur(${radius}px)`;
  return cssValue;
}
