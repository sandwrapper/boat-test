#!/usr/bin/env node
/* Builds two single-file versions of the app:
   dist/index.html       — complete standalone page (open from disk, no server needed)
   dist/artifact.html    — same page without the document skeleton, for publishing as an artifact */
const fs = require('fs');
const path = require('path');
const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function inline(src) {
  return src
    .replace(/<link rel="stylesheet" href="(src\/[^"]+)">/g, (m, p) => `<style>\n${fs.readFileSync(path.join(root, p), 'utf8')}\n</style>`)
    .replace(/<script src="((?:src|content)\/[^"]+)"><\/script>/g, (m, p) => { const f = path.join(root, p); if (!fs.existsSync(f)) { console.warn('missing ' + p + ' (skipped)'); return ''; } return `<script>\n${fs.readFileSync(f, 'utf8').replace(/<\/script/gi, '<\\/script')}\n</script>`; });
}
const full = inline(html);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), full);

// Artifact fragment: everything inside <head> (title, fonts, style) + body contents, no skeleton tags.
const head = full.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta[^>]*>/g, '')
  .replace(/<link rel="preconnect"[^>]*>/g, '')
  .trim();
const body = full.match(/<body>([\s\S]*?)<\/body>/)[1].trim();
fs.writeFileSync(path.join(root, 'dist/artifact.html'), head + '\n' + body + '\n');
const kb = f => Math.round(fs.statSync(path.join(root, f)).size / 1024);
console.log(`dist/index.html ${kb('dist/index.html')} KB, dist/artifact.html ${kb('dist/artifact.html')} KB`);
