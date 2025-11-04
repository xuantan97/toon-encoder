# toon-encoder

JSON ↔ TOON format converter web UI and library wrapper.

This repository contains a SvelteKit-based UI to encode and decode between JSON and the TOON format, plus small utilities (autosave, stats, token estimation) and a GitHub Actions workflow to build and deploy the site to GitHub Pages.

## Features

- JSON ↔ TOON conversion via `@toon-format/toon` (imports exposed at `$lib`)
  
	**Library credit:** this project uses the TOON encoder/decoder from the
	[`toon-format/toon`](https://github.com/toon-format/toon) project — thanks to the
	maintainers for the implementation.
- Autosave to localStorage
- Word / char / line / token estimate stats and compression comparison
- Compact / Expand JSON, copy to clipboard
- Per-panel font size controls and dark/light theme
- GitHub Actions workflow to build and deploy to GitHub Pages

## Local development

Requirements

- Node.js 18+ (tested with Node 18)
- npm or yarn

Install dependencies

```bash
npm ci
```

Start dev server

```bash
npm run dev
```

Open http://localhost:5173/ to view the UI.

## Build for production

```bash
npm run build
```

This project uses `@sveltejs/adapter-static` so the build output will be placed in `./build`.

## Deploy to GitHub Pages (automatic)

A GitHub Actions workflow is included at `.github/workflows/deploy.yml`. It builds the site on every push to `main` and deploys the static output to GitHub Pages using the supported `upload-pages-artifact` + `deploy-pages` actions.

If you prefer the `gh-pages` branch approach instead, you can change the workflow to use a deployment action that pushes the `build/` directory to `gh-pages`.

### Important: project pages vs user/organization pages

If you want to host the site as a project page (https://<user>.github.io/<repo>), set `paths.base` in `svelte.config.js` so asset URLs are correct. Example:

```js
// svelte.config.js
kit: {
	paths: { base: '/toon-encoder' },
	adapter: adapter({ pages: 'build', assets: 'build' })
}
```

Deploying to a user/organization page (https://<user>.github.io) typically does not require changing `paths.base`.

## Notes

- Token count shown in the UI is an estimate (chars / 4). For exact token counts (OpenAI/tiktoken style) install and use a tokenizer library.
- Persistence uses `localStorage` (per-browser). If you need cross-device persistence, consider adding an export/import feature or server-side storage.

## SEO and sharing

- The app provides default metadata (title, description, Open Graph and Twitter card) in `src/app.html`. Pages can still override these by setting head metadata in Svelte pages.
- To improve discoverability, add a high-quality Open Graph image at `/og-image.png` (1200x630 recommended) and verify the site with the major search engines.
- For project pages (https://<user>.github.io/<repo>), set `paths.base` in `svelte.config.js` so asset URLs are correct.

If you'd like, I can add a ready-to-use `/og-image.png` and a small social preview component.

## License

MIT
