#!/bin/bash
# scripts/diagnose.sh
# Minimal diagnostic: gets an IMDS token and uploads a test blob.
# Run this as the startup command to confirm MSI + blob upload works
# independently of the test suite.
#
# Check results: python3 -c "from azure.storage.blob import ...; list blobs in $web"

set -x  # Print every command (visible in logs)

echo "=== Environment ==="
echo "AZCOPY_MSI_CLIENT_ID=$AZCOPY_MSI_CLIENT_ID"
echo "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=$PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD"
echo "PLAYWRIGHT_BROWSERS_PATH=$PLAYWRIGHT_BROWSERS_PATH"
python3 --version
node --version

echo "=== IMDS token test ==="
python3 - <<EOF
import json, urllib.request, os, sys

client_id = os.environ.get("AZCOPY_MSI_CLIENT_ID", "")
print(f"Client ID from env: {client_id!r}")

url = (
    "http://169.254.169.254/metadata/identity/oauth2/token"
    "?api-version=2018-02-01"
    "&resource=https%3A%2F%2Fstorage.azure.com%2F"
    f"&client_id={client_id}"
)

try:
    req = urllib.request.Request(url, headers={"Metadata": "true"})
    resp = urllib.request.urlopen(req, timeout=15)
    data = json.loads(resp.read())
    token = data["access_token"]
    print(f"Token OK — expires_in: {data.get('expires_in')} seconds")
except Exception as e:
    print(f"IMDS token FAILED: {e}", file=sys.stderr)
    sys.exit(1)

print("=== Uploading test blob ===")
content = b"diagnostic test from Azure Container Apps Job"
test_url = "https://alumnie2ereports.blob.core.windows.net/\$web/diagnostic.txt"
put_req = urllib.request.Request(
    test_url,
    data=content,
    method="PUT",
    headers={
        "Authorization": f"Bearer {token}",
        "x-ms-version": "2020-04-08",
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": "text/plain",
        "Content-Length": str(len(content)),
    },
)
try:
    put_resp = urllib.request.urlopen(put_req, timeout=15)
    print(f"Upload OK — HTTP {put_resp.status}")
except urllib.error.HTTPError as e:
    body = e.read().decode(errors="replace")
    print(f"Upload FAILED: HTTP {e.code}: {body}", file=sys.stderr)
    sys.exit(1)
EOF
