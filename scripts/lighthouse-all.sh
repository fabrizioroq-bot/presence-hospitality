#!/usr/bin/env bash
# Lighthouse (mobile + desktop) on every page, EN + NL. Usage: scripts/lighthouse-all.sh <base>
base=${1:-http://localhost:3100}
for path in /en /nl /en/solution /nl/oplossing /en/packages /nl/pakketten /en/onboarding /nl/onboarding /en/faq /nl/faq /en/demo /nl/demo /en/privacy /nl/privacy /en/cookies /nl/cookies; do
  n=$(echo "$path" | sed 's|^/||; s|/|-|g')
  bash scripts/lighthouse.sh "final-$n-m" "$base$path" | head -1
  bash scripts/lighthouse.sh "final-$n-d" "$base$path" desktop | head -1
done
