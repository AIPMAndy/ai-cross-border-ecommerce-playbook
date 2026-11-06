# AI Cross-Border Ecommerce Playbook · V2.0

**A free, open-source, evidence-first Chinese handbook and interactive website.** Rather than promising an "AI one-click store", the project walks through seller eligibility, real buyer demand, supplier quotes, product safety, checkout, logistics, order contribution and cash requirements.

**24 chapters · 96 action cards · 25 linked real-world cases · 12 detailed walkthroughs · 30-day plan · 16 AI prompts.**

Start with [7-day quickstart](START-HERE.md), [interactive advisor](index.html#advisor), [profit & scenario calculator](index.html#calculator), [pre-sale cash estimator](index.html#cashflow), or [first-order dry run](examples/first-order-dry-run.md). All teaching money inputs and dry-run transactions are **synthetic assumptions**, not seller financial results.

The cases differentiate clearly between AI-used promotional case studies, business model stories where AI usage has **not** been established, and first-person failure accounts. Inspect the [case evidence ledger](research/case-evidence-ledger.csv) before quoting results.

**Key policy differences:** mainland China new Etsy shops are currently unavailable; Shopify Payments China is invitation-only early access; US de minimis duty-free treatment for covered low-value imports was suspended from August 29, 2025. See [official references and verification dates](research/policy-watch.md).

## Local use

```bash
python3 -m http.server 8000
# Open http://localhost:8000
python3 tools/unit_economics.py tools/sample-quote.json
python3 scripts/check.py
python3 -m unittest discover -s tests -v
```

`offline.html` bundles the site CSS, JS and data into a single file. Some linked source material still needs internet or the full repository. Content and code are licensed separately (CC BY 4.0 / MIT).

**Author:** AI 酋长 Andy — [GitHub](https://github.com/AIPMAndy) · [Website](https://metaver.vip/). Remote repository publication is not implied by having a local ZIP. Consult [PUBLISH.md](PUBLISH.md).

## Contact the author

AI Chief Andy · WeChat: `AIPMAndy` · Personal website: https://metaver.vip/ · [Website contact section](https://aipmandy.github.io/ai-cross-border-ecommerce-playbook/#contact)
