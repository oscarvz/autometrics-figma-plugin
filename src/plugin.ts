import { generateEffects } from "./generateEffects";
import { generateTextVariables } from "./generateTextVariables";
import { generateVariables } from "./generateVariables";
import { generateCssFile, generateJsFile } from "./utils";

export function generateFiles() {
  const themeObject = {};

  const {
    atomicCssVariables,
    semanticCssVariablesDark,
    semanticCssVariablesLight,
  } = generateVariables(themeObject);

  const { textCssVariables } = generateTextVariables(themeObject);

  const { effectCssVariables } = generateEffects(themeObject);

  const cssFile = generateCssFile({
    baseCssVariables: [
      atomicCssVariables,
      textCssVariables,
      effectCssVariables,
    ],
    lightCssVariables: semanticCssVariablesLight,
    darkCssVariables: semanticCssVariablesDark,
  });

  const jsFile = generateJsFile(themeObject);

  return {
    cssFile,
    jsFile,
  };
}
