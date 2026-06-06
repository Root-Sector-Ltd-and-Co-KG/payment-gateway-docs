import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { isDockerignored } from './dockerignore-match.mjs';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const required = ['package.json', 'pnpm-lock.yaml', 'next.config.mjs', 'content/docs/index.mdx'];

const forbidden = [
  'node_modules/next/package.json',
  'README.md',
  'scripts/start-standalone.mjs',
  '.next/server/app-paths-manifest.json',
];

test('production Docker build keeps required files in context', () => {
  const dockerignoreContent = fs.readFileSync(path.join(projectRoot, '.dockerignore'), 'utf8');

  for (const filePath of required) {
    assert.equal(
      isDockerignored(filePath, dockerignoreContent),
      false,
      `must not ignore ${filePath}`,
    );
  }

  for (const filePath of forbidden) {
    assert.equal(
      isDockerignored(filePath, dockerignoreContent),
      true,
      `must ignore ${filePath}`,
    );
  }
});
