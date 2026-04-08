'use client'

import Link from 'next/link'

interface Tool {
  href: string
  name: string
  nameEn: string
  icon: string
  description: string
  descriptionEn: string
  ready: boolean
}

const TOOLS: Tool[] = [
  {
    href: '/tools/abv',
    name: 'ABV 計算器',
    nameEn: 'ABV Calculator',
    icon: '🧮',
    description: '計算調酒的酒精濃度，支援多種調製方式與稀釋換算',
    descriptionEn: 'Calculate cocktail ABV with dilution methods',
    ready: true,
  },
  {
    href: '/tools/cost',
    name: '成本計算器',
    nameEn: 'Cost Calculator',
    icon: '💰',
    description: '計算每杯調酒的材料成本與定價建議',
    descriptionEn: 'Calculate ingredient cost per cocktail',
    ready: true,
  },
  {
    href: '/tools/convert',
    name: '單位換算',
    nameEn: 'Unit Converter',
    icon: '📐',
    description: '快速換算 ml、oz、cl、dash、tsp 等常見調酒單位',
    descriptionEn: 'Convert between common bar measurement units',
    ready: true,
  },
]

export default function ToolsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 py-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="font-display text-3xl sm:text-4xl text-gradient-amber">
          🛠️ 工具箱
        </h1>
        <p className="font-mono text-sm text-charcoal-500 tracking-wider mt-2">
          BARTENDER TOOLS — 調酒師實用工具
        </p>
      </div>

      {/* Tool Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
        {TOOLS.map(tool => (
          <div key={tool.href} className="relative">
            {tool.ready ? (
              <Link
                href={tool.href}
                className="glass-card p-6 block group hover:border-neon-amber/50 transition-colors duration-300"
              >
                <span className="text-3xl block mb-3">{tool.icon}</span>
                <h2 className="font-display text-lg text-text-warm group-hover:text-neon-amber transition-colors">
                  {tool.name}
                </h2>
                <p className="font-mono text-[10px] text-charcoal-500 tracking-wider mb-2">
                  {tool.nameEn}
                </p>
                <p className="font-mono text-xs text-charcoal-500 leading-relaxed">
                  {tool.description}
                </p>
                <span className="inline-block mt-3 font-mono text-[10px] text-neon-amber tracking-wider">
                  開啟 →
                </span>
              </Link>
            ) : (
              <div className="glass-card p-6 opacity-50 cursor-not-allowed">
                <span className="text-3xl block mb-3">{tool.icon}</span>
                <h2 className="font-display text-lg text-text-warm">
                  {tool.name}
                </h2>
                <p className="font-mono text-[10px] text-charcoal-500 tracking-wider mb-2">
                  {tool.nameEn}
                </p>
                <p className="font-mono text-xs text-charcoal-500 leading-relaxed">
                  {tool.description}
                </p>
                <span className="inline-block mt-3 font-mono text-[10px] text-charcoal-600 tracking-wider">
                  即將推出 COMING SOON
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
