import { generateEffects } from "./generateEffects";
import { generateTextVariables } from "./generateTextVariables";
import { generateVariables } from "./generateVariables";
import { generateCssFile, generateJsFile } from "./utils";

export function generateFiles() {
  const themeObject = {};

  const colorVariables = generateVariables(themeObject);
  const textCssVariables = generateTextVariables(themeObject);
  const effectCssVariables = generateEffects(themeObject);

  const cssFile = generateCssFile([
    ...colorVariables,
    ...textCssVariables,
    ...effectCssVariables,
  ]);

  const jsFile = generateJsFile(themeObject);

  return {
    cssFile,
    jsFile,
  };
}
