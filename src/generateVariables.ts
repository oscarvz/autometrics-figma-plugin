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

  const atomicCssVariables = new Set<string>();
  const semanticCssVariablesDefault = new Set<string>();
  const semanticCssVariablesDark = new Set<string>();

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
            semanticCssVariablesDark.add(aliasedVariable);
            continue;
          }

          semanticCssVariablesDefault.add(aliasedVariable);
          continue;
        }

        switch (figmaVariable.resolvedType) {
          case 'BOOLEAN' || 'STRING': {
            const cssVariable = `${cssVariableName}: ${figmaVariableModeValue};`;
            atomicCssVariables.add(cssVariable);
            break;
          }
          case 'COLOR': {
            const isValidRgba = isRgbaValue(figmaVariableModeValue);
            const isValidRgb = isRgbValue(figmaVariableModeValue);

            if (isValidRgba || isValidRgb) {
              const colorValue = getColorValue(figmaVariableModeValue);
              const cssVariable = `${cssVariableName}: ${colorValue};`;
              atomicCssVariables.add(cssVariable);
            }
            break;
          }
          case 'FLOAT': {
            const cssVariable = `${cssVariableName}: ${figmaVariableModeValue}px;`;
            atomicCssVariables.add(cssVariable);
          }
        }
      }
    }
  }

  return {
    atomicCssVariables: [...atomicCssVariables],
    semanticCssVariablesDefault: [...semanticCssVariablesDefault],
    semanticCssVariablesDark: [...semanticCssVariablesDark],
  };
}
