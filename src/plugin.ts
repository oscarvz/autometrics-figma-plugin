import { isRgbValue, isRgbaValue, isVariableAlias } from './typeGuards';
import { SPLIT_BY } from './constants';
import {
  addToThemeObject,
  generateCssFile,
  generateJsFile,
  getColorValue,
  getCssVariableName,
  getSortedArrayFromSet,
} from './utils';

export function generateFiles() {
  const variableCollections = figma.variables.getLocalVariableCollections();

  const atomicCssVariables = new Set<string>();
  const semanticCssVariablesDefault = new Set<string>();
  const semanticCssVariablesDark = new Set<string>();
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

        const paths = name.split(SPLIT_BY);
        addToThemeObject(paths, cssVariableName, themeObject);

        const modeValue = valuesByMode[collectionMode.modeId];

        const isAlias = isVariableAlias(modeValue);
        if (isAlias) {
          // TODO: Add fallback conditional with
          // figma.variables.getVariableById
          const matchedToken = atomicVariableReferences.get(modeValue.id);
          if (!matchedToken) {
            continue;
          }

          const semanticVariable = `${cssVariableName}: var(${matchedToken})`;

          if (collectionMode.name.toLowerCase() === 'dark') {
            semanticCssVariablesDark.add(semanticVariable);
            continue;
          }

          semanticCssVariablesDefault.add(semanticVariable);
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

  const cssFile = generateCssFile({
    atomicCssVariables: getSortedArrayFromSet(atomicCssVariables),
    semanticCssVariablesDefault: getSortedArrayFromSet(
      semanticCssVariablesDefault,
    ),
    semanticCssVariablesDark: getSortedArrayFromSet(semanticCssVariablesDark),
  });

  const jsFile = generateJsFile(themeObject);

  return {
    cssFile,
    jsFile,
  };
}
