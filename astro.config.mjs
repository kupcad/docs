// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// KupCAD's TextMate grammar, copied from the kupcad repo, where `zig build grammar` generates it
// (packages/kupcad-vscode/syntaxes/kupcad.tmLanguage.json): ```kupcad blocks highlight as the
// editor does. Copy it again when the language gains words.
const kupcadGrammar = JSON.parse(
	readFileSync(new URL('./src/grammars/kupcad.tmLanguage.json', import.meta.url), 'utf8'),
);

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'KupCAD',
			description: 'Reference for KupCAD, a Ruby-inspired language for parametric CAD.',
			logo: { src: './src/assets/logo.svg' },
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/kupcad/docs' }],
			customCss: ['./src/styles/theme.css'],
			expressiveCode: {
				shiki: { langs: [{ ...kupcadGrammar, name: 'kupcad', aliases: ['kup'] }] },
			},
			sidebar: [
				{ label: 'Overview', slug: 'reference' },
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
