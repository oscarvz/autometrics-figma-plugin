import { isRgbaValue, isVariableAlias } from './typeGuards';
import {
  addToThemeObject,
  getColorValue,
  getCssVariableName,
  sortArray,
} from './utils';

export function handleCollections() {
  const variableCollections = figma.variables.getLocalVariableCollections();

  const atomicCssVariables: Array<string> = [];
  const semanticCssVariablesLight: Array<string> = [];
  const semanticCssVariablesDark: Array<string> = [];

  const atomicVariableReferences = new Map<Variable['id'], string>();

  const themeObject = {};

  // TODO: Refactor (I heard you liked for loops, so I put for loops inside
  // a for loop)
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

        const paths = name.split(/[\/-]/);
        addToThemeObject(paths, cssVariableName, themeObject);

        for (const modeValue of Object.values(valuesByMode)) {
          const isAlias = isVariableAlias(modeValue);

          if (isAlias) {
            // TODO: Add fallback conditional with
            // figma.variables.getVariableById
            const matchedToken = atomicVariableReferences.get(modeValue.id);
            if (!matchedToken) {
              continue;
            }

            const semanticVariable = `${cssVariableName}: var(${matchedToken})`;

            if (collectionMode.name === 'Light') {
              semanticCssVariablesLight.push(semanticVariable);
            }

            if (collectionMode.name === 'Dark') {
              semanticCssVariablesDark.push(semanticVariable);
            }

            continue;
          }

          switch (variable.resolvedType) {
            case 'BOOLEAN' || 'STRING':
              atomicCssVariables.push(`${cssVariableName}: ${modeValue};`);
              break;
            case 'COLOR':
              const isValidRgba = isRgbaValue(modeValue);
              if (isValidRgba) {
                const colorValue = getColorValue(modeValue);
                atomicCssVariables.push(`${cssVariableName}: ${colorValue};`);
              }
              break;
            case 'FLOAT':
              atomicCssVariables.push(`${cssVariableName}: ${modeValue}px;`);
          }

          atomicVariableReferences.set(id, cssVariableName);
        }
      }
    }
  }

  return {
    atomicCssVariables: sortArray(atomicCssVariables),
    semanticCssVariablesLight: sortArray(semanticCssVariablesLight),
    semanticCssVariablesDark: sortArray(semanticCssVariablesDark),
    themeObject,
  };
}
