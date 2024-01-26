import { isRgbValue, isRgbaValue, isVariableAlias } from './typeGuards';
import {
  addToThemeObject,
  getColorValue,
  getCssVariable,
  getCssVariableName,
  getSplitName,
} from './utils';

const PROTOTYPE_COLLECTION_NAME = '_Prototype';

const atomicCssVariables = new Set<string>();
const semanticCssVariablesLight = new Set<string>();
const semanticCssVariablesDark = new Set<string>();

// TODO: Refactor this function to comply with ESLint rule
// eslint-disable-next-line sonarjs/cognitive-complexity
export function generateVariables(themeObject: object) {
  const variableCollections = figma.variables.getLocalVariableCollections();

  for (const {
    modes: collectionModes,
    name: collectionName,
    variableIds,
  } of variableCollections) {
    if (collectionName.startsWith(PROTOTYPE_COLLECTION_NAME)) {
      continue;
    }

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
          generateAliasVariable(
            figmaVariableModeValue.id,
            figmaVariable.name,
            collectionMode.name,
          );
          continue;
        }

        generateAtomicVariable(
          figmaVariable.resolvedType,
          cssVariableName,
          figmaVariableModeValue,
        );
      }
    }
  }

  return {
    atomicCssVariables: Array.from(atomicCssVariables),
    semanticCssVariablesLight: Array.from(semanticCssVariablesLight),
    semanticCssVariablesDark: Array.from(semanticCssVariablesDark),
  };
}

function generateAliasVariable(
  variableId: string,
  variableName: string,
  collectionModeName: string,
) {
  const figmaAliasedVariable = figma.variables.getVariableById(variableId);
  if (!figmaAliasedVariable) {
    return;
  }

  const aliasedVariableValue = getCssVariableName(figmaAliasedVariable.name);
  const { aliasedVariable } = getCssVariable(
    variableName,
    aliasedVariableValue,
  );

  if (collectionModeName.toLowerCase().includes('dark')) {
    semanticCssVariablesDark.add(aliasedVariable);
    return;
  }

  semanticCssVariablesLight.add(aliasedVariable);
}

function generateAtomicVariable(
  resolvedType: string,
  cssVariableName: string,
  figmaVariableModeValue: Exclude<VariableValue, VariableAlias>,
) {
  switch (resolvedType) {
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
