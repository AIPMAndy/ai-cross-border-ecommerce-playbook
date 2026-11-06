import json, unittest, importlib.util
from pathlib import Path
from decimal import Decimal as D
R=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("ue",R/"tools/unit_economics.py")
ue=importlib.util.module_from_spec(spec);spec.loader.exec_module(ue)
p=json.loads((R/"tools/sample-quote.json").read_text(encoding="utf-8"))

class StressTests(unittest.TestCase):
 def test_pre_ads_positive(self):self.assertGreater(ue.quote(p["unit"])["contribution_before_ads"],0)
 def test_combined_more_negative(self):
  s=ue.stress(p["unit"])
  self.assertLess(s[-1]["after_ads"],s[0]["after_ads"])
 def test_cash_buffer_increases_cost(self):
  v=ue.cash_needed(p["cash"])
  self.assertGreater(v["pre_sales_cash_with_buffer"],v["pre_sales_cash_base"])
 def test_negative_before_ads_warning(self):
  q=ue.quote({**p["unit"],"cogs":100})
  self.assertEqual(q["warning"],"NEGATIVE_BEFORE_ADS")
 def test_negative_after_ads_warning(self):
  q=ue.quote({**p["unit"],"cac":50})
  self.assertEqual(q["warning"],"NEGATIVE_AFTER_ADS")
 def test_rate_cap(self):
  with self.assertRaises(ValueError):ue.quote({**p["unit"],"payment_fee_pct":101})
