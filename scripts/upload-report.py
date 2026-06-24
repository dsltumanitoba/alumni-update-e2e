#!/usr/bin/env python3
"""
Upload the Playwright HTML report to Azure Blob Storage using managed identity.
Uses only the Python standard library — no pip installs required.

Authentication: Azure Instance Metadata Service (IMDS) — works in any Azure
compute resource (Container Apps Jobs, VMs, ACI, etc.) with a managed identity.

Usage:
    python3 scripts/upload-report.py <local-report-dir> <destination-prefix>

Example:
    python3 scripts/upload-report.py playwright-report ""          # root (latest)
    python3 scripts/upload-report.py playwright-report runs/abc123  # versioned
"""

import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request

STORAGE_ACCOUNT = "alumnie2ereports"
CONTAINER = "$web"
# Client ID of the user-assigned managed identity on the Container Apps Job.
MSI_CLIENT_ID = os.environ.get("AZCOPY_MSI_CLIENT_ID", "")


def get_token() -> str:
    """
    Get an Azure AD token for storage.azure.com using managed identity.

    Azure Container Apps exposes identity tokens via IDENTITY_ENDPOINT +
    IDENTITY_HEADER (not the standard IMDS at 169.254.169.254).
    """
    identity_endpoint = os.environ.get("IDENTITY_ENDPOINT", "")
    identity_header = os.environ.get("IDENTITY_HEADER", "")

    if identity_endpoint and identity_header:
        # Container Apps managed identity endpoint
        url = (
            f"{identity_endpoint}"
            "?resource=https://storage.azure.com/"
            "&api-version=2019-08-01"
            f"&client_id={MSI_CLIENT_ID}"
        )
        headers = {"X-IDENTITY-HEADER": identity_header}
    else:
        # Standard IMDS fallback (VMs, ACI, etc.)
        url = (
            "http://169.254.169.254/metadata/identity/oauth2/token"
            "?api-version=2018-02-01"
            "&resource=https%3A%2F%2Fstorage.azure.com%2F"
            f"&client_id={MSI_CLIENT_ID}"
        )
        headers = {"Metadata": "true"}

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())["access_token"]


def upload_file(token: str, local_path: str, blob_path: str) -> None:
    mime_type, _ = mimetypes.guess_type(local_path)
    mime_type = mime_type or "application/octet-stream"

    url = f"https://{STORAGE_ACCOUNT}.blob.core.windows.net/{CONTAINER}/{blob_path}"

    with open(local_path, "rb") as f:
        data = f.read()

    req = urllib.request.Request(
        url,
        data=data,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "x-ms-version": "2020-04-08",
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": mime_type,
            "Content-Length": str(len(data)),
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status not in (200, 201):
                raise RuntimeError(f"Unexpected status {resp.status} for {blob_path}")
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        raise RuntimeError(f"HTTP {e.code} uploading {blob_path}: {body}") from e


def upload_directory(local_dir: str, prefix: str) -> None:
    token = get_token()
    count = 0

    for root, _dirs, files in os.walk(local_dir):
        for fname in sorted(files):
            local_path = os.path.join(root, fname)
            rel_path = os.path.relpath(local_path, local_dir)
            # Ensure forward slashes for blob paths on any OS
            rel_path = rel_path.replace(os.sep, "/")
            blob_path = f"{prefix}/{rel_path}".lstrip("/")

            upload_file(token, local_path, blob_path)
            print(f"  uploaded: {blob_path}")
            count += 1

    print(f"Done — {count} files uploaded to {CONTAINER}/{prefix or '(root)'}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <report-dir> <destination-prefix>", file=sys.stderr)
        sys.exit(1)

    report_dir = sys.argv[1]
    dest_prefix = sys.argv[2]

    if not os.path.isdir(report_dir):
        print(f"ERROR: {report_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    if not MSI_CLIENT_ID:
        print("ERROR: AZCOPY_MSI_CLIENT_ID env var is not set", file=sys.stderr)
        sys.exit(1)
    if not os.environ.get("IDENTITY_ENDPOINT") and not os.environ.get("IDENTITY_HEADER"):
        print("WARNING: IDENTITY_ENDPOINT/IDENTITY_HEADER not set — falling back to IMDS")

    print(f"Uploading {report_dir}/ → {CONTAINER}/{dest_prefix or '(root)'}")
    upload_directory(report_dir, dest_prefix)
