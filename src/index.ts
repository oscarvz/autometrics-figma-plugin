import { generateCssFile, generateJsFile, handleCollections } from './utils';

console.clear();

const {
  atomicCssVariables,
  semanticCssVariablesDark,
  semanticCssVariablesLight,
  themeObject,
} = handleCollections();

const cssFile = generateCssFile({
  atomicCssVariables,
  semanticCssVariablesDark,
  semanticCssVariablesLight,
});

const jsFile = generateJsFile(themeObject);

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
