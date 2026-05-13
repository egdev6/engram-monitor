import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rawVersion = process.argv[2]?.trim();

if (!rawVersion) {
  console.error('Uso: node scripts/release/generate-release-notes.mjs <vX.Y.Z|X.Y.Z>');
  process.exit(1);
}

const version = rawVersion.startsWith('v') ? rawVersion.slice(1) : rawVersion;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Versión inválida: "${rawVersion}".`);
  process.exit(1);
}

const root = process.cwd();
const packageJsonPath = path.join(root, 'package.json');
const changelogPath = path.join(root, 'CHANGELOG.md');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

if (packageJson.version !== version) {
  console.error(
    `La versión del tag (${version}) no coincide con package.json (${packageJson.version}).`,
  );
  process.exit(1);
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const changelog = await readFile(changelogPath, 'utf8');
const releaseRegex = new RegExp(
  `^## \\[${escapeRegex(version)}\\] - (\\d{4}-\\d{2}-\\d{2})\\s*\\n([\\s\\S]*?)(?=^## \\[|\\Z)`,
  'm',
);
const match = changelog.match(releaseRegex);

if (!match) {
  console.error(`No encontré una entrada para la versión ${version} en CHANGELOG.md.`);
  process.exit(1);
}

const [, releaseDate, body] = match;
const notes = body.trim();

if (!notes) {
  console.error(`La entrada ${version} del CHANGELOG.md está vacía.`);
  process.exit(1);
}

const output = [`# ${packageJson.name} v${version}`, '', `Fecha de release: ${releaseDate}`, '', notes].join(
  '\n',
);

process.stdout.write(`${output}\n`);
