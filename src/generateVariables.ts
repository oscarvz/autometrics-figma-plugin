import { isRgbValue, isRgbaValue, isVariableAlias } from "./typeGuards";
import {
  addToThemeObject,
  getColorValue,
  getCssVariableName,
  getSplitName,
} from "./utils";

const atomicCssVariables = new Set<string>();
const lightDarkVariables = new Map<string, { light?: string; dark?: string }>();

export function generateVariables(themeObject: object) {
  const variableCollections = figma.variables.getLocalVariableCollections();

  for (const { modes: collectionModes, variableIds } of variableCollections) {
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

  const semanticVariables = [...lightDarkVariables].reduce<Array<string>>(
    (accumulator, [name, { light, dark }]) =>
      light && dark
        ? accumulator.concat(`${name}: light-dark(${light}, ${dark});`)
        : accumulator,
    [],
  );

  return [...atomicCssVariables, ...semanticVariables];
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

  const cssVariableName = getCssVariableName(variableName);
  const aliasedVariableValue = getCssVariableName(figmaAliasedVariable.name);
  const lightDarkValue = `var(${aliasedVariableValue})`;

  const isDarkMode = collectionModeName.toLowerCase().includes("dark");
  const storedValue = lightDarkVariables.get(cssVariableName);

  lightDarkVariables.set(cssVariableName, {
    ...storedValue,
    [isDarkMode ? "dark" : "light"]: lightDarkValue,
  });
}

function generateAtomicVariable(
  resolvedType: VariableResolvedDataType,
  cssVariableName: string,
  figmaVariableModeValue: Exclude<VariableValue, VariableAlias>,
) {
  switch (resolvedType) {
    case "BOOLEAN" || "STRING": {
      const cssVariable = `${cssVariableName}: ${figmaVariableModeValue};`;
      atomicCssVariables.add(cssVariable);
      break;
    }
    case "COLOR": {
      const isValidRgba = isRgbaValue(figmaVariableModeValue);
      const isValidRgb = isRgbValue(figmaVariableModeValue);

      if (isValidRgba || isValidRgb) {
        const colorValue = getColorValue(figmaVariableModeValue);
        const cssVariable = `${cssVariableName}: ${colorValue};`;
        atomicCssVariables.add(cssVariable);
      }
      break;
    }
    case "FLOAT": {
      const cssVariable = `${cssVariableName}: ${figmaVariableModeValue}px;`;
      atomicCssVariables.add(cssVariable);
    }
  }
}
