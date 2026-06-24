#!/bin/bash
# scripts/run-tests.sh
# Executed by the Azure Container Apps Job on every scheduled or manual run.
# Runs Playwright E2E tests, then uploads the HTML report to Azure Blob Storage
# regardless of whether tests passed or failed.

set -euo pipefail

cd /app

# --------------------------------------------------------------------------
# 1. Install dependencies
# --------------------------------------------------------------------------
echo "=== Installing dependencies ==="
npm ci

# --------------------------------------------------------------------------
# 2. Run Playwright tests
# Disable set -e temporarily so a test failure doesn't abort the upload step.
# --------------------------------------------------------------------------
echo "=== Running Playwright tests ==="
set +e
CI=true npx playwright test
TEST_EXIT_CODE=$?
set -e

echo "=== Tests finished with exit code: $TEST_EXIT_CODE ==="

# --------------------------------------------------------------------------
# 3. Upload report to Azure Blob Storage via managed identity (IMDS).
# Uses scripts/upload-report.py — Python stdlib only, no extra installs.
# AZCOPY_MSI_CLIENT_ID is set as an env var on the Container Apps Job so the
# upload script knows which user-assigned identity to authenticate with.
# --------------------------------------------------------------------------
echo "=== Uploading report to Azure Blob Storage ==="

# If Playwright failed to launch (e.g. browser issue), it may not generate
# a report directory. Create a fallback so the upload step doesn't fail.
if [ ! -f playwright-report/index.html ]; then
  mkdir -p playwright-report
  cat > playwright-report/index.html <<EOF
<!DOCTYPE html><html><body>
<h1>Run failed before report was generated</h1>
<p>Playwright exit code: $TEST_EXIT_CODE</p>
<p>Run ID: ${CONTAINER_APP_JOB_EXECUTION_NAME:-unknown}</p>
</body></html>
EOF
fi

# Use the Container Apps Job execution name as the run ID (unique per execution).
# Falls back to a timestamp when running outside Azure (e.g. local testing).
RUN_ID="${CONTAINER_APP_JOB_EXECUTION_NAME:-$(date +%Y%m%d-%H%M%S)}"

# Upload versioned archive (auto-deleted after 30 days by lifecycle policy)
python3 scripts/upload-report.py playwright-report "runs/${RUN_ID}"

# Overwrite root — stable URL always serves the most recent report
python3 scripts/upload-report.py playwright-report ""

echo ""
echo "Report published:"
echo "  Latest:   https://alumnie2ereports.z13.web.core.windows.net/"
echo "  This run: https://alumnie2ereports.z13.web.core.windows.net/runs/${RUN_ID}/"

# Exit with the Playwright exit code so the job shows as failed when tests fail.
exit $TEST_EXIT_CODE
