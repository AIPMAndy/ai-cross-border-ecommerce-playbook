#!/usr/bin/env python3
"""Synchronize JSON content to the browser's static data module."""
from pathlib import Path
import argparse, json, sys
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument("--check",action="store_true")
args=parser.parse_args()
data={}
for name in ("chapters","cards","cases","plan"):
    data[name]=json.loads((ROOT/"data"/(name+".json")).read_text(encoding="utf-8"))
out="window.PLAYBOOK_DATA = "+json.dumps(data,ensure_ascii=False,separators=(",",":"))+";\n"
target=ROOT/"data/site-data.js"
if args.check:
    if json.loads(target.read_text(encoding="utf-8").split("=",1)[1].strip().rstrip(";")) != data:
        sys.exit("data/site-data.js content differs from JSON source")
    print("PASS: data/site-data.js matches JSON")
else:
    target.write_text(out,encoding="utf-8")
    print("Built data/site-data.js")
