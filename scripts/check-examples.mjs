// Runs every framed ```kupcad block of the docs through `kupcad check`, so an example the
// language no longer accepts fails here, not in a reader's editor. Blocks with frame="none"
// (signatures, deliberately invalid code) are skipped. The binary is $KUPCAD, else `kupcad` on
// the PATH: KUPCAD=../kupcad/core/zig-out/bin/kupcad pnpm check:examples

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const DOCS_DIR = new URL('../src/content/docs/', import.meta.url).pathname;
// A path, resolved here: the checks run in a scratch directory
const KUPCAD = process.env.KUPCAD ? resolve(process.env.KUPCAD) : 'kupcad';
const OPENING_FENCE = /^(\s*)(`{3,}|~{3,})(kupcad|kup)(\s.*)?$/;

function markdownFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return markdownFiles(path);
		return /\.mdx?$/.test(entry.name) ? [path] : [];
	});
}

/** The kupcad blocks of a Markdown file that are examples: their first line and their code. */
function examples(text) {
	const lines = text.split('\n');
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
		if (!/frame="none"/.test(meta)) found.push({ line: i + 1, code: body.join('\n') + '\n' });
		i = j;
	}
	return found;
}

const scratch = mkdtempSync(join(tmpdir(), 'kupcad-docs-'));
let checked = 0;
let failed = 0;
try {
	for (const file of markdownFiles(DOCS_DIR)) {
		for (const { line, code } of examples(readFileSync(file, 'utf8'))) {
			const script = join(scratch, `example_${checked}.kup`);
			writeFileSync(script, code);
			checked++;
			try {
				execFileSync(KUPCAD, ['check', script], { cwd: scratch, stdio: 'pipe' });
			} catch (error) {
				failed++;
				const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.replaceAll(script, 'example');
				console.error(`${relative(process.cwd(), file)}:${line}\n${output || error.message}`);
			}
		}
	}
} finally {
	rmSync(scratch, { recursive: true, force: true });
}

console.log(`${checked} examples checked, ${failed} failed`);
process.exit(failed ? 1 : 0);
