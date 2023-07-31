import { handleCollections } from './plugin';
import { generateCssFile, generateJsFile } from './utils';

console.clear();

const {
  atomicCssVariables,
  semanticCssVariablesDark,
  semanticCssVariablesDefault,
  themeObject,
} = handleCollections();

const cssFile = generateCssFile({
  atomicCssVariables,
  semanticCssVariablesDark,
  semanticCssVariablesDefault,
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
