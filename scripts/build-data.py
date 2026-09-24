"""Les CSV-ene i data/ og skriv site/data.js (window.DATA = {...}).

Kjøres bare når tallene i data/ endres:  python scripts/build-data.py
Siden selv trenger ingen server eller byggesteg.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = ROOT / "site" / "data.js"


def num(v):
    if v is None or v == "":
        return None
    try:
        f = float(v)
    except ValueError:
        return v
    return int(f) if f.is_integer() and "." not in v else f


def read(name):
    with open(DATA / name, encoding="utf-8") as fh:
        return [{k: num(v) if k not in ("county_code", "period", "group") else v
                 for k, v in row.items()} for row in csv.DictReader(fh)]


data = {
    "fundFacts": {r["fact_id"]: r for r in read("evergreen-fund-facts.csv")},
    "references": read("evergreen-real-estate-fund.csv"),
    "pop80": read("norway-population-80plus.csv"),
    "ageStructure": read("norway-age-structure.csv"),
    "support": read("norway-old-age-support.csv"),
    "care": read("norway-care-capacity.csv"),
    "counties": read("norway-80plus-by-county.csv"),
    "dementia": read("norway-dementia.csv"),
    "cpi": read("norway-cpi.csv"),
    "yields": read("yield-context.csv"),
}

OUT.write_text(
    "/* Generert av scripts/build-data.py fra data/*.csv. Ikke rediger for hånd. */\n"
    "window.DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8",
)
print(f"Skrev {OUT.relative_to(ROOT)}")
