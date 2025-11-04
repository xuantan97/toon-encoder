import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use the static adapter so `npm run build` produces a static `build/` directory
		// which can be deployed to GitHub Pages. If you deploy to a project page
		// (https://username.github.io/repo) you may need to set `paths.base`.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		}),
		paths: { base: '' }
	}
};

export default config;
