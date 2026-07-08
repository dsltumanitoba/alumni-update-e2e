#!/usr/bin/env node
/**
 * scripts/build-history.mjs
 *
 * Reads every archived run under <store>/runs/<slug>/meta.json, prunes the
 * archive down to the most recent <keep> runs (deleting the oldest report
 * directories), and (re)generates <store>/index.html — a self-contained
 * history page listing every retained run with a link to its full report.
 *
 * Node standard library only — no dependencies.
 *
 * Usage:
 *   node scripts/build-history.mjs <store-dir> [keep]
 *
 * Example:
 *   node scripts/build-history.mjs history-store 50
 */

import fs from 'node:fs';
import path from 'node:path';

const store = process.argv[2] || 'history-store';
const keep = Number.parseInt(process.argv[3] ?? '50', 10);
const runsDir = path.join(store, 'runs');

/** Collect every run that has a readable meta.json. */
function loadRuns() {
  if (!fs.existsSync(runsDir)) return [];
  const runs = [];
  for (const dir of fs.readdirSync(runsDir)) {
    const metaPath = path.join(runsDir, dir, 'meta.json');
    if (!fs.existsSync(metaPath)) continue;
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      meta.dir = dir;
      runs.push(meta);
    } catch (err) {
      console.warn(`  skipping ${dir}: unreadable meta.json (${err.message})`);
    }
  }
  return runs;
}

/** Newest first, using the ISO timestamp (falls back to dir name). */
function sortNewestFirst(runs) {
  return runs.sort((a, b) =>
    (b.timestamp ?? b.dir).localeCompare(a.timestamp ?? a.dir),
  );
}

/** Delete report directories beyond the retention limit. */
function prune(runs) {
  if (!(keep > 0) || runs.length <= keep) return runs;
  for (const stale of runs.slice(keep)) {
    fs.rmSync(path.join(runsDir, stale.dir), { recursive: true, force: true });
    console.log(`  pruned old run: ${stale.dir}`);
  }
  return runs.slice(0, keep);
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** "2026-07-07T13:04:22Z" -> "2026-07-07 13:04 UTC" */
function prettyTime(iso) {
  if (!iso) return '—';
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso);
  return m ? `${m[1]} ${m[2]} UTC` : iso;
}

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  const pass = s === 'success';
  const label = pass ? 'Passed' : s === 'failure' ? 'Failed' : status || 'Unknown';
  const cls = pass ? 'pass' : s === 'failure' ? 'fail' : 'other';
  return `<span class="badge ${cls}">${esc(label)}</span>`;
}

function triggerLabel(run) {
  const event = run.event === 'workflow_dispatch' ? 'Manual' :
    run.event === 'schedule' ? 'Scheduled' : run.event || '—';
  return run.actor ? `${esc(event)} · ${esc(run.actor)}` : esc(event);
}

function buildRow(run) {
  const reportUrl = `../runs/${encodeURIComponent(run.dir)}/`;
  const runUrl = run.run_url ? esc(run.run_url) : '';
  const actionsCell = runUrl
    ? `<a href="${runUrl}" target="_blank" rel="noopener">CI&nbsp;log&nbsp;↗</a>`
    : '—';
  return `        <tr>
          <td class="num">#${esc(run.run_number ?? '?')}</td>
          <td>${prettyTime(run.timestamp)}</td>
          <td>${statusBadge(run.status)}</td>
          <td>${esc(run.filter || 'All tests')}</td>
          <td>${triggerLabel(run)}</td>
          <td><a class="report-link" href="${reportUrl}">Open report →</a></td>
          <td class="ci">${actionsCell}</td>
        </tr>`;
}

function buildHtml(runs) {
  const generated = new Date().toISOString();
  const rows = runs.length
    ? runs.map(buildRow).join('\n')
    : `        <tr><td colspan="7" class="empty">No runs archived yet.</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>E2E Test Run History — UM Alumni Update Form</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2328;
      background: #f6f8fa;
    }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 32px 20px 64px; }
    header { margin-bottom: 24px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .sub { color: #57606a; font-size: 14px; margin: 0; }
    .toolbar { margin: 16px 0 20px; }
    .toolbar a {
      display: inline-block; text-decoration: none; font-weight: 600; font-size: 14px;
      color: #0969da; padding: 8px 14px; border: 1px solid #d0d7de; border-radius: 6px;
      background: #fff;
    }
    .toolbar a:hover { background: #f3f4f6; }
    .card {
      background: #fff; border: 1px solid #d0d7de; border-radius: 8px; overflow: hidden;
    }
    .table-scroll { overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; font-size: 14px; }
    th, td { text-align: left; padding: 11px 14px; border-bottom: 1px solid #eaeef2; white-space: nowrap; }
    th { background: #f6f8fa; font-weight: 600; color: #57606a; position: sticky; top: 0; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; color: #57606a; }
    td.empty { text-align: center; color: #57606a; padding: 32px; }
    a.report-link { color: #0969da; text-decoration: none; font-weight: 600; }
    a.report-link:hover { text-decoration: underline; }
    td.ci a { color: #57606a; text-decoration: none; }
    td.ci a:hover { text-decoration: underline; }
    .badge {
      display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
    }
    .badge.pass { background: #dafbe1; color: #1a7f37; }
    .badge.fail { background: #ffebe9; color: #cf222e; }
    .badge.other { background: #eaeef2; color: #57606a; }
    footer { margin-top: 20px; color: #8c959f; font-size: 12px; }
    @media (prefers-color-scheme: dark) {
      body { color: #e6edf3; background: #0d1117; }
      .sub { color: #9198a1; }
      .toolbar a { color: #4493f8; border-color: #30363d; background: #161b22; }
      .toolbar a:hover { background: #21262d; }
      .card { background: #161b22; border-color: #30363d; }
      th, td { border-bottom-color: #21262d; }
      th { background: #161b22; color: #9198a1; }
      td.num, td.empty, td.ci a { color: #9198a1; }
      a.report-link { color: #4493f8; }
      .badge.pass { background: #12261e; color: #3fb950; }
      .badge.fail { background: #291415; color: #f85149; }
      .badge.other { background: #21262d; color: #9198a1; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>E2E Test Run History</h1>
      <p class="sub">University of Manitoba — Alumni Contact Update Form · every run archived, newest first.</p>
    </header>

    <div class="toolbar">
      <a href="../">← View latest results</a>
    </div>

    <div class="card">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Run</th>
              <th>When</th>
              <th>Status</th>
              <th>Journey</th>
              <th>Trigger</th>
              <th>Report</th>
              <th>CI</th>
            </tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </div>
    </div>

    <footer>
      Showing ${runs.length} run${runs.length === 1 ? '' : 's'} · generated ${prettyTime(generated)}
    </footer>
  </div>
</body>
</html>
`;
}

function main() {
  let runs = sortNewestFirst(loadRuns());
  runs = prune(runs);
  fs.mkdirSync(store, { recursive: true });
  fs.writeFileSync(path.join(store, 'index.html'), buildHtml(runs));
  console.log(`Wrote ${path.join(store, 'index.html')} with ${runs.length} run(s).`);
}

main();
