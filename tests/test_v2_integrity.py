import json, unittest, subprocess, sys
from pathlib import Path
R=Path(__file__).resolve().parents[1]

class IntegrityTests(unittest.TestCase):
 def test_web_sources(self):
  x=json.loads((R/"data/cases.json").read_text(encoding="utf-8"))
  self.assertTrue(all(c.get("checked_on") for c in x))
 def test_12_playbooks(self):
  self.assertEqual(len(list((R/"playbooks").glob("*.md"))),12)
 def test_24_chapters(self):
  self.assertEqual(len(list((R/"chapters").glob("*.md"))),24)
 def test_prompts_file(self):
  s=(R/"templates/prompts.md").read_text(encoding="utf-8")
  self.assertIn("16 套",s)
 def test_readme_links(self):
  s=(R/"README.md").read_text(encoding="utf-8")
  self.assertIn("https://metaver.vip/",s)
 def test_offline_bundle(self):
  s=(R/"offline.html").read_text(encoding="utf-8")
  self.assertIn("window.PLAYBOOK_DATA",s)
  self.assertIn("function",s)
 def test_build_data_check(self):
  p=subprocess.run([sys.executable,str(R/"scripts/build_content.py"),"--check"],
                   capture_output=True,text=True,cwd=R)
  self.assertEqual(p.returncode,0,p.stdout+p.stderr)
 def test_project_check(self):
  p=subprocess.run([sys.executable,str(R/"scripts/check.py")],
                   capture_output=True,text=True,cwd=R)
  self.assertEqual(p.returncode,0,p.stdout+p.stderr)
