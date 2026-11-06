#!/usr/bin/env python3
"""Check site, source counts and referenced local files. Offline; no web calls."""
from pathlib import Path
import json, re, csv, sys

ROOT=Path(__file__).resolve().parents[1]
errors=[]
def check(ok,msg):
    if not ok: errors.append(msg)

data={}
for name,expected in (("chapters",24),("cards",96),("cases",25),("plan",30)):
    path=ROOT/"data"/(name+".json")
    check(path.is_file(),"missing data/"+name+".json")
    if path.is_file():
        try:
            data[name]=json.loads(path.read_text(encoding="utf-8"))
            check(len(data[name])==expected,f"{name}: expected {expected}, got {len(data[name])}")
        except (ValueError, OSError) as ex: errors.append(f"bad {name}: {ex}")

for c in data.get("cards",[]):
    for key in ("id","title","steps","deliverable","template","deep_dive"):
        check(bool(c.get(key)),f"{c.get('id')}: missing {key}")
    for link in (c.get("template",""),c.get("deep_dive","")):
        local=link.split("#",1)[0]
        check(bool(local) and (ROOT/local).is_file(),f"missing card link: {link}")
for ch in data.get("chapters",[]):
    check((ROOT/ch.get("file","missing.md")).is_file(),"missing chapter "+ch.get("id","?"))
for case in data.get("cases",[]):
    check(case.get("source_url","").startswith("https://"),"missing source for "+case.get("id","?"))
    check(bool(case.get("evidence_note")),"missing evidence boundary for "+case.get("id","?"))

expected=["index.html","offline.html","assets/style.css","assets/app.js",
          "data/site-data.js","tools/unit_economics.py",
          "templates/action-cards.csv","templates/30-day-plan.csv",
          "research/case-evidence-ledger.csv","research/red-team.md",
          ".github/workflows/ci.yml",".github/workflows/pages.yml"]
for f in expected: check((ROOT/f).is_file(),"required file absent: "+f)

for path in [ROOT/"README.md", *sorted((ROOT/"chapters").glob("*.md")),
             *sorted((ROOT/"playbooks").glob("*.md")),
             *sorted((ROOT/"examples").glob("*.md"))]:
    text=path.read_text(encoding="utf-8")
    for match in re.finditer(r'(?<!!)\[[^\]]+\]\(([^)]+)\)', text):
        url=match.group(1).strip().split("#",1)[0]
        if not url or url.startswith(("https://","http://","mailto:")):continue
        check((path.parent/url).exists(),f"broken link {path.relative_to(ROOT)} -> {url}")

if errors:
    print("FAIL: "+str(len(errors))+" project checks")
    for x in errors:print(" - "+x)
    sys.exit(1)
print(f"PASS: {len(data['chapters'])} chapters, {len(data['cards'])} cards, {len(data['cases'])} cases, {len(data['plan'])} tasks; links and core files checked")
