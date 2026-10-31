// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import starlight from '@astrojs/starlight';
import { PLAYGROUND } from './src/links.mjs';
import externalLinks from './src/plugins/external-links.mjs';
import playgroundLinks from './src/plugins/playground-links.mjs';

// KupCAD's TextMate grammar, copied from the kupcad repo, where `zig build grammar` generates it
// (packages/kupcad-vscode/syntaxes/kupcad.tmLanguage.json): ```kupcad blocks highlight as the
// editor does. Copy it again when the language gains words.
const kupcadGrammar = JSON.parse(
	readFileSync(new URL('./src/grammars/kupcad.tmLanguage.json', import.meta.url), 'utf8'),
);

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.kupcad.org',
	// Starlight adds its own plugins (asides, heading anchors) to this processor
	markdown: { processor: satteri({ hastPlugins: [externalLinks] }) },
	integrations: [
		starlight({
			title: 'KupCAD',
			description: 'Reference for KupCAD, a Ruby-inspired language for parametric CAD.',
			// KupCAD's icon, themed by the --kc-icon-* variables in theme.css; the favicon, an
			// image, has the icon's own colours
			favicon: '/icon.svg',
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				// The header's GitHub link opens in a new tab, as Markdown's external links do
				SocialIcons: './src/components/SocialIcons.astro',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/kupcad/docs' }],
			customCss: ['./src/styles/theme.css'],
			expressiveCode: {
				shiki: { langs: [{ ...kupcadGrammar, name: 'kupcad', aliases: ['kup'] }] },
				// Each example opens in the website's playground
				plugins: [playgroundLinks({ playground: PLAYGROUND })],
			},
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
				{
					label: 'Guides',
					items: [
						{ label: 'The language', items: [{ autogenerate: { directory: 'guides/language' } }] },
						{ label: 'Making parts', items: [{ autogenerate: { directory: 'guides/parts' } }] },
					],
				},
				{ label: 'Reference', slug: 'reference' },
				{ label: 'Language', items: [{ autogenerate: { directory: 'reference/language' } }] },
				{ label: 'Geometry', items: [{ autogenerate: { directory: 'reference/geometry' } }] },
				{ label: 'Standard library', items: [{ autogenerate: { directory: 'reference/stdlib' } }] },
				{
					label: 'Parameters and imports',
					items: [{ autogenerate: { directory: 'reference/inputs' } }],
				},
				{ label: 'Tooling', items: [{ autogenerate: { directory: 'reference/tooling' } }] },
			],
		}),
	],
});
