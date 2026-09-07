"""
由參考實作（Python qrcode 套件）產生 QR Code 的對照基準。

frontend/lib/qrcode.ts 是自行實作的編碼器。這份基準不是由它產生的，
而是來自另一個獨立實作，因此能真正抓出編碼錯誤——先前的
Reed-Solomon 生成多項式寫反，產生的碼看起來完全正常卻沒有任何
解碼器讀得出來，就是靠這種比對才發現。

產生後另以 OpenCV 的解碼器實際掃過一次，確認基準本身是可掃描的。
此腳本需要 qrcode 與 opencv，僅在調整編碼器時手動執行。
"""
import json
import sys

import cv2
import numpy as np
import qrcode
from qrcode.constants import ERROR_CORRECT_M

CASES = [
    "MixMaster",
    "http://localhost:6880/shared/abc123",
    "https://sid-en.github.io/Mix_Master_Sid/recipes/classic-daiquiri",
    "https://sid-en.github.io/Mix_Master_Sid/shared/_SdoMvAAI0S7p8VsrnlUpkxiZhCjAH6j",
    "中文網址測試 https://example.com/配方",
]


def matrix_for(text: str):
    q = qrcode.QRCode(error_correction=ERROR_CORRECT_M, box_size=1, border=0,
                      mask_pattern=0)
    q.add_data(text)
    q.make(fit=True)
    return q.version, [
        "".join("1" if cell else "0" for cell in row) for row in q.get_matrix()
    ]


def scannable(rows) -> bool:
    n = len(rows)
    margin, scale = 4, 8
    total = n + margin * 2
    img = np.full((total, total), 255, dtype=np.uint8)
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            if ch == "1":
                img[r + margin, c + margin] = 0
    big = cv2.resize(img, (total * scale, total * scale),
                     interpolation=cv2.INTER_NEAREST)
    decoded, _, _ = cv2.QRCodeDetector().detectAndDecode(big)
    return decoded


cases = []
for text in CASES:
    version, rows = matrix_for(text)
    decoded = scannable(rows)
    if decoded != text:
        print(f"基準本身掃不出來：{text!r} → {decoded!r}", file=sys.stderr)
        raise SystemExit(1)
    cases.append({"text": text, "version": version, "size": len(rows), "rows": rows})

payload = {
    "_generated_by": "scripts/gen_qr_reference.py（需 qrcode 與 opencv）",
    "_note": "錯誤更正等級 M、遮罩 0；每筆皆以 OpenCV 解碼器驗證可掃描",
    "cases": cases,
}
with open("tests/fixtures/qr_reference.json", "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)
    f.write("\n")
print(f"已寫入 {len(cases)} 筆基準，全部通過解碼驗證")
