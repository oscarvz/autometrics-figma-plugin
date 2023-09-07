# Figma plugin

Hack day project; subject to change and a good refactor.

Generates CSS variables for both light and dark themes from Figma tokens.
Also generates a JavaScript object with references to these variables which can
be used for a typed theming system for CSS-in-JS libraries like
`styled-components` or `emotion`.

⚠️ **IMPORTANT**

This plugin is built as single-output project - which also means it makes
certain assumptions on how your design system is structured, and how it should
be implemented.

> It assumes that _if_ you have light and dark themes, the light theme is
> the default theme. The dark theme variable collection should contain `'dark'`
> in its name and and will generated in the CSS file with a
> `body[data-theme='dark']` selector.

## Usage

```
yarn; yarn build
```

Open Figma & switch to dev mode. Then go to `Plugins > Development > Import plugin from manifest...`
and select the `manifest.json` file from your local repo.

The plugin is now available in the `Plugins` menu. It can be run from there, or
from the dev panel on the right.

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
