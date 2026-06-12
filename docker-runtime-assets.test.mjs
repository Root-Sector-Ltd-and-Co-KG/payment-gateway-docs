import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function read(filePath) {
  return fs.readFileSync(path.join(projectRoot, filePath), 'utf8');
}

test('production Docker runtime includes Next public assets', () => {
  const dockerfile = read('Dockerfile');

  assert.match(dockerfile, /COPY --from=builder \/app\/public \.\/public/);
});
