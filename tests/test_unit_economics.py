import json, unittest, importlib.util
from pathlib import Path
from decimal import Decimal as D
R=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("economics",R/"tools/unit_economics.py")
econ=importlib.util.module_from_spec(spec);spec.loader.exec_module(econ)
data=json.loads((R/"tools/sample-quote.json").read_text(encoding="utf-8"))

class UnitEconomics(unittest.TestCase):
 def test_baseline_contribution(self):
  self.assertEqual(econ.quote(data["unit"])["contribution_after_ads"].quantize(D(".01")),D("4.38"))
 def test_ad_stress(self):
  s={**data["unit"],"cac":12}
  self.assertEqual(econ.quote(s)["contribution_after_ads"].quantize(D(".01")),D("-0.62"))
 def test_cash_needed(self):
  self.assertEqual(econ.cash_needed(data["cash"])["pre_sales_cash_with_buffer"].quantize(D(".01")),D("669.90"))
 def test_price_required(self):
  with self.assertRaises(ValueError):econ.quote({**data["unit"],"selling_price":0})
 def test_no_negative_cac(self):
  with self.assertRaises(ValueError):econ.quote({**data["unit"],"cac":-1})
 def test_no_nonnumeric(self):
  with self.assertRaises(ValueError):econ.quote({**data["unit"],"cac":"invalid"})
 def test_stress_five_scenarios(self):
  self.assertEqual(len(econ.stress(data["unit"])),5)
 def test_json_conversion(self):
  self.assertEqual(econ.jsonable({"v":D("2.5")}),{"v":"2.50"})
