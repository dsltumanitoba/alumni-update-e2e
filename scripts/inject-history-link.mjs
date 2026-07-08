#!/usr/bin/env node
// scripts/inject-history-link.mjs
//
// Injects a small fixed "View run history" link into a Playwright HTML
// report's index.html, right after the opening <body> tag. Run once per
// report before it's archived/published, so the link travels with the
// report everywhere it ends up: the latest report at the site root, every
// archived run under /runs/<slug>/, and the copy kept on the test-history
// branch.
//
// Usage: node scripts/inject-history-link.mjs <report-dir> <history-url>

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [, , reportDir, historyUrl] = process.argv;

if (!reportDir || !historyUrl) {
  console.error('Usage: node inject-history-link.mjs <report-dir> <history-url>');
  process.exit(1);
}

const indexPath = join(reportDir, 'index.html');
const html = readFileSync(indexPath, 'utf8');

const banner = `<a href="${historyUrl}" style="position:fixed;top:10px;right:10px;z-index:99999;background:#1a7f4b;color:#fff;font:600 13px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:8px 14px;border-radius:6px;text-decoration:none;box-shadow:0 2px 6px rgba(0,0,0,.35)">↩ View run history</a>`;

if (!/<body[^>]*>/.test(html)) {
  console.error(`No <body> tag found in ${indexPath}; skipping injection.`);
  process.exit(0);
}

const updated = html.replace(/<body([^>]*)>/, (_match, attrs) => `<body${attrs}>${banner}`);
writeFileSync(indexPath, updated);
console.log(`Injected history link (-> ${historyUrl}) into ${indexPath}`);
