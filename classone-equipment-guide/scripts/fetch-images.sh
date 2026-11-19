#!/usr/bin/env bash
# Downloads each device image from the clinic's equipment page (permission obtained)
# into assets/images/ and converts it to WebP when `cwebp` is installed.
# Usage (from the project root):  bash scripts/fetch-images.sh
set -euo pipefail

cd "$(dirname "$0")/.."
OUT="assets/images"
mkdir -p "$OUT"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to read data/devices.json" >&2
  exit 1
fi

python3 - <<'PY' > /tmp/classone_images.txt
import json
data = json.load(open("data/devices.json", encoding="utf-8"))
for d in data["devices"]:
    if d.get("imageSource"):
        print(d["id"], d["imageSource"])
PY

HAS_CWEBP=0
command -v cwebp >/dev/null 2>&1 && HAS_CWEBP=1

while read -r id url; do
  png="$OUT/$id.png"
  echo "Downloading $id"
  curl -fsSL "$url" -o "$png"
  if [ "$HAS_CWEBP" -eq 1 ]; then
    cwebp -quiet -q 82 -resize 800 0 "$png" -o "$OUT/$id.webp"
    rm -f "$png"
  fi
done < /tmp/classone_images.txt

if [ "$HAS_CWEBP" -eq 0 ]; then
  echo
  echo "cwebp not found: images were saved as PNG (the site uses them automatically)."
  echo "For smaller WebP files: brew install webp  and run this script again."
fi
echo "Done."
