import { generateTextVariables } from './textStyles';
import { generateCssFile, generateJsFile } from './utils';
import { generateTokenVariables } from './variableCollections';

export function generateFiles() {
  const themeObject = {};

  const {
    atomicCssVariables,
    semanticCssVariablesDark,
    semanticCssVariablesDefault,
  } = generateTokenVariables(themeObject);

  const { textCssVariables } = generateTextVariables(themeObject);

  const cssFile = generateCssFile({
    atomicCssVariables,
    semanticCssVariablesDark,
    semanticCssVariablesDefault,
    textCssVariables,
  });

  const jsFile = generateJsFile(themeObject);

  return {
    cssFile,
    jsFile,
  };
}
