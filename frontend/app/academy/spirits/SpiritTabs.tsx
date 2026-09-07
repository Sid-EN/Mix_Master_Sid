'use client'

import { useState, type ReactNode } from 'react'

interface TabDef {
  key: string
  zh: string
  en: string
  icon: string
}

interface SpiritTabsProps {
  tabs: TabDef[]
  panels: Record<string, ReactNode>
  defaultTab?: string
}

export default function SpiritTabs({ tabs, panels, defaultTab }: SpiritTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key ?? '')

  return (
    <>
      {/* Tab bar */}
      <section className="px-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-1 border-b border-charcoal-700 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 font-sans text-sm transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-neon-amber text-neon-amber'
                  : 'border-transparent text-charcoal-500 hover:text-text-secondary'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.zh}
              {/* 不再疊不透明度：會把已達 4.6:1 的顏色壓回不合格 */}
              <span className="font-mono text-xs ml-1.5">{tab.en}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Active panel */}
      <section className="px-6 pb-24 max-w-6xl mx-auto animate-fade-in" key={activeTab}>
        {/*
          每個分頁的內容各自從 h3 開始；沒有這個 h2，
          切到任一分頁時標題層級都會從 h1 直接跳到 h3。
        */}
        <h2 className="sr-only">烈酒章節</h2>
        {panels[activeTab] ?? (
          <p className="text-text-muted text-sm">此章節尚無內容。</p>
        )}
      </section>
    </>
  )
}
