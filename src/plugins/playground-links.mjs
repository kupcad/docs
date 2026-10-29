// "Open in playground" under each KupCAD example: a ```kupcad block with a frame, as signatures
// and deliberately invalid code have none (frame="none"). The playground on kupcad.org reads the
// script from the address's fragment, `#code=` and the script's UTF-8 in base64url (the website
// repository's src/lib/share.js), so it never reaches a server.

import { definePlugin } from '@expressive-code/core';
import { h } from '@expressive-code/core/hast';

/** @param {{ playground: string }} options */
export default function playgroundLinks({ playground }) {
	return definePlugin({
		name: 'Open in playground',
		baseStyles: `
			.kc-playground-link {
				display: block;
				padding: 0.4rem 1rem;
				border-top: 1px solid var(--sl-color-hairline);
				text-align: end;
				font-size: var(--sl-text-xs);
				text-transform: uppercase;
				letter-spacing: 0.02em;
				color: var(--sl-color-text-accent);
				text-decoration: none;
			}
			.kc-playground-link:hover {
				text-decoration: underline;
			}
		`,
		hooks: {
			postprocessRenderedBlock({ codeBlock, renderData }) {
				if (codeBlock.language !== 'kupcad' || codeBlock.props.frame === 'none') return;
				const code = Buffer.from(codeBlock.code, 'utf8').toString('base64url');
				renderData.blockAst.children.push(
					h(
						'a',
						{
							class: 'kc-playground-link',
							href: `${playground}#code=${code}`,
							target: '_blank',
							rel: 'noopener noreferrer',
						},
						'Open in playground →',
					),
				);
			},
		},
	});
}
