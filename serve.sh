#!/usr/bin/env bash
# Serve MoneroMaps locally with any static file server (no build step).
# Usage: ./serve.sh [port]     (default 8477)
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8477}"
echo "MoneroMaps running at:  http://localhost:${PORT}"
echo "(Ctrl+C to stop)"
exec python3 -m http.server "${PORT}"
