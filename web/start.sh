#!/bin/sh
# Railway start script for Cap Web. Fixed settings get defaults here so the
# template only carries references and generated secrets.
set -eu

export PORT="${PORT:-3000}"
export WEB_URL="${WEB_URL:-http://localhost:${PORT}}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-$WEB_URL}"

# Railway Buckets use virtual-hosted-style URLs. Set S3_PATH_STYLE=true for MinIO.
export S3_PATH_STYLE="${S3_PATH_STYLE:-false}"
export S3_PUBLIC_ENDPOINT="${S3_PUBLIC_ENDPOINT:-${CAP_AWS_ENDPOINT:-}}"
export S3_INTERNAL_ENDPOINT="${S3_INTERNAL_ENDPOINT:-$S3_PUBLIC_ENDPOINT}"

# The Chrome Web Store extension's ID, so the Cap extension can sign in.
export CAP_CHROME_EXTENSION_ID="${CAP_CHROME_EXTENSION_ID-fefjaffcodfiogbbngmjkcjpbpclbdcp}"

# Let browsers on WEB_URL upload straight to the bucket (CORS with ETag).
node /app/railway-bucket-cors.mjs || true

# Listen on IPv4 and IPv6, so Railway's private network reaches the webhook.
export HOSTNAME="${CAP_LISTEN_HOST:-::}"

exec node apps/web/server.js
