// Under each KupCAD example (a ```kupcad block with a frame, as signatures and deliberately
// invalid code have none, frame="none"): its picture, where scripts/render-examples.mjs drew one
// into public/examples/ (one for each theme; the page shows its own), "Edit here" for an
// example with a title (`# @title`: a whole script, which src/scripts/try-here.js opens in the
// playground on the page), and "Open in playground". A block marked ```kupcad aside shows its
// picture beside the code instead, where the page is wide enough (the landing page's). The
// playground on kupcad.org reads the script from the address's fragment, `#code=` and the
// script's UTF-8 in base64url (the website repository's src/lib/share.js), so it never reaches a
// server.

import { definePlugin } from '@expressive-code/core';
import { h } from '@expressive-code/core/hast';
import { existsSync } from 'node:fs';
import { idOf } from '../../scripts/lib/blocks.mjs';

const PICTURES = new URL('../../public/examples/', import.meta.url).pathname;
/** The viewer's backgrounds (@kupcad/ui/viewer's themes), behind a picture that doesn't fill its box. */
const BACKGROUND = { light: '#eef1f4', dark: '#131415' };

/** @param {{ playground: string }} options */
export default function playgroundLinks({ playground }) {
	return definePlugin({
		name: 'KupCAD examples',
		baseStyles: `
			.kc-example-picture {
				display: block;
				width: 100%;
				height: auto;
				max-height: 16rem;
				object-fit: contain;
				border-top: 1px solid var(--sl-color-hairline);
				background: ${BACKGROUND.light};
			}
			.kc-example-picture.kc-dark {
				display: none;
				background: ${BACKGROUND.dark};
			}
			:root[data-theme='dark'] .kc-example-picture.kc-light {
				display: none;
			}
			:root[data-theme='dark'] .kc-example-picture.kc-dark {
				display: block;
			}
			.kc-example-links {
				display: flex;
				justify-content: flex-end;
				gap: 1rem;
				padding: 0.4rem 1rem;
				border-top: 1px solid var(--sl-color-hairline);
				font-size: var(--sl-text-xs);
				text-transform: uppercase;
				letter-spacing: 0.02em;
			}
			.kc-example-links a,
			.kc-example-links button {
				color: var(--sl-color-text-accent);
				text-decoration: none;
				font: inherit;
				background: none;
				border: none;
				padding: 0;
				cursor: pointer;
			}
			.kc-example-links a:hover,
			.kc-example-links button:hover {
				text-decoration: underline;
			}
			.kc-example-links button:disabled {
				color: var(--sl-color-gray-3);
				cursor: default;
				text-decoration: none;
			}
			/* The picture beside the code: the code's column, the picture's, the links under both */
			@media (min-width: 50rem) {
				.kc-aside {
					display: grid;
					grid-template-columns: minmax(0, 1fr) 38%;
					align-items: stretch;
				}
				.kc-aside > pre {
					grid-area: 1 / 1;
				}
				.kc-aside > .kc-example-picture {
					grid-area: 1 / 2;
					height: 100%;
					max-height: none;
					border-top: none;
					border-left: 1px solid var(--sl-color-hairline);
				}
				.kc-aside > .kc-example-links {
					grid-column: 1 / -1;
				}
			}
		`,
		hooks: {
			postprocessRenderedBlock({ codeBlock, renderData }) {
				if (codeBlock.language !== 'kupcad' || codeBlock.props.frame === 'none') return;
				const code = codeBlock.code;
				const id = idOf(code);
				const encoded = Buffer.from(code, 'utf8').toString('base64url');
				const children = [];
				if (existsSync(`${PICTURES}${id}.png`)) {
					for (const [theme, suffix] of [
						['light', ''],
						['dark', '-dark'],
					]) {
						if (!existsSync(`${PICTURES}${id}${suffix}.png`)) continue;
						children.push(
							h('img', {
								class: `kc-example-picture kc-${theme}`,
								src: `/examples/${id}${suffix}.png`,
								alt: 'The model this example makes',
								loading: 'lazy',
								width: 1280,
								height: 800,
							}),
						);
					}
					if (/\baside\b/.test(codeBlock.meta)) {
						const frame = renderData.blockAst;
						frame.properties ??= {};
						frame.properties.className = [
							...(/** @type {string[]} */ (frame.properties.className ?? [])),
							'kc-aside',
						];
					}
				}
				const links = [];
				if (/^# @title /.test(code)) {
					links.push(
						h('button', { type: 'button', class: 'kc-try', 'data-code': code }, 'Edit here'),
					);
				}
				links.push(
					h(
						'a',
						{
							href: `${playground}#code=${encoded}`,
							target: '_blank',
							rel: 'noopener noreferrer',
						},
						'Open in playground →',
					),
				);
				children.push(h('div', { class: 'kc-example-links' }, links));
				renderData.blockAst.children.push(...children);
			},
		},
	});
}
