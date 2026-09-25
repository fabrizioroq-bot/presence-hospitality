#!/usr/bin/env bash
# Usage: scripts/lighthouse.sh <name> <url> [desktop]
# Runs Lighthouse against a production server and prints the key metrics.
set -euo pipefail
name=$1; url=$2; preset=${3:-mobile}
mkdir -p reports/lighthouse
flags=()
[[ "$preset" == "desktop" ]] && flags+=(--preset=desktop)
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx --yes lighthouse@latest "$url" --quiet \
  --chrome-flags="--headless=new" --output=json --output=html --output-path="reports/lighthouse/$name" ${flags[@]+"${flags[@]}"} >/dev/null 2>&1
python3 - "$name" <<'PY'
import json, sys
d = json.load(open(f"reports/lighthouse/{sys.argv[1]}.report.json"))
print(sys.argv[1], {k: round(v["score"] * 100) for k, v in d["categories"].items() if k != "agentic-browsing"})
a = d["audits"]
print("  " + " · ".join(f"{k}: {a[k]['displayValue']}" for k in ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"]))
PY
