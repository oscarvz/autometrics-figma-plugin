import { isRgbValue, isRgbaValue, isVariableAlias } from './typeGuards';
import {
  addToThemeObject,
  getColorValue,
  getCssVariable,
  getCssVariableName,
  getSplitName,
} from './utils';

export function generateVariables(themeObject: object) {
  const variableCollections = figma.variables.getLocalVariableCollections();

  const atomicCssVariables: Array<string> = [];
  const semanticCssVariablesDefault: Array<string> = [];
  const semanticCssVariablesDark: Array<string> = [];

  for (const variableCollection of variableCollections) {
    const { modes: collectionModes, variableIds } = variableCollection;

    for (const collectionMode of collectionModes) {
      for (const variableId of variableIds) {
        const figmaVariable = figma.variables.getVariableById(variableId);
        if (!figmaVariable) {
          continue;
        }

        const figmaVariableModeValue =
          figmaVariable.valuesByMode[collectionMode.modeId];
        const cssVariableName = getCssVariableName(figmaVariable.name);

        const paths = getSplitName(figmaVariable.name);
        addToThemeObject(paths, cssVariableName, themeObject);

        const isAlias = isVariableAlias(figmaVariableModeValue);
        if (isAlias) {
          const figmaAliasedVariable = figma.variables.getVariableById(
            figmaVariableModeValue.id,
          );
          if (!figmaAliasedVariable) {
            continue;
          }

          const aliasedVariableValue = getCssVariableName(
            figmaAliasedVariable.name,
          );

          const { aliasedVariable } = getCssVariable(
            figmaVariable.name,
            aliasedVariableValue,
          );

          if (collectionMode.name.toLowerCase().includes('dark')) {
            semanticCssVariablesDark.push(aliasedVariable);
            continue;
          }

          semanticCssVariablesDefault.push(aliasedVariable);
          continue;
        }

        switch (figmaVariable.resolvedType) {
          case 'BOOLEAN' || 'STRING': {
            const cssVariable = `${cssVariableName}: ${figmaVariableModeValue};`;
            atomicCssVariables.push(cssVariable);
            break;
          }
          case 'COLOR': {
            const isValidRgba = isRgbaValue(figmaVariableModeValue);
            const isValidRgb = isRgbValue(figmaVariableModeValue);

            if (isValidRgba || isValidRgb) {
              const colorValue = getColorValue(figmaVariableModeValue);
              const cssVariable = `${cssVariableName}: ${colorValue};`;
              atomicCssVariables.push(cssVariable);
            }
            break;
          }
          case 'FLOAT': {
            const cssVariable = `${cssVariableName}: ${figmaVariableModeValue}px;`;
            atomicCssVariables.push(cssVariable);
          }
        }
      }
    }
  }

  return {
    atomicCssVariables,
    semanticCssVariablesDefault,
    semanticCssVariablesDark,
  };
}
