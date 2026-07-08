#!/usr/bin/env bash
# scripts/publish-history.sh
#
# Runs after Playwright in CI. It:
#   1. Ensures a report directory exists (synthesises a stub if the run died
#      before Playwright could emit one).
#   2. Fetches the durable archive branch `test-history` (creating it on the
#      first ever run) into ./history-store.
#   3. Copies this run's report into history-store/runs/<slug>/ and writes a
#      meta.json describing the run.
#   4. Runs build-history.mjs to prune to the last $KEEP_RUNS runs and
#      regenerate the history index.
#   5. Commits and pushes the archive back to `test-history`.
#   6. Assembles ./site — the directory that gets published to GitHub Pages:
#        site/            -> latest report (root, unchanged behaviour)
#        site/runs/<slug> -> every archived run's full report
#        site/history/    -> the generated history index
#
# Required env (provided by the workflow):
#   GITHUB_TOKEN, REPO (owner/name), SERVER_URL, RUN_NUMBER, RUN_ID,
#   RUN_STATUS, ACTOR, EVENT, SHA, TEST_FILTER, KEEP_RUNS

set -euo pipefail

REPORT_DIR="playwright-report"
STORE="history-store"
SITE="site"
HISTORY_BRANCH="test-history"
KEEP_RUNS="${KEEP_RUNS:-50}"

TS_COMPACT="$(date -u +%Y%m%dT%H%M%SZ)"
TS_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
SLUG="${RUN_NUMBER}-${TS_COMPACT}"

echo "=== Publishing run ${SLUG} (status: ${RUN_STATUS:-unknown}) ==="

# --------------------------------------------------------------------------
# 1. Guarantee a report exists so downstream steps never fail on a hard crash.
# --------------------------------------------------------------------------
if [ ! -f "${REPORT_DIR}/index.html" ]; then
  echo "No report found — writing a placeholder."
  mkdir -p "${REPORT_DIR}"
  cat > "${REPORT_DIR}/index.html" <<EOF
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>Run failed before report was generated</title></head>
<body style="font-family:sans-serif;max-width:640px;margin:64px auto;padding:0 20px">
<h1>Run failed before a report was generated</h1>
<p>Playwright did not produce an HTML report for this run.</p>
<p>Run #${RUN_NUMBER} · ${TS_ISO}</p>
<p><a href="${SERVER_URL}/${REPO}/actions/runs/${RUN_ID}">View the CI log</a></p>
</body></html>
EOF
fi

# --------------------------------------------------------------------------
# 1b. Inject a "View run history" link into the report so it's reachable
#     from the latest report, every archived run, and wherever the report
#     link gets shared — not just from GitHub's deployment card, which only
#     has room for one URL.
# --------------------------------------------------------------------------
OWNER="$(echo "${REPO}" | cut -d/ -f1 | tr '[:upper:]' '[:lower:]')"
REPO_NAME="$(echo "${REPO}" | cut -d/ -f2)"
PAGES_BASE_URL="https://${OWNER}.github.io/${REPO_NAME}/"
node scripts/inject-history-link.mjs "${REPORT_DIR}" "${PAGES_BASE_URL}history/"

# --------------------------------------------------------------------------
# 2. Fetch (or create) the archive branch.
# --------------------------------------------------------------------------
# HISTORY_REMOTE lets tests point at a local repo; CI uses the token URL.
REMOTE="${HISTORY_REMOTE:-https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git}"
rm -rf "${STORE}"
if git clone --quiet --branch "${HISTORY_BRANCH}" --single-branch --depth 1 "${REMOTE}" "${STORE}"; then
  echo "Fetched existing '${HISTORY_BRANCH}' branch."
else
  echo "Branch '${HISTORY_BRANCH}' does not exist yet — creating it."
  rm -rf "${STORE}"
  git init --quiet "${STORE}"
  git -C "${STORE}" checkout --quiet --orphan "${HISTORY_BRANCH}"
  git -C "${STORE}" remote add origin "${REMOTE}"
fi

git -C "${STORE}" config user.name "github-actions[bot]"
git -C "${STORE}" config user.email "41898282+github-actions[bot]@users.noreply.github.com"

# --------------------------------------------------------------------------
# 3. Archive this run + write its metadata.
# --------------------------------------------------------------------------
RUN_DEST="${STORE}/runs/${SLUG}"
mkdir -p "${RUN_DEST}"
cp -R "${REPORT_DIR}/." "${RUN_DEST}/"

jq -n \
  --arg slug "${SLUG}" \
  --arg run_number "${RUN_NUMBER}" \
  --arg run_id "${RUN_ID}" \
  --arg status "${RUN_STATUS:-unknown}" \
  --arg timestamp "${TS_ISO}" \
  --arg actor "${ACTOR:-}" \
  --arg event "${EVENT:-}" \
  --arg filter "${TEST_FILTER:-All tests}" \
  --arg sha "${SHA:-}" \
  --arg run_url "${SERVER_URL}/${REPO}/actions/runs/${RUN_ID}" \
  '{slug:$slug, run_number:$run_number, run_id:$run_id, status:$status,
    timestamp:$timestamp, actor:$actor, event:$event, filter:$filter,
    sha:$sha, run_url:$run_url}' \
  > "${RUN_DEST}/meta.json"

# --------------------------------------------------------------------------
# 4. Prune to $KEEP_RUNS and regenerate the history index.
# --------------------------------------------------------------------------
node scripts/build-history.mjs "${STORE}" "${KEEP_RUNS}"

# --------------------------------------------------------------------------
# 5. Commit + push the archive back to the branch (with a small retry).
# --------------------------------------------------------------------------
git -C "${STORE}" add -A
if git -C "${STORE}" diff --cached --quiet; then
  echo "Nothing to commit to ${HISTORY_BRANCH}."
else
  git -C "${STORE}" commit --quiet -m "Archive run ${SLUG} (${RUN_STATUS:-unknown})"
  pushed=false
  for attempt in 1 2 3; do
    if git -C "${STORE}" push --quiet origin "HEAD:${HISTORY_BRANCH}"; then
      pushed=true
      break
    fi
    echo "Push attempt ${attempt} failed; re-fetching and retrying..."
    git -C "${STORE}" fetch --quiet origin "${HISTORY_BRANCH}" || true
    git -C "${STORE}" rebase --quiet "origin/${HISTORY_BRANCH}" || git -C "${STORE}" rebase --abort || true
    sleep $(( (RANDOM % 4) + 2 ))
  done
  if [ "${pushed}" != true ]; then
    echo "WARNING: could not push archive to ${HISTORY_BRANCH}; continuing to publish this run anyway." >&2
  fi
fi

# --------------------------------------------------------------------------
# 6. Assemble the site that GitHub Pages will publish.
#    Root = latest report (unchanged); plus runs/ and history/.
# --------------------------------------------------------------------------
rm -rf "${SITE}"
mkdir -p "${SITE}/history"
cp -R "${REPORT_DIR}/." "${SITE}/"
if [ -d "${STORE}/runs" ]; then
  cp -R "${STORE}/runs" "${SITE}/runs"
fi
cp "${STORE}/index.html" "${SITE}/history/index.html"

echo "=== Site assembled ==="
echo "  Latest : (site root)"
echo "  History: /history/"
echo "  Runs   : $(find "${SITE}/runs" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ') archived"
