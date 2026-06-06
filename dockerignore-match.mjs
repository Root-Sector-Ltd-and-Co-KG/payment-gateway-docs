/**
 * Minimal .dockerignore matcher (gitignore-style rules used by Docker).
 * Keep in sync with component-level dockerignore-match.mjs copies.
 */

export function parseDockerignore(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

function globToRegExp(glob) {
  let regex = '';
  let index = 0;

  if (glob.startsWith('**/')) {
    regex += '(?:.*/)?';
    index = 3;
  }

  while (index < glob.length) {
    const char = glob[index];
    if (char === '*') {
      if (glob[index + 1] === '*') {
        index += 1;
        if (glob[index + 1] === '/') {
          regex += '(?:.*/)?';
          index += 1;
        } else {
          regex += '.*';
        }
      } else {
        regex += '[^/]*';
      }
    } else if (char === '?') {
      regex += '[^/]';
    } else if ('.+^${}()|[]\\'.includes(char)) {
      regex += `\\${char}`;
    } else {
      regex += char;
    }
    index += 1;
  }

  return new RegExp(`^${regex}$`);
}

function globMatch(value, pattern) {
  return globToRegExp(pattern).test(value);
}

function matchPattern(relativePath, pattern) {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\.\/+/, '');
  const directoryOnly = pattern.endsWith('/');
  const effectivePattern = directoryOnly ? pattern.slice(0, -1) : pattern;

  if (directoryOnly) {
    return (
      normalized === effectivePattern
      || normalized.startsWith(`${effectivePattern}/`)
      || normalized.split('/').includes(effectivePattern)
    );
  }

  if (effectivePattern.includes('/')) {
    if (globMatch(normalized, effectivePattern)) {
      return true;
    }

    if (!effectivePattern.startsWith('**/')) {
      return globMatch(normalized, `**/${effectivePattern}`);
    }

    return false;
  }

  const basename = normalized.split('/').pop() ?? normalized;
  if (globMatch(basename, effectivePattern)) {
    return true;
  }

  for (const segment of normalized.split('/')) {
    if (globMatch(segment, effectivePattern)) {
      return true;
    }
  }

  return globMatch(normalized, `**/${effectivePattern}`);
}

export function isDockerignored(relativePath, dockerignoreContent) {
  let ignored = false;

  for (const rawPattern of parseDockerignore(dockerignoreContent)) {
    const negated = rawPattern.startsWith('!');
    const pattern = negated ? rawPattern.slice(1) : rawPattern;
    if (matchPattern(relativePath, pattern)) {
      ignored = !negated;
    }
  }

  return ignored;
}
