console.clear();
console.log("henlo again.");

figma.showUI(__html__);

const variableCollections = figma.variables.getLocalVariableCollections();

const atomicCssVariables: Array<string> = [];
const semanticCssVariablesLight: Array<string> = [];
const semanticCssVariablesDark: Array<string> = [];

function handleCollections() {
  let primitiveVariableReferences: Array<{
    id: Variable["id"];
    value: string;
  }> = [];

  for (const collection of variableCollections) {
    const { modes, name, variableIds } = collection;

    // TODO: handle other collections ("Tokens", "_Prototype - functions")
    // ATOMIC VARIABLES, has only one mode
    if (name === "Primitives" /* ATOMIC VARIABLES */) {
      for (const variableId of variableIds) {
        const variable = figma.variables.getVariableById(variableId);
        if (!variable) {
          continue;
        }

        const { name, id, valuesByMode } = variable;
        const variableName = getVariableName(name);

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

          const semanticVariableName = `${variableName}: var(${matchedToken.value})`;

          if (mode.name === "Light") {
            semanticCssVariablesLight.push(semanticVariableName);
          }

          if (mode.name === "Dark") {
            semanticCssVariablesDark.push(semanticVariableName);
          }
        }
      }
    }
  }
}

handleCollections();

function rgbToHex(value: RGBA) {
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

function isRgbaValue(value: VariableValue): value is RGBA {
  const values = Object.keys(value);

  return (
    values.includes("r") &&
    values.includes("g") &&
    values.includes("b") &&
    values.includes("a")
  );
}

function isRgbValue(value: VariableValue): value is RGB {
  const values = Object.keys(value);

  return (
    values.includes("r") &&
    values.includes("g") &&
    values.includes("b") &&
    !values.includes("a")
  );
}

function isVariableAlias(value: VariableValue): value is VariableAlias {
  const isObject = typeof value === "object";
  const isColorValue = isRgbaValue(value) || isRgbValue(value);

  return isObject && !isColorValue && value.type === "VARIABLE_ALIAS";
}

function getVariableName(name: Variable["name"]) {
  return `--${name.split("/").join("-").toLowerCase()}`;
}
