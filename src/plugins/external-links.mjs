// A Markdown link to another site opens in a new tab, and gives that page neither a handle on
// this one (`window.opener`) nor its address as the referrer.

import { defineHastPlugin } from 'satteri';

export default defineHastPlugin({
	name: 'external-links',
	element: {
		filter: ['a'],
		visit(node, ctx) {
			const href = node.properties.href;
			if (typeof href === 'string' && href.startsWith('http')) {
				ctx.setProperty(node, 'target', '_blank');
				ctx.setProperty(node, 'rel', 'noopener noreferrer');
			}
		},
	},
});
