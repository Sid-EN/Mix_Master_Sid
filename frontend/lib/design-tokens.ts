/**
 * design-tokens.ts — MixMaster 設計 Token
 * 與 tailwind.config.ts 保持同步
 */

export const COLORS = {
  bg: {
    primary:   '#0A0A0F',
    secondary: '#111118',
    tertiary:  '#1A1A25',
    overlay:   '#0D0D14',
  },
  neon: {
    amber:     '#F5A623',
    amberDim:  '#C47D0E',
    cyan:      '#00FFFF',
    cyanDim:   '#00BFBF',
    purple:    '#9B59B6',
  },
  midnight: {
    deep:  '#0D1B2A',
    mid:   '#1B2A3B',
    light: '#2C4A6E',
  },
  charcoal: {
    900: '#141414',
    800: '#1F1F2E',
    700: '#2D2D3E',
    600: '#3D3D50',
    500: '#6B6B80',
    400: '#9B9BAE',
  },
  text: {
    primary:   '#F0EDE4',
    secondary: '#B8B0A0',
    muted:     '#6B6358',
    accent:    '#F5A623',
  },
  flavor: {
    citrus:   '#FFD700',
    tropical: '#FF8C00',
    berry:    '#DC143C',
    herbal:   '#228B22',
    smoky:    '#696969',
    floral:   '#DDA0DD',
    caramel:  '#C27820',
    vanilla:  '#F5DEB3',
    spicy:    '#B22222',
    earthy:   '#8B4513',
    nutty:    '#D2691E',
    bitter:   '#4B0082',
    oak:      '#8B6914',
    citrus2:  '#90EE90',
    umami:    '#556B2F',
  },
  grade: {
    A: '#2ECC71',
    B: '#F39C12',
    C: '#E67E22',
    D: '#E74C3C',
  },
  rarity: {
    common:   '#9B9BAE',
    uncommon: '#2ECC71',
    rare:     '#3498DB',
    exotic:   '#9B59B6',
  },
} as const

export const FONT_FAMILY = {
  display: "'Playfair Display', 'Noto Serif TC', Georgia, serif",
  sans:    "'Inter', 'Noto Sans TC', -apple-system, sans-serif",
  mono:    "'Fira Code', 'Cascadia Code', monospace",
} as const

export const GRADE_LABELS: Record<string, { zh: string; en: string; color: string }> = {
  A: { zh: '極致平衡',   en: 'Perfect Balance',  color: COLORS.grade.A },
  B: { zh: '良好平衡',   en: 'Good Balance',     color: COLORS.grade.B },
  C: { zh: '尚可飲用',   en: 'Acceptable',       color: COLORS.grade.C },
  D: { zh: '需要調整',   en: 'Needs Adjustment', color: COLORS.grade.D },
}

export const METHOD_LABELS: Record<string, { zh: string; icon: string }> = {
  shake: { zh: '搖盪法',   icon: '🧊' },
  stir:  { zh: '攪拌法',   icon: '🥄' },
  build: { zh: '直調法',   icon: '🥃' },
  roll:  { zh: '滾動法',   icon: '🌀' },
  throw: { zh: '拋接法',   icon: '✨' },
}

export const CATEGORY_LABELS: Record<string, { zh: string; color: string }> = {
  base_spirit:    { zh: '基酒',    color: '#F5A623' },
  liqueur:        { zh: '利口酒',  color: '#9B59B6' },
  fortified_wine: { zh: '強化酒',  color: '#8B4513' },
  wine:           { zh: '葡萄酒',  color: '#DC143C' },
  mixer:          { zh: '混合飲',  color: '#3498DB' },
  juice:          { zh: '果汁',    color: '#2ECC71' },
  syrup:          { zh: '糖漿',    color: '#FFD700' },
  bitter:         { zh: '苦精',    color: '#4B0082' },
  fresh:          { zh: '新鮮食材', color: '#228B22' },
  dairy:          { zh: '乳製品',  color: '#F5DEB3' },
  egg:            { zh: '蛋製品',  color: '#FFF9C4' },
  beer:           { zh: '啤酒',    color: '#C27820' },
  garnish:        { zh: '裝飾',    color: '#DDA0DD' },
}
