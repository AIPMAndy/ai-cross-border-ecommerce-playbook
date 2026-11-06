#!/usr/bin/env python3
"""Offline cross-border ecommerce unit economics (standard library only)."""
import json
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

def D(value):
    try:
        x = Decimal(str(value))
    except (InvalidOperation, ValueError) as e:
        raise ValueError("invalid number") from e
    if not x.is_finite():
        raise ValueError("nonfinite number")
    return x

def fmt(x):
    return str(x.quantize(Decimal("0.01")))

def quote(s):
    money = ("selling_price", "cogs", "outbound_shipping", "inbound_freight",
             "import_duties", "other_product_tax", "platform_fixed_fee",
             "payment_fixed_fee", "returns_handling_reserve", "chargeback_reserve",
             "fx_fee", "misc_variable", "cac", "target_contribution")
    rates = ("marketplace_fee_pct", "payment_fee_pct", "refund_loss_pct")
    required = money + rates
    missing = [x for x in required if x not in s]
    if missing:
        raise ValueError("missing fields: "+", ".join(missing))
    v = {k:D(s[k]) for k in required}
    if any(x < 0 for x in v.values()):
        raise ValueError("negative costs or rates not allowed")
    if any(v[k]>100 for k in rates):
        raise ValueError("rate must be at most 100")
    p=v["selling_price"]
    if p<=0:
        raise ValueError("selling price must be positive")
    fees=p*sum((v[k] for k in rates),Decimal(0))/100
    fixed_and_variable=sum((v[k] for k in money if k not in
                     ("selling_price","cac","target_contribution")),Decimal(0))
    before=p-fixed_and_variable-fees
    after=before-v["cac"]
    return {"selling_price":p,
            "variable_cost_before_ads":fixed_and_variable+fees,
            "contribution_before_ads":before,
            "cac":v["cac"],
            "contribution_after_ads":after,
            "maximum_cac_for_breakeven":before,
            "maximum_cac_for_target":before-v["target_contribution"],
            "break_even_roas":p/before if before>0 else None,
            "contribution_margin_pct":after*100/p,
            "warning":"NEGATIVE_BEFORE_ADS" if before<=0 else
                      "NEGATIVE_AFTER_ADS" if after<=0 else "POSITIVE_CONTRIBUTION"}

def cash_needed(s):
    fields=("units_first_batch","unit_cost_prepaid","inbound_logistics_total",
            "samples_and_photos","ad_budget","setup_fixed_fees","contingency_pct")
    missing=[x for x in fields if x not in s]
    if missing:
        raise ValueError("missing cash fields: "+", ".join(missing))
    v={k:D(s[k]) for k in fields}
    if any(x<0 for x in v.values()) or v["contingency_pct"]>100:
        raise ValueError("invalid cash inputs")
    base=(v["units_first_batch"]*v["unit_cost_prepaid"]+
          v["inbound_logistics_total"]+v["samples_and_photos"]+
          v["ad_budget"]+v["setup_fixed_fees"])
    return {"pre_sales_cash_base":base,
            "pre_sales_cash_with_buffer":base*(1+v["contingency_pct"]/100)}

def stress(s):
    p=D(s["selling_price"])
    freight=D(s["outbound_shipping"])
    cac=D(s["cac"])
    scenarios=[
      ("base",{}),
      ("price_minus_10pct",{"selling_price":str(p*D(".9"))}),
      ("shipping_plus_3",{"outbound_shipping":str(freight+D(3))}),
      ("cac_plus_5",{"cac":str(cac+D(5))}),
      ("combined",{"selling_price":str(p*D(".9")),
                   "outbound_shipping":str(freight+D(3)),
                   "cac":str(cac+D(5))})
    ]
    return [{"scenario":name,"after_ads":quote({**s,**change})["contribution_after_ads"],
             "status":quote({**s,**change})["warning"]} for name,change in scenarios]

def evaluate(payload):
    report={"unit":quote(payload["unit"]),"stress":stress(payload["unit"])}
    if "cash" in payload:
        report["cash"]=cash_needed(payload["cash"])
    return report

def jsonable(x):
    if isinstance(x,Decimal):
        return fmt(x)
    if isinstance(x,dict):
        return {k:jsonable(v) for k,v in x.items()}
    if isinstance(x,list):
        return [jsonable(v) for v in x]
    return x

if __name__=="__main__":
    if len(sys.argv)!=2:
        print("usage: python3 tools/unit_economics.py tools/sample-quote.json")
        sys.exit(2)
    payload=json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(json.dumps(jsonable(evaluate(payload)),ensure_ascii=False,indent=2))
