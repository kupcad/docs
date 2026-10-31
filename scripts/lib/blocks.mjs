// The KupCAD examples in the docs: every framed ```kupcad block (one with frame="none" is a
// signature or deliberately invalid code, not an example), with where it is, its code, and the
// outputs its `puts` lines say they give (`puts x.volume   # 500`).

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const DOCS_DIR = new URL('../../src/content/docs/', import.meta.url).pathname;
const OPENING_FENCE = /^(\s*)(`{3,}|~{3,})(kupcad|kup)(\s.*)?$/;
/**
 * A `puts` line with a comment after it: the comment is what the line prints. A `#{` inside a
 * string isn't a comment.
 */
const EXPECTED = /^\s*puts\b.*?\s#(?!\{)\s*(.+?)\s*$/;

/**
 * @typedef {object} Example
 * @property {string} file
 * @property {number} line the opening fence's, from 1
 * @property {string} code
 * @property {string} id a hash of the code: the same code is the same example
 * @property {string[]} expected what its `puts` lines say they print, in order
 */

/** Every Markdown file under `dir`. @param {string} dir @returns {string[]} */
export function markdownFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return markdownFiles(path);
		return /\.mdx?$/.test(entry.name) ? [path] : [];
	});
}

/**
 * The examples in one Markdown file.
 * @param {string} file
 * @returns {Example[]}
 */
export function examplesIn(file) {
	const lines = readFileSync(file, 'utf8').split('\n');
	const found = [];
	for (let i = 0; i < lines.length; i++) {
		const open = OPENING_FENCE.exec(lines[i]);
		if (!open) continue;
		const [, indent, fence, , meta = ''] = open;
		const body = [];
		let j = i + 1;
		while (j < lines.length && lines[j].trim() !== fence) {
			body.push(lines[j].startsWith(indent) ? lines[j].slice(indent.length) : lines[j]);
			j++;
		}
		if (!/frame="none"/.test(meta)) {
			const code = body.join('\n') + '\n';
			found.push({ file, line: i + 1, code, id: idOf(code), expected: expectedOf(body) });
		}
		i = j;
	}
	return found;
}

/** Every example in the docs. @returns {Example[]} */
export function allExamples() {
	return markdownFiles(DOCS_DIR).flatMap(examplesIn);
}

/**
 * An example's id: a hash of its code, trailing blank lines aside, so the same code in the page
 * and in the rendered block is the same example.
 * @param {string} code
 */
export function idOf(code) {
	return createHash('sha1').update(`${code.trimEnd()}\n`).digest('hex').slice(0, 16);
}

/** @param {string[]} lines */
function expectedOf(lines) {
	return lines.flatMap((line) => {
		const match = EXPECTED.exec(line);
		return match ? [match[1]] : [];
	});
}

/**
 * Whether a line a script printed is what its comment said: the same, or the comment goes on to
 * explain it (`# 56.25: 7.5 × 7.5 halfway up`).
 * @param {string} printed
 * @param {string} expected
 */
export function printedAsSaid(printed, expected) {
	return (
		printed === expected ||
		expected.startsWith(`${printed}:`) ||
		expected.startsWith(`${printed} (`) ||
		expected.startsWith(`${printed} ...`)
	);
}
