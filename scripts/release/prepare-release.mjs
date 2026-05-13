import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const version = process.argv[2]?.trim();

if (!version) {
  console.error('Uso: npm run release:prepare -- <x.y.z>');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Versión inválida: "${version}". Usá formato semver simple, por ejemplo 0.1.0.`);
  process.exit(1);
}

const root = process.cwd();
const packageJsonPath = path.join(root, 'package.json');
const changelogPath = path.join(root, 'CHANGELOG.md');

const compareVersions = (left, right) => {
  const [lMajor, lMinor, lPatch] = left.split('.').map(Number);
  const [rMajor, rMinor, rPatch] = right.split('.').map(Number);

  if (lMajor !== rMajor) return lMajor - rMajor;
  if (lMinor !== rMinor) return lMinor - rMinor;
  return lPatch - rPatch;
};

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

if (!currentVersion || !/^\d+\.\d+\.\d+$/.test(currentVersion)) {
  console.error('package.json no tiene una versión semver válida.');
  process.exit(1);
}

if (compareVersions(version, currentVersion) <= 0) {
  console.error(`La nueva versión (${version}) debe ser mayor que la actual (${currentVersion}).`);
  process.exit(1);
}

const changelog = await readFile(changelogPath, 'utf8');
const unreleasedRegex = /^## \[Unreleased\]\s*\n([\s\S]*?)(?=^## \[|\Z)/m;
const unreleasedMatch = changelog.match(unreleasedRegex);

if (!unreleasedMatch) {
  console.error('CHANGELOG.md no contiene la sección "## [Unreleased]".');
  process.exit(1);
}

const unreleasedBody = unreleasedMatch[1].trim();

if (!unreleasedBody) {
  console.error('La sección [Unreleased] está vacía. Agregá cambios antes de cortar la release.');
  process.exit(1);
}

const hasRealEntries = unreleasedBody
  .split('\n')
  .map((line) => line.trim())
  .some((line) => line && !line.startsWith('###'));

if (!hasRealEntries) {
  console.error('La sección [Unreleased] no tiene ítems listados.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const releaseBlock = `## [${version}] - ${today}\n${unreleasedBody}\n`;
const nextChangelog = changelog.replace(
  unreleasedRegex,
  `## [Unreleased]\n\n${releaseBlock}\n`,
);

packageJson.version = version;

await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
await writeFile(changelogPath, nextChangelog, 'utf8');

console.log(`Release preparada: v${version}`);
console.log('Siguientes pasos:');
console.log('1. Revisá CHANGELOG.md y package.json');
console.log(`2. git add CHANGELOG.md package.json`);
console.log(`3. git commit -m "chore(release): v${version}"`);
console.log(`4. git tag v${version}`);
console.log('5. git push && git push --tags');
console.log('6. GitHub Actions publicará la GitHub Release automáticamente');
