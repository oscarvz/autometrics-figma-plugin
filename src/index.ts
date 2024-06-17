import { generateFiles } from "./plugin";

const { cssFile, jsFile } = generateFiles();

figma.showUI(__html__, { themeColors: true });

figma.ui.postMessage([
  {
    css: cssFile,
  },
  {
    javascript: jsFile,
  },
]);
