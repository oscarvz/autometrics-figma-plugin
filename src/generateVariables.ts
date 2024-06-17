import { isRgbValue, isRgbaValue, isVariableAlias } from "./typeGuards";
import {
  addToThemeObject,
  getColorValue,
  getCssVariableName,
  getSplitName,
} from "./utils";

const PROTOTYPE_COLLECTION_NAME = "_Prototype";

const atomicCssVariables = new Set<string>();
const lightDarkVariables = new Map<string, { light?: string; dark?: string }>();

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

  const semanticLightDarkVariables = [...lightDarkVariables].reduce<
    Array<string>
  >((accumulator, [name, { light, dark }]) => {
    if (light && dark) {
      accumulator.push(`${name}: light-dark(${light}, ${dark});`);
    }

    return accumulator;
  }, []);

  return [...atomicCssVariables, ...semanticLightDarkVariables];
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
  const lightDarkValue = (value: string) => `var(${value})`;

  const storedValue = lightDarkVariables.get(cssVariableName);

  if (collectionModeName.toLowerCase().includes("dark")) {
    if (storedValue) {
      lightDarkVariables.set(cssVariableName, {
        ...storedValue,
        dark: lightDarkValue(aliasedVariableValue),
      });
    } else {
      lightDarkVariables.set(cssVariableName, {
        dark: lightDarkValue(aliasedVariableValue),
      });
    }

    return;
  }

  if (storedValue) {
    lightDarkVariables.set(cssVariableName, {
      ...storedValue,
      light: lightDarkValue(aliasedVariableValue),
    });
  } else {
    lightDarkVariables.set(cssVariableName, {
      light: lightDarkValue(aliasedVariableValue),
    });
  }
}

function generateAtomicVariable(
  resolvedType: string,
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
