import { generateFiles } from './plugin';

const { cssFile, jsFile } = generateFiles();

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
