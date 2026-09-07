#!/usr/bin/env python3
"""
產生單位換算的前後端對照基準。

後端以 oz 為基準（backend/engine/balance_model.py 的 VOLUME_OZ），
前端以 ml 為基準（frontend/lib/units.ts 的 VOLUME_ML），
兩者描述的是同一套換算。若不同步，同一份配方在購物清單與
平衡分析中會得到不同用量，而且不會有任何錯誤訊息。

用法：python scripts/gen_unit_parity.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.engine.balance_model import OZ_TO_ML, to_oz  # noqa: E402

CASES = [
    (1, "oz"), (2, "oz"), (0.75, "oz"), (30, "ml"), (1, "cl"),
    (1, "tsp"), (1, "bsp"), (1, "dash"), (2, "dashes"),
    (1, "drop"), (3, "drops"), (10, "g"),
    (1, "OZ"), (1, " ml "), (2, None),
]

NON_VOLUME = ["whole", "leaves", "slice", "sprig", "顆", "wedges", "pinch"]


def build() -> dict:
    return {
        "_generated_by": "scripts/gen_unit_parity.py",
        "ozToMl": OZ_TO_ML,
        "volumes": [
            {"amount": a, "unit": u, "ml": round(to_oz(a, u) * OZ_TO_ML, 10)}
            for a, u in CASES
        ],
        "nonVolume": NON_VOLUME,
    }


def main() -> None:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(root, "tests", "fixtures", "unit_parity.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(build(), f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"已寫入 {out}")


if __name__ == "__main__":
    main()
