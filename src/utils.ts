import { isRgbaValue, isVariableAlias } from './typeGuards';

export function handleCollections() {
  const variableCollections = figma.variables.getLocalVariableCollections();

  const atomicCssVariables: Array<string> = [];
  const semanticCssVariablesLight: Array<string> = [];
  const semanticCssVariablesDark: Array<string> = [];

  const atomicVariableReferences = new Map<string, string>();

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

function getColorValue(value: RGBA) {
  const { r, g, b, a } = value;
  if (a !== 1) {
    return `rgb(${[r, g, b].map((n) => Math.round(n * 255)).join(' ')} / ${(
      a * 100
    ).toFixed(0)}%)`;
  }

  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join('');
  return `#${hex}`;
}

function getCssVariableName(name: Variable['name']) {
  return `--${name.split(/[\/-]/).join('-').toLowerCase()}`;
}

function addToThemeObject(
  paths: Array<string>,
  value: string,
  currentObject: any = {} /* TODO: fix any */,
): {} | string {
  if (paths.length === 0) {
    return `var(${value})`;
  }

  const [currentKey, nextKey, ...remainingKeys] = paths;
  const remainingPaths = paths.slice(1);

  // If the key already exists in the currentObject, merge the new nested object
  // with it.
  if (currentObject.hasOwnProperty(currentKey)) {
    if (typeof currentObject[currentKey] === 'object') {
      currentObject[currentKey] = addToThemeObject(
        remainingPaths,
        value,
        currentObject[currentKey],
      );

      return currentObject;
    }

    // HACK: If the key already exists in the currentObject but the value is a
    // string, this means we have a duplicate key which we're solving by merging
    // the current one with the next one (for instance: if we can already have
    // bg: "#FFF" but another key is bg-subtle, we can't add `subtle` as a
    // nested key so we have to create a new one called "bg-subtle").
    // TODO: Update documentation & add convention guidelines.
    if (typeof currentObject[currentKey] === 'string' && nextKey) {
      currentObject = Object.assign(currentObject, {
        [`${currentKey}-${nextKey}`]: addToThemeObject(
          remainingKeys,
          value,
          currentObject[`${currentKey}-${nextKey}`],
        ),
      });

      return currentObject;
    }
  }

  currentObject[currentKey] = addToThemeObject(remainingPaths, value);
  return currentObject;
}

export function generateCssFile({
  atomicCssVariables,
  semanticCssVariablesLight,
  semanticCssVariablesDark,
}: Omit<ReturnType<typeof handleCollections>, 'themeObject'>) {
  const close = '}\n';
  let cssFile = ':root {\n';

  // Add variables to file, for both atomic and semantic light variables
  for (const variable of [
    ...atomicCssVariables,
    ...semanticCssVariablesLight,
  ]) {
    cssFile += `  ${variable}\n`;
  }

  if (semanticCssVariablesDark.length > 0) {
    // Indent & add dark theme selector & variables
    const darkThemeMediaSelector =
      '\n  @media (prefers-color-scheme: dark) {\n';
    cssFile += darkThemeMediaSelector;

    for (const variable of semanticCssVariablesDark) {
      cssFile += `    ${variable}\n`;
    }

    cssFile += `  ${close}`;
  }

  cssFile += close;

  return cssFile;
}

export function generateJsFile(
  themeObject: ReturnType<typeof handleCollections>['themeObject'],
) {
  const jsContent = 'const theme = ' + JSON.stringify(themeObject, null, 2);
  return removeQuotesFromObjectKeys(jsContent);
}

function removeQuotesFromObjectKeys(jsonString: string) {
  return jsonString.replace(/"([^(")"]+)":/g, '$1:');
}

function sortArray(array: Array<string>) {
  return array.sort((a, b) => (a > b ? 1 : -1));
}
