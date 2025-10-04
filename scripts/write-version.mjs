import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function getGitHash() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    if (hash) return hash;
  } catch (_) {}
  return '';
}

function main() {
  const hash = getGitHash();
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', { dateStyle: 'short', timeStyle: 'medium', hour12: false }).format(now).replaceAll('/', '-').replace(', ', '-').replaceAll(':', '');
  const version = hash ? `${dateStr}-${hash}` : `${dateStr}`;
  const payload = { version };

  const publicDir = resolve(process.cwd(), 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }
  const out = resolve(publicDir, 'version.json');
  writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${out} ->`, payload);
}

main();
