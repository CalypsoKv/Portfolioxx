#!/usr/bin/env python3
"""Decode a Google Drive connector download (JSON with base64 `content`) into a binary file.

Usage: decode_drive_download.py <tool-result.json> <dest_dir> [expected_size]
Writes <dest_dir>/<title> and prints title, bytes, sha256.
"""
import base64, hashlib, json, os, sys

src, dest_dir = sys.argv[1], sys.argv[2]
expected = int(sys.argv[3]) if len(sys.argv) > 3 else None
with open(src) as fh:
    doc = json.load(fh)
data = base64.b64decode(doc["content"])
os.makedirs(dest_dir, exist_ok=True)
out = os.path.join(dest_dir, doc["title"])
with open(out, "wb") as fh:
    fh.write(data)
ok = "" if expected is None else ("OK" if expected == len(data) else f"SIZE MISMATCH (expected {expected})")
print(f"{doc['title']}\t{len(data)}\t{hashlib.sha256(data).hexdigest()[:16]}\t{doc['id']}\t{ok}")
