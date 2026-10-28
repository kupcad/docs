// The pages link as if the site were served from its domain's root (`/reference/`), and
// Starlight leaves a Markdown link as written. GitHub Pages serves a repository without a
// custom domain under /<repo>/, so this Markdown plugin puts Astro's `base` in front of those
// links.

/**
 * @param {string} base
 * @returns {import('satteri').HastPluginDefinition}
 */
export default function baseLinks(base) {
	const prefix = base.replace(/\/+$/, '');
	return {
		name: 'base-links',
		element: {
			filter: ['a'],
			visit(node, ctx) {
				const href = node.properties?.href;
				if (prefix && typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
					ctx.setProperty(node, 'href', prefix + href);
				}
			},
		},
	};
}
