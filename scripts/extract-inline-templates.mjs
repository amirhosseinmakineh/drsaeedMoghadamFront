import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "src", "app");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".component.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

function dedent(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  while (lines.length && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  if (!lines.length) {
    return "";
  }

  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)[0].length);
  const minIndent = Math.min(...indents);
  return lines.map((line) => (line.length ? line.slice(minIndent) : "")).join("\n") + "\n";
}

function extractTemplate(source) {
  const marker = "template:";
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  if (source.includes("templateUrl:")) {
    return null;
  }

  const afterMarker = source.slice(markerIndex + marker.length);
  const backtickIndex = afterMarker.indexOf("`");
  if (backtickIndex === -1) {
    throw new Error("template marker without opening backtick");
  }

  const contentStart = markerIndex + marker.length + backtickIndex + 1;
  let index = contentStart;
  while (index < source.length) {
    const char = source[index];
    if (char === "`") {
      const rest = source.slice(index + 1).match(/^\s*,?/);
      return {
        start: markerIndex,
        end: index + 1 + (rest?.[0]?.length ?? 0),
        content: source.slice(contentStart, index),
      };
    }
    index += 1;
  }

  throw new Error("unterminated template literal");
}

function extractStyles(source) {
  return null;
}

const componentFiles = walk(root);
const updated = [];

for (const filePath of componentFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const extracted = extractTemplate(source);
  if (!extracted) {
    continue;
  }

  const baseName = path.basename(filePath, ".component.ts");
  const htmlPath = path.join(path.dirname(filePath), `${baseName}.component.html`);
  const html = dedent(extracted.content);
  fs.writeFileSync(htmlPath, html, "utf8");

  const replacement = `templateUrl: "./${baseName}.component.html"${
    /^\s*styles\s*:/m.test(source.slice(extracted.end)) ? "," : ""
  }`;
  const nextSource =
    source.slice(0, extracted.start) + replacement + source.slice(extracted.end);
  fs.writeFileSync(filePath, nextSource, "utf8");
  updated.push(path.relative(path.resolve(import.meta.dirname, ".."), filePath));
}

console.log(`Updated ${updated.length} components:`);
for (const file of updated) {
  console.log(`- ${file}`);
}
