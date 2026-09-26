"""Set KEY=VALUE pairs in .env.local without printing values. Usage: python3 scripts/env-set.py KEY [KEY...] < values (one per line)."""
import re, sys
keys = sys.argv[1:]
vals = [l.rstrip("\n") for l in sys.stdin.readlines()]
assert len(vals) == len(keys), "value count mismatch"
path = ".env.local"
lines = open(path).read().splitlines()
for k, v in zip(keys, vals):
    for i, l in enumerate(lines):
        if re.match(rf"^{k}=", l):
            lines[i] = f"{k}={v}"
            break
    else:
        lines.append(f"{k}={v}")
open(path, "w").write("\n".join(lines) + "\n")
print("updated:", ", ".join(keys))
