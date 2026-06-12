import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const releasesDir = path.join(projectRoot, 'content', 'docs', 'releases');

test('release pages do not link to non-served release security directories', () => {
  const releaseFiles = fs
    .readdirSync(releasesDir)
    .filter((file) => file.endsWith('.mdx'));

  for (const file of releaseFiles) {
    const content = fs.readFileSync(path.join(releasesDir, file), 'utf8');

    assert.doesNotMatch(content, /Artifact bundle:/, `${file} must not link a directory bundle`);
    assert.doesNotMatch(
      content,
      /https:\/\/docs\.payment-gateway\.app\/release-security\/v[0-9]+\.[0-9]+\.[0-9]+\/(?:\s|$)/,
      `${file} must not link a release-security directory`,
    );

    if (/https:\/\/docs\.payment-gateway\.app\/release-security\/v[0-9]+\.[0-9]+\.[0-9]+\//.test(content)) {
      assert.doesNotMatch(
        content,
        /^## \[[0-9]+\.[0-9]+\.[0-9]+\] - /m,
        `${file} must not repeat the version heading inside the release page`,
      );
    }
  }
});
