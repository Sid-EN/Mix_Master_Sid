#!/usr/bin/env python3
"""
檢查文字色階是否符合 WCAG AA。

顏色定義在 frontend/styles/globals.css。調整任何文字色前後都應執行此腳本：
對比不足不會讓畫面看起來有問題，只有機器（或看不清楚的人）才發現得了。

一般文字需 4.5:1，大字（18pt 以上或 14pt 粗體）需 3:1。
本專案大量使用 10–11px 的等寬小字，一律以 4.5:1 為準。

用法：python scripts/check_contrast.py
"""
import os
import re
import sys

CSS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "frontend", "styles", "globals.css")

# 這些色階用於文字，必須達標
TEXT_TOKENS = [
    "charcoal-600", "charcoal-500", "charcoal-400", "charcoal-300",
    "text-muted", "text-secondary", "text-warm",
    "neon-amber", "neon-cyan", "neon-purple",
]
BACKGROUND_TOKENS = ["bg-primary", "bg-secondary", "bg-tertiary"]
THRESHOLD = 4.5


def luminance(colour: str) -> float:
    c = colour.lstrip("#")
    channels = []
    for i in (0, 2, 4):
        v = int(c[i:i + 2], 16) / 255
        channels.append(v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4)
    r, g, b = channels
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def parse_themes(text: str) -> dict[str, dict[str, str]]:
    """
    取出兩套主題的色彩變數。

    深色為 html[data-theme="dark"] 與 html:not([data-theme])，
    淺色為 html[data-theme="light"]。
    """
    themes: dict[str, dict[str, str]] = {"深色": {}, "淺色": {}}
    for selectors, body in re.findall(r"((?:html[^{;]*,?\s*)+)\{([^}]*)\}", text):
        if "--color-" not in body:
            continue
        name = "淺色" if 'data-theme="light"' in selectors else "深色"
        for token, value in re.findall(r"--color-([\w-]+):\s*(#[0-9A-Fa-f]{6})", body):
            themes[name].setdefault(token, value)
    return themes


def main() -> int:
    with open(CSS, encoding="utf-8") as f:
        themes = parse_themes(f.read())

    # 解析不到色彩就是腳本失效；不能安靜地回報通過
    if not any(themes.values()):
        print(f"無法從 {CSS} 解析出色彩變數，請檢查此腳本的解析規則", file=sys.stderr)
        return 2

    failures = []
    for theme, tokens in themes.items():
        backgrounds = {b: tokens[b] for b in BACKGROUND_TOKENS if b in tokens}
        if not backgrounds:
            continue
        print(f"\n── {theme}主題 ──")
        for name in TEXT_TOKENS:
            if name not in tokens:
                continue
            ratios = {bg: contrast(tokens[name], colour) for bg, colour in backgrounds.items()}
            worst_bg = min(ratios, key=lambda k: ratios[k])
            worst = ratios[worst_bg]
            status = "OK" if worst >= THRESHOLD else "不足"
            print(f"  {name:<16}{tokens[name]}  最低 {worst:5.2f}（對 {worst_bg}）  {status}")
            if worst < THRESHOLD:
                failures.append((theme, name, tokens[name], worst_bg, worst))

    if failures:
        print(f"\n{len(failures)} 項未達 WCAG AA（{THRESHOLD}:1）：")
        for theme, name, colour, bg, ratio in failures:
            print(f"  {theme}主題 {name} {colour} 對 {bg} 僅 {ratio:.2f}")
        return 1
    print(f"\n全部文字色階皆達 WCAG AA（{THRESHOLD}:1）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
