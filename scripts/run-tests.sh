#!/bin/bash
# scripts/run-tests.sh
# Executed by the Azure Container Apps Job on every scheduled or manual run.
# Runs Playwright E2E tests, then uploads the HTML report to Azure Blob Storage
# regardless of whether tests passed or failed.

cd /app

# --------------------------------------------------------------------------
# 1. Install dependencies
# --------------------------------------------------------------------------
echo "=== Installing dependencies ==="
npm ci
if [ $? -ne 0 ]; then
  echo "ERROR: npm ci failed — aborting"
  exit 1
fi

# --------------------------------------------------------------------------
# 2. Run Playwright tests
# Capture exit code so we can still upload the report on failure.
# --------------------------------------------------------------------------
echo "=== Running Playwright tests ==="
npx playwright test
TEST_EXIT_CODE=$?

# --------------------------------------------------------------------------
# 3. Upload report to Azure Blob Storage
# Uses azcopy with managed identity auth (no secrets needed).
# --------------------------------------------------------------------------
echo "=== Uploading report to Azure Blob Storage ==="

wget -q -O /tmp/azcopy.tar.gz "https://aka.ms/downloadazcopy-v10-linux"
tar -xf /tmp/azcopy.tar.gz -C /tmp
AZCOPY=$(find /tmp -name 'azcopy' -executable -type f | head -1)

# Authenticate using the job's user-assigned managed identity
"$AZCOPY" login --login-type=MSI

STORAGE_ACCOUNT="alumnie2ereports"
WEB_URL="https://${STORAGE_ACCOUNT}.blob.core.windows.net/\$web"

# Use the Container Apps Job execution name as the run ID (unique per execution).
# Falls back to a timestamp if the env var isn't set (e.g. local testing).
RUN_ID="${CONTAINER_APP_JOB_EXECUTION_NAME:-$(date +%Y%m%d-%H%M%S)}"

# Upload versioned archive under /runs/<RUN_ID>/ — auto-deleted after 30 days
# by the storage lifecycle policy.
(cd playwright-report && "$AZCOPY" copy "." "${WEB_URL}/runs/${RUN_ID}/" --recursive --overwrite=true)

# Overwrite the root — always serves the most recent report at the stable URL.
(cd playwright-report && "$AZCOPY" copy "." "${WEB_URL}/" --recursive --overwrite=true)

echo ""
echo "Report published:"
echo "  Latest:   https://${STORAGE_ACCOUNT}.z13.web.core.windows.net/"
echo "  This run: https://${STORAGE_ACCOUNT}.z13.web.core.windows.net/runs/${RUN_ID}/"

# Exit with the Playwright exit code so the job shows as failed when tests fail.
exit $TEST_EXIT_CODE
