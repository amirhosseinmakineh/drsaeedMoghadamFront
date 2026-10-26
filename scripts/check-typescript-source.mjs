import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(process.argv[2] || process.cwd());
const failures = [];
let checked = 0;
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) { await inspect(file); continue; }
    const path = relative(root, file);
    if (/\.js(?:\.map)?$/.test(entry.name)) {
      failures.push(`${path}: generated JavaScript is not an Angular source file; remove it and run npm run typecheck.`);
    }
    if (!entry.name.endsWith('.ts')) continue;
    checked++;
    let source;
    try { source = new TextDecoder('utf-8', { fatal: true }).decode(await readFile(file)); }
    catch { failures.push(`${path}: invalid UTF-8 source`); continue; }
    if (/\uFFFD|[\x00-\x08\x0b\x0c\x0e-\x1f]/u.test(source)) failures.push(`${path}: corrupted source characters`);
    const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    for (const diagnostic of parsed.parseDiagnostics) {
      const position = parsed.getLineAndCharacterOfPosition(diagnostic.start || 0);
      failures.push(`${path}:${position.line + 1}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
    }
  }
}
await inspect(join(root, 'src'));
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${checked} TypeScript files; no generated JavaScript or corrupted source under src.`);
