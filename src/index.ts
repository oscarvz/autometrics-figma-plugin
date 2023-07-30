import { generateCssFile, handleCollections } from './utils';

console.clear();

const variableCollections = figma.variables.getLocalVariableCollections();

const {
  atomicCssVariables,
  semanticCssVariablesDark,
  semanticCssVariablesLight,
  themeObject,
} = handleCollections(variableCollections);

const cssFile = generateCssFile({
  atomicCssVariables,
  semanticCssVariablesDark,
  semanticCssVariablesLight,
});

const jsFile = 'const theme = ' + JSON.stringify(themeObject, null, 2);

figma.showUI(__html__);

figma.ui.postMessage({
  css: {
    id: 'css-file',
    payload: cssFile,
  },
  js: {
    id: 'js-file',
    payload: jsFile,
  },
});
