import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { register } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Node's native TS runner cannot resolve the app's `@constants/*` alias, so
// register a resolver hook for the module under test before importing it.
const helpersDir = path.dirname(fileURLToPath(import.meta.url));
const constantsDir = path.join(path.resolve(helpersDir, '../../..'), 'src/utils/constants');
const resolverSource = [
  "import { pathToFileURL } from 'node:url';",
  'export async function resolve(specifier, context, nextResolve) {',
  "  if (specifier.startsWith('@constants/')) {",
  `    const file = ${JSON.stringify(constantsDir)} + '/' + specifier.slice('@constants/'.length) + '.ts';`,
  '    return nextResolve(pathToFileURL(file).href, context);',
  '  }',
  '  return nextResolve(specifier, context);',
  '}'
].join('\n');

register(`data:text/javascript,${encodeURIComponent(resolverSource)}`);

const { isWithinLocalDateRange, localDayBoundary, parseEngramDate } = await import('./time.ts');

const HOUR = 3_600_000;
const NODE_FLAGS = ['--experimental-strip-types'];
const TZ_ENV = 'TZ';
const ZONE_ENV = 'ENGRAM_MONITOR_TEST_TZ';
const ZONE_CASES: Record<string, string> = {
  'America/Argentina/Buenos_Aires': 'Buenos Aires',
  'Europe/Madrid': 'Madrid'
};

// Date filtering builds boundaries from the viewer's local calendar, so each
// zone runs the shared suite in an isolated process started with its own TZ.
if (!process.env[ZONE_ENV]) {
  for (const [zone, label] of Object.entries(ZONE_CASES)) {
    test(`local calendar filtering — ${label} (${zone})`, () => {
      const result = spawnSync(process.execPath, [...NODE_FLAGS, fileURLToPath(import.meta.url)], {
        env: { ...process.env, [TZ_ENV]: zone, [ZONE_ENV]: zone },
        encoding: 'utf8'
      });
      assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
    });
  }
} else {
  const zone = process.env[ZONE_ENV] as string;

  test('parseEngramDate reads bare Engram timestamps as UTC', () => {
    assert.equal(parseEngramDate('2026-10-01 12:34:56').getTime(), Date.UTC(2026, 9, 1, 12, 34, 56));
  });

  test('parseEngramDate honours an explicit zone designator', () => {
    assert.equal(parseEngramDate('2026-10-01T12:34:56Z').getTime(), Date.UTC(2026, 9, 1, 12, 34, 56));
    assert.equal(parseEngramDate('2026-10-01T12:34:56+02:00').getTime(), Date.UTC(2026, 9, 1, 10, 34, 56));
  });

  test('parseEngramDate truncates sub-millisecond fractions', () => {
    assert.equal(parseEngramDate('2026-10-01 12:34:56.789').getTime(), Date.UTC(2026, 9, 1, 12, 34, 56, 789));
    assert.equal(parseEngramDate('2026-10-01 12:34:56.123456789').getTime(), Date.UTC(2026, 9, 1, 12, 34, 56, 123));
  });

  test('invalid timestamps and active-but-invalid bounds are rejected', () => {
    assert.equal(isWithinLocalDateRange('not-a-date', '2026-10-01', ''), false);
    assert.equal(isWithinLocalDateRange('not-a-date', '', '2026-10-01'), false);
    assert.equal(isWithinLocalDateRange('2026-10-01 03:00:00', 'not-a-date', ''), false);
    assert.equal(isWithinLocalDateRange('2026-10-01 03:00:00', '', 'not-a-date'), false);
    assert.equal(isWithinLocalDateRange('not-a-date', '', ''), true);
  });

  if (zone === 'America/Argentina/Buenos_Aires') {
    test('Buenos Aires: date inputs resolve to local midnight', () => {
      assert.equal(localDayBoundary('2026-10-01'), Date.UTC(2026, 9, 1, 3));
      assert.equal(localDayBoundary('2026-10-01', 1), Date.UTC(2026, 9, 2, 3));
    });

    test('Buenos Aires: lower bound is inclusive, upper bound exclusive', () => {
      assert.equal(isWithinLocalDateRange('2026-10-01 02:59:59', '2026-10-01', ''), false);
      assert.equal(isWithinLocalDateRange('2026-10-01 03:00:00', '2026-10-01', ''), true);
      assert.equal(isWithinLocalDateRange('2026-10-02 02:59:59', '', '2026-10-01'), true);
      assert.equal(isWithinLocalDateRange('2026-10-02 03:00:00', '', '2026-10-01'), false);
    });

    test('Buenos Aires: an empty bound is ignored', () => {
      assert.equal(isWithinLocalDateRange('1999-01-01 00:00:00', '', ''), true);
    });

    test('Buenos Aires: 2026-09-30 keeps 2026-10-01 02:30:00, October 1 drops it', () => {
      assert.equal(isWithinLocalDateRange('2026-10-01 02:30:00', '2026-09-30', '2026-09-30'), true);
      assert.equal(isWithinLocalDateRange('2026-10-01 02:30:00', '2026-10-01', '2026-10-01'), false);
    });
  }

  if (zone === 'Europe/Madrid') {
    test('Madrid: date inputs follow winter and summer local midnight', () => {
      assert.equal(localDayBoundary('2026-01-15'), Date.UTC(2026, 0, 14, 23));
      assert.equal(localDayBoundary('2026-07-15'), Date.UTC(2026, 6, 14, 22));
    });

    test('Madrid: spring-forward day spans 23h', () => {
      const start = localDayBoundary('2026-03-29');
      assert.equal(start, Date.UTC(2026, 2, 28, 23));
      assert.equal(localDayBoundary('2026-03-29', 1) - start, 23 * HOUR);
      assert.equal(isWithinLocalDateRange('2026-03-28 23:30:00', '2026-03-29', ''), true);
      assert.equal(isWithinLocalDateRange('2026-03-28 22:59:59', '2026-03-29', ''), false);
      assert.equal(isWithinLocalDateRange('2026-03-29 21:59:59', '', '2026-03-29'), true);
      assert.equal(isWithinLocalDateRange('2026-03-29 22:00:00', '', '2026-03-29'), false);
    });

    test('Madrid: fall-back day spans 25h', () => {
      const start = localDayBoundary('2026-10-25');
      assert.equal(start, Date.UTC(2026, 9, 24, 22));
      assert.equal(localDayBoundary('2026-10-25', 1) - start, 25 * HOUR);
      assert.equal(isWithinLocalDateRange('2026-10-24 21:59:59', '2026-10-25', '2026-10-25'), false);
      assert.equal(isWithinLocalDateRange('2026-10-25 21:59:59', '2026-10-25', '2026-10-25'), true);
      assert.equal(isWithinLocalDateRange('2026-10-25 22:59:59', '2026-10-25', '2026-10-25'), true);
      assert.equal(isWithinLocalDateRange('2026-10-25 23:00:00', '2026-10-25', '2026-10-25'), false);
    });
  }
}
