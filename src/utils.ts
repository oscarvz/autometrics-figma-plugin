import { isRgbaValue, isVariableAlias } from "./typeGuards";

export function handleCollections(
  variableCollections: Array<VariableCollection>
) {
  const atomicCssVariables: Array<string> = [];
  const semanticCssVariablesLight: Array<string> = [];
  const semanticCssVariablesDark: Array<string> = [];

  const primitiveVariableReferences: Array<{
    id: Variable["id"];
    value: string;
  }> = [];

  const themeObject = {};

  for (const collection of variableCollections) {
    const { modes, name, variableIds } = collection;

    // ATOMIC VARIABLES, has only one mode
    if (name === "Primitives") {
      for (const variableId of variableIds) {
        const variable = figma.variables.getVariableById(variableId);
        if (!variable) {
          continue;
        }

        const { name, id, valuesByMode } = variable;
        const variableName = getVariableName(name);

        const paths = name.split("/");
        addToThemeObject(paths, variableName, themeObject);

        const [value] = Object.values(valuesByMode);
        const isValidRgba = isRgbaValue(value);

        if (isValidRgba) {
          const hex = rgbToHex(value);
          atomicCssVariables.push(`${variableName}: ${hex};`);
        }

        primitiveVariableReferences.push({
          id,
          value: variableName,
        });
      }
    }

    if (name === "Tokens") {
      for (const mode of modes) {
        for (const variableId of variableIds) {
          const variable = figma.variables.getVariableById(variableId);
          if (!variable) {
            continue;
          }

          const isColorValue = variable.resolvedType === "COLOR";
          if (!isColorValue) {
            continue;
          }

          const { name, valuesByMode } = variable;
          const variableName = getVariableName(name);
          const variableValue = valuesByMode[mode.modeId];

          const paths = name.split("/");
          addToThemeObject(paths, variableName, themeObject);

          const isAlias = isVariableAlias(variableValue);
          if (!isAlias) {
            continue;
          }

          const matchedToken = primitiveVariableReferences.find((reference) => {
            return reference.id === variableValue.id;
          });
          if (!matchedToken) {
            continue;
          }

          const semanticVariabl = `${variableName}: var(${matchedToken.value})`;

          if (mode.name === "Light") {
            semanticCssVariablesLight.push(semanticVariabl);
          }

          if (mode.name === "Dark") {
            semanticCssVariablesDark.push(semanticVariabl);
          }
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

export function rgbToHex(value: RGBA) {
  const { r, g, b, a } = value;
  if (a !== 1) {
    return `rgba(${[r, g, b]
      .map((n) => Math.round(n * 255))
      .join(", ")}, ${a.toFixed(4)})`;
  }

  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}`;
}

export function getVariableName(name: Variable["name"]) {
  return `--${name.split("/").join("-").toLowerCase()}`;
}

export function addToThemeObject(
  paths: string[],
  value: string,
  existingObject: any = {}
): any {
  if (paths.length === 0) {
    return value;
  }

  const key = paths[0];
  const remainingPaths = paths.slice(1);

  // If the key already exists in the existingObject, merge the new nested
  // object with it.
  if (existingObject.hasOwnProperty(key)) {
    existingObject[key] = addToThemeObject(
      remainingPaths,
      value,
      existingObject[key]
    );
  } else {
    existingObject[key] = addToThemeObject(remainingPaths, value);
  }

  return existingObject;
}

function sortArray(array: Array<string>) {
  return array.sort((a, b) => (a > b ? 1 : -1));
}

export function generateCssFile({
  atomicCssVariables,
  semanticCssVariablesLight,
  semanticCssVariablesDark,
}: Omit<ReturnType<typeof handleCollections>, "themeObject">) {
  // TODO (Oscar): use for JS file too
  const closeFile = "}\n";
  let cssFile = ":root {\n";

  // Add variables to file, for both atomic and semantic light variables
  for (const variable of atomicCssVariables) {
    cssFile += `  ${variable}\n`;
  }

  for (const variable of semanticCssVariablesLight) {
    cssFile += `  ${variable}\n`;
  }

  // Indent & add dark theme selector & variables
  const darkThemeSelector = "\n  body[data-theme='dark'] {\n";
  cssFile += darkThemeSelector;

  for (const variable of semanticCssVariablesDark) {
    cssFile += `    ${variable}\n`;
  }

  cssFile += `  ${closeFile}`;

  // Close file
  cssFile += closeFile;

  return cssFile;
}

export function generateJsFile(
  themeObject: Pick<
    ReturnType<typeof handleCollections>,
    "themeObject"
  >["themeObject"]
) {
  const closeFile = "};\n";
  let jsFile = "export const theme = {\n";

  for (const [key, value] of Object.entries(themeObject)) {
    jsFile += `  ${key}: ${value},\n`;
  }

  jsFile += closeFile;

  return jsFile;
}