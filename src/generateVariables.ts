import { isVariableAlias, isRgbaValue, isRgbValue } from './typeGuards';
import {
  getCssVariableName,
  addToThemeObject,
  getColorValue,
  getSplitName,
  getCssVariable,
} from './utils';

export function generateVariables(themeObject: object) {
  const variableCollections = figma.variables.getLocalVariableCollections();

  const atomicCssVariables = new Set<string>();
  const semanticCssVariablesDefault = new Set<string>();
  const semanticCssVariablesDark = new Set<string>();
  const atomicVariableReferences = new Map<Variable['id'], string>();

  for (const variableCollection of variableCollections) {
    const { modes: collectionModes, variableIds } = variableCollection;

    for (const collectionMode of collectionModes) {
      for (const variableId of variableIds) {
        const variable = figma.variables.getVariableById(variableId);
        if (!variable) {
          continue;
        }

        const { name, id, valuesByMode } = variable;
        const cssVariableName = getCssVariableName(name);

        const paths = getSplitName(name);
        addToThemeObject(paths, cssVariableName, themeObject);

        const modeValue = valuesByMode[collectionMode.modeId];

        const isAlias = isVariableAlias(modeValue);
        if (isAlias) {
          const matchedToken = atomicVariableReferences.get(modeValue.id);
          if (!matchedToken) {
            continue;
          }

          const { aliasedVariable } = getCssVariable(name, matchedToken);

          if (collectionMode.name.toLowerCase().includes('dark')) {
            semanticCssVariablesDark.add(aliasedVariable);
            continue;
          }

          semanticCssVariablesDefault.add(aliasedVariable);
          continue;
        }

        switch (variable.resolvedType) {
          case 'BOOLEAN' || 'STRING': {
            const cssVariable = `${cssVariableName}: ${modeValue};`;
            atomicCssVariables.add(cssVariable);
            break;
          }
          case 'COLOR': {
            const isValidRgba = isRgbaValue(modeValue);
            const isValidRgb = isRgbValue(modeValue);

            if (isValidRgba || isValidRgb) {
              const colorValue = getColorValue(modeValue);
              const cssVariable = `${cssVariableName}: ${colorValue};`;
              atomicCssVariables.add(cssVariable);
            }
            break;
          }
          case 'FLOAT': {
            const cssVariable = `${cssVariableName}: ${modeValue}px;`;
            atomicCssVariables.add(cssVariable);
          }
        }

        atomicVariableReferences.set(id, cssVariableName);
      }
    }
  }

  return {
    atomicCssVariables: [...atomicCssVariables],
    semanticCssVariablesDefault: [...semanticCssVariablesDefault],
    semanticCssVariablesDark: [...semanticCssVariablesDark],
  };
}
