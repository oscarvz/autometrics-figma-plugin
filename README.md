# Figma plugin

Hack day project; subject to change and a good refactor.

Generates CSS variables for both light and dark themes from Figma tokens.
Also generates a JavaScript object with references to these variables which can
be used for a typed theming system for CSS-in-JS libraries like
`styled-components` or `emotion`.

## Usage

```
yarn; yarn build
```

Open Figma & switch to dev mode. Then go to `Plugins > Development > Import plugin from manifest...` and select the `manifest.json` file from your local repo.

The plugin is now available in the `Plugins` menu. It can be run from there, or from the dev panel on the right.

---

### TODO

- [x] generate CSS variables
- [x] generate JS theme object
- [x] add UI to extract CSS
- [x] add UI to extract JS
- [ ] generate JS file that can be downloaded (needs research)
- [x] styling for the plugin
- [x] syntax highlighting
- [ ] refactorrr & type fixes
- [x] handle text styles
- [x] handle effect styles
- [ ] handle paint styles
- [ ] ...
- [ ] profit
