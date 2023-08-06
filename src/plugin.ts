import { generateTextVariables } from './generateTextVariables';
import { generateCssFile, generateJsFile } from './utils';
import { generateVariables } from './generateVariables';
import { generateEffects } from './generateEffects';

export function generateFiles() {
  const themeObject = {};

  const {
    atomicCssVariables,
    semanticCssVariablesDark,
    semanticCssVariablesDefault,
  } = generateVariables(themeObject);

  const { textCssVariables } = generateTextVariables(themeObject);

  const { effectCssVariables } = generateEffects(themeObject);

  const cssFile = generateCssFile({
    baseCssVariables: [
      atomicCssVariables,
      semanticCssVariablesDefault,
      textCssVariables,
      effectCssVariables,
    ],
    darkCssVariables: semanticCssVariablesDark,
  });

  const jsFile = generateJsFile(themeObject);

  return {
    cssFile,
    jsFile,
  };
}
