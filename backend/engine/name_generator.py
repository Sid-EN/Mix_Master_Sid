"""
name_generator.py
─────────────────
配方自動命名器 (Auto Recipe Namer)

命名策略：
  前綴 ← 主導風味決定
  後綴 ← 平衡分數決定（高分→詩意系 / 低分→標準系）
"""

from __future__ import annotations

import random

# 風味 → 前綴詞語料庫
PREFIX_CORPUS: dict[str, list[str]] = {
    "smoky":       ["Midnight", "Shadow", "Phantom", "Dark", "Eclipse"],
    "tropical":    ["Havana", "Paradise", "Soleil", "Isla", "Tropic"],
    "herbal":      ["Alpine", "Botanist", "Verdant", "Forest", "Garden"],
    "citrus":      ["Sunrise", "Golden", "Zest", "Bright", "Citadel"],
    "berry":       ["Crimson", "Scarlet", "Ruby", "Velvet", "Dusk"],
    "vanilla":     ["Ivory", "Silk", "Cream", "Whisper", "Lace"],
    "caramel":     ["Amber", "Ember", "Bronze", "Harvest", "Toffee"],
    "oak":         ["Reserve", "Heritage", "Legacy", "Barrel", "Vault"],
    "floral":      ["Bloom", "Petal", "Blossom", "Celestial", "Elysian"],
    "spicy":       ["Blaze", "Inferno", "Firebrand", "Pepper", "Agave"],
    "nutty":       ["Hazel", "Walnut", "Chestnut", "Almond", "Praline"],
    "stone_fruit": ["Peach", "Apricot", "Nectarine", "Plum", "Solstice"],
    "earthy":      ["Terra", "Root", "Mossy", "Peat", "Stone"],
    "umami":       ["Depth", "Aged", "Savant", "Umami", "Essence"],
    "bitter":      ["Negroni", "Amaro", "Botanica", "Tonic", "Elixir"],
}

# 後綴語料庫
STANDARD_SUFFIXES: list[str] = [
    "Sour", "Fizz", "Smash", "Fix", "Collins",
    "Mule", "Daisy", "Cobbler", "Swizzle", "Highball",
    "Buck", "Bramble", "Julep", "Flip", "Spritz",
]

POETIC_SUFFIXES: list[str] = [
    "Reserve", "Signature", "Chapter", "Edition",
    "Project", "No.1", "Special", "Creation", "Opus",
]

# 中文前綴對照
PREFIX_ZH: dict[str, str] = {
    "Midnight": "午夜",   "Shadow": "暗影",    "Phantom": "幻影",
    "Dark": "暗黑",       "Eclipse": "日蝕",
    "Havana": "哈瓦那",   "Paradise": "天堂",  "Soleil": "陽光",
    "Isla": "島嶼",       "Tropic": "熱帶",
    "Alpine": "高山",     "Botanist": "植物學家", "Verdant": "翠綠",
    "Forest": "森林",     "Garden": "花園",
    "Sunrise": "日出",    "Golden": "黃金",    "Zest": "活力",
    "Bright": "明亮",     "Citadel": "堡壘",
    "Crimson": "深紅",    "Scarlet": "緋紅",   "Ruby": "紅寶石",
    "Velvet": "絲絨",     "Dusk": "黃昏",
    "Ivory": "象牙",      "Silk": "絲綢",      "Cream": "奶油",
    "Whisper": "細語",    "Lace": "蕾絲",
    "Amber": "琥珀",      "Ember": "餘燼",     "Bronze": "青銅",
    "Harvest": "豐收",    "Toffee": "太妃",
    "Reserve": "珍藏",    "Heritage": "傳承",  "Legacy": "遺產",
    "Barrel": "橡木桶",   "Vault": "穹頂",
    "Bloom": "盛開",      "Petal": "花瓣",     "Blossom": "花開",
    "Celestial": "天際",  "Elysian": "極樂",
    "Blaze": "火焰",      "Inferno": "烈焰",   "Firebrand": "火炬",
    "Pepper": "辛辣",     "Agave": "龍舌蘭",
    "Hazel": "榛果",      "Walnut": "核桃",    "Chestnut": "栗子",
    "Almond": "杏仁",     "Praline": "果仁糖",
    "Peach": "蜜桃",      "Apricot": "杏桃",   "Plum": "李子",
    "Terra": "大地",      "Root": "根莖",      "Peat": "泥煤",
    "Depth": "深邃",      "Aged": "陳釀",
    "Negroni": "尼格羅尼", "Amaro": "阿瑪羅",  "Elixir": "靈藥",
}

SUFFIX_ZH: dict[str, str] = {
    "Sour": "酸酒",       "Fizz": "氣泡",      "Smash": "搗碎",
    "Fix": "修復",        "Collins": "可林",   "Mule": "騾子",
    "Daisy": "黛西",      "Cobbler": "修補",   "Swizzle": "攪棒",
    "Highball": "高球",   "Buck": "巴克",      "Bramble": "荊棘",
    "Julep": "朱利普",    "Flip": "翻轉",      "Spritz": "氣泡輕飲",
    "Reserve": "珍藏",    "Signature": "簽名", "Chapter": "篇章",
    "Edition": "版本",    "Project": "計畫",   "No.1": "一號",
    "Special": "特調",    "Creation": "創作",  "Opus": "鉅作",
}


def generate_recipe_name(
    primary_flavors: list[str],
    balance_score: float,
    seed: int | None = None,
) -> dict[str, str]:
    """
    根據風味特徵與平衡分數自動生成配方名稱（中英雙語）。

    Args:
        primary_flavors: 主導風味列表（如 ["herbal", "citrus"]）
        balance_score:   平衡分數 0–100
        seed:            隨機種子（用於可重現性）

    Returns:
        {"en": "Alpine Signature", "zh": "高山簽名"}

    Examples:
        >>> generate_recipe_name(["smoky", "vanilla"], 92)
        {'en': 'Midnight Reserve', 'zh': '午夜珍藏'}
    """
    if seed is not None:
        random.seed(seed)

    # 選擇前綴
    prefix_en = "Mystery"
    for flavor in primary_flavors:
        if flavor in PREFIX_CORPUS:
            prefix_en = random.choice(PREFIX_CORPUS[flavor])
            break

    # 選擇後綴（依平衡分數決定詩意 vs 標準）
    if balance_score >= 85:
        suffix_en = random.choice(POETIC_SUFFIXES)
    else:
        suffix_en = random.choice(STANDARD_SUFFIXES)

    # 組合中文
    prefix_zh = PREFIX_ZH.get(prefix_en, prefix_en)
    suffix_zh = SUFFIX_ZH.get(suffix_en, suffix_en)

    return {
        "en": f"{prefix_en} {suffix_en}",
        "zh": f"{prefix_zh}{suffix_zh}",
    }
