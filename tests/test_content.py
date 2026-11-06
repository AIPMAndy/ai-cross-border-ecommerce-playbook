import json, unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def load(x):return json.loads((R/"data"/(x+".json")).read_text(encoding="utf-8"))

class ContentTests(unittest.TestCase):
 def test_chapters_count(self):self.assertEqual(len(load("chapters")),24)
 def test_cards_count(self):self.assertEqual(len(load("cards")),96)
 def test_cases_count(self):self.assertEqual(len(load("cases")),25)
 def test_plan_count(self):self.assertEqual(len(load("plan")),30)
 def test_unique_cards(self):
  ids=[x["id"] for x in load("cards")]
  self.assertEqual(len(ids),len(set(ids)))
 def test_unique_cases(self):
  ids=[x["id"] for x in load("cases")]
  self.assertEqual(len(ids),len(set(ids)))
 def test_case_sources(self):
  for case in load("cases"):
   self.assertTrue(case["source_url"].startswith("https://"))
   self.assertTrue(case["evidence_note"])
 def test_day_sequence(self):
  self.assertEqual([x["day"] for x in load("plan")],list(range(1,31)))
