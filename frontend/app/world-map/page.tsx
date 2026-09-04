'use client';

import Link from 'next/link'
import { useState, useMemo } from 'react';
import { regions, type Region } from '@/lib/regionData';

type FilterType = 'all' | 'spirit' | 'wine';

/* ── simplified continent SVG paths (percentage-based viewBox 0-100) ── */
const continentPaths = [
  // North America
  'M 5,18 L 8,15 12,14 15,12 18,13 22,11 26,12 28,16 27,20 25,22 26,28 28,32 27,36 26,38 24,42 22,44 18,44 15,42 12,40 10,38 8,36 5,32 4,28 3,24 4,20 Z',
  // South America
  'M 22,48 L 25,46 28,47 32,50 34,54 33,58 32,62 30,66 28,70 26,74 24,76 22,74 21,70 22,66 23,62 24,58 23,54 22,50 Z',
  // Europe
  'M 42,16 L 44,14 47,13 50,14 53,16 54,18 52,20 50,22 52,24 50,26 48,28 46,30 44,32 42,34 40,32 38,30 40,28 42,26 41,22 40,20 41,18 Z',
  // Africa
  'M 42,36 L 44,34 48,34 52,36 54,38 56,42 57,46 56,50 55,54 54,58 52,62 50,66 48,68 46,70 44,68 42,64 41,60 40,56 39,52 38,48 39,44 40,40 Z',
  // Asia
  'M 54,14 L 58,12 62,11 66,12 70,14 74,16 78,18 82,20 85,22 86,26 84,30 82,32 80,34 78,36 74,38 70,40 66,42 62,40 58,38 56,36 54,34 52,30 53,26 54,22 55,18 Z',
  // Australia
  'M 74,56 L 78,54 82,55 85,58 86,62 84,66 82,68 78,70 74,68 72,64 72,60 73,58 Z',
  // SE Asia Islands
  'M 76,42 L 78,40 80,41 82,44 84,46 82,48 80,50 78,48 76,46 Z',
];

function getMarkerColor(type: Region['specialties']['type']): string {
  if (type === 'spirit') return '#F5A623';
  if (type === 'wine') return '#00FFFF';
  return '#A855F7';
}

function getTypeLabel(type: Region['specialties']['type']): string {
  if (type === 'spirit') return '🥃 烈酒';
  if (type === 'wine') return '🍷 葡萄酒';
  return '🥃🍷 烈酒與葡萄酒';
}

/* ── Detail Panel ── */
function DetailPanel({
  region,
  onClose,
}: {
  region: Region;
  onClose: () => void;
}) {
  const color = getMarkerColor(region.specialties.type);

  return (
    <div className="glass-card p-6 md:p-8 animate-fade-in-up overflow-y-auto max-h-[70vh] md:max-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p
            className="font-mono text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color }}
          >
            {region.countryZh} {region.country}
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-text-warm mb-1">
            {region.icon} {region.nameZh}
          </h2>
          <p className="font-mono text-sm text-charcoal-500">
            {region.nameEn}
          </p>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-xs px-3 py-1.5 border border-charcoal-700 text-text-secondary hover:border-neon-amber hover:text-neon-amber transition-colors shrink-0 ml-4"
        >
          ← 返回地圖
        </button>
      </div>

      <div className="divider-amber mb-6" />

      {/* Type badge */}
      <span
        className="inline-block font-mono text-xs px-3 py-1 mb-6 border"
        style={{ borderColor: color, color }}
      >
        {getTypeLabel(region.specialties.type)}
      </span>

      {/* Climate & Terroir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-bg-tertiary border border-charcoal-700 p-4">
          <p className="font-mono text-[11px] text-neon-cyan tracking-[0.2em] uppercase mb-2">
            Climate 氣候
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            {region.climate}
          </p>
        </div>
        <div className="bg-bg-tertiary border border-charcoal-700 p-4">
          <p className="font-mono text-[11px] text-neon-amber tracking-[0.2em] uppercase mb-2">
            Terroir 風土
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            {region.terroir}
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="space-y-6 mb-6">
        {region.specialties.products.map((product, i) => (
          <div
            key={i}
            className="bg-bg-tertiary border border-charcoal-700 p-5"
          >
            <h3 className="font-display text-xl text-neon-amber mb-1">
              {product.nameZh}
            </h3>
            <p className="font-mono text-xs text-charcoal-500 mb-3">
              {product.nameEn}
            </p>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Characteristics */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.characteristics.map((c) => (
                <span
                  key={c}
                  className="font-mono text-[11px] px-2.5 py-1 border border-charcoal-600 text-text-secondary"
                >
                  {c}
                </span>
              ))}
            </div>

            {/* Famous examples */}
            <p className="font-mono text-[11px] text-charcoal-500 tracking-[0.15em] uppercase mb-1.5">
              知名品牌
            </p>
            <p className="text-text-secondary text-sm">
              {product.famousExamples.join(' · ')}
            </p>
          </div>
        ))}
      </div>

      {/* Fun fact */}
      <div
        className="border-l-2 pl-4 py-3"
        style={{ borderColor: color }}
      >
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color }}>
          🎲 Fun Fact 趣聞
        </p>
        <p className="text-text-secondary text-sm leading-relaxed italic">
          {region.funFact}
        </p>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function WorldMapPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredRegions = useMemo(
    () =>
      regions.filter((r) => {
        if (filter === 'all') return true;
        return r.specialties.type === filter || r.specialties.type === 'both';
      }),
    [filter],
  );

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'spirit', label: '🥃 烈酒' },
    { value: 'wine', label: '🍷 葡萄酒' },
  ];

  return (
    <main className="min-h-screen px-4 md:px-6 py-12 max-w-7xl mx-auto">
      {/* Back link */}
      <Link href="/"
        className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
      >
        ← 返回首頁
      </Link>

      {/* Header */}
      <div className="mt-8 mb-8">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
          World Spirits &amp; Wine Map
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
          🗺️ 產地互動地圖
        </h1>
        <p className="text-text-secondary">
          探索世界各地的釀造傳統與產區風土
          <span className="text-neon-amber font-mono text-sm ml-2">
            ({regions.length} 產區)
          </span>
        </p>
        <div className="divider-amber mt-6" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`font-mono text-xs px-4 py-2 border transition-all duration-300 ${
              filter === f.value
                ? 'border-neon-amber text-neon-amber bg-neon-amber/10 shadow-neon-amber'
                : 'border-charcoal-700 text-text-secondary hover:border-charcoal-500 hover:text-text-warm'
            }`}
          >
            {f.label}
          </button>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto font-mono text-[11px] text-charcoal-500">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#F5A623' }}
            />
            烈酒
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#00FFFF' }}
            />
            葡萄酒
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#A855F7' }}
            />
            兩者
          </span>
        </div>
      </div>

      {/* Layout: Map + Detail */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map container */}
        <div
          className={`relative transition-all duration-500 ${
            selectedRegion ? 'lg:w-[55%]' : 'w-full'
          }`}
        >
          <div className="glass-card p-2 md:p-4 relative overflow-hidden">
            {/* SVG Map */}
            <svg
              viewBox="0 0 100 85"
              className="w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Glow filters */}
                <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                  <feFlood floodColor="#F5A623" floodOpacity="0.7" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                  <feFlood floodColor="#00FFFF" floodOpacity="0.7" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                  <feFlood floodColor="#A855F7" floodOpacity="0.7" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Pulse gradients */}
                <radialGradient id="pulse-amber">
                  <stop offset="0%" stopColor="#F5A623" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulse-cyan">
                  <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulse-purple">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Continent outlines */}
              {continentPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="rgba(55,55,75,0.3)"
                  stroke="rgba(100,100,120,0.5)"
                  strokeWidth="0.3"
                />
              ))}

              {/* Region markers */}
              {filteredRegions.map((region) => {
                const color = getMarkerColor(region.specialties.type);
                const isSelected = selectedRegion?.id === region.id;
                const isHovered = hoveredRegion?.id === region.id;
                const glowFilter =
                  region.specialties.type === 'spirit'
                    ? 'url(#glow-amber)'
                    : region.specialties.type === 'wine'
                      ? 'url(#glow-cyan)'
                      : 'url(#glow-purple)';
                const pulseGrad =
                  region.specialties.type === 'spirit'
                    ? 'url(#pulse-amber)'
                    : region.specialties.type === 'wine'
                      ? 'url(#pulse-cyan)'
                      : 'url(#pulse-purple)';

                return (
                  <g
                    key={region.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedRegion(region)}
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  >
                    {/* Pulse ring */}
                    <circle
                      cx={region.coordinates.x}
                      cy={region.coordinates.y}
                      r={isSelected ? 2.8 : 2}
                      fill={pulseGrad}
                      opacity={0.6}
                    >
                      <animate
                        attributeName="r"
                        values={isSelected ? '2;4;2' : '1.5;3;1.5'}
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0;0.6"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Main dot */}
                    <circle
                      cx={region.coordinates.x}
                      cy={region.coordinates.y}
                      r={isSelected ? 1.3 : isHovered ? 1.1 : 0.8}
                      fill={color}
                      filter={glowFilter}
                    />

                    {/* Selected ring */}
                    {isSelected && (
                      <circle
                        cx={region.coordinates.x}
                        cy={region.coordinates.y}
                        r={2}
                        fill="none"
                        stroke={color}
                        strokeWidth="0.25"
                        strokeDasharray="0.8 0.4"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from={`0 ${region.coordinates.x} ${region.coordinates.y}`}
                          to={`360 ${region.coordinates.x} ${region.coordinates.y}`}
                          dur="8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Tooltip on hover */}
                    {(isHovered || isSelected) && (
                      <g>
                        <rect
                          x={region.coordinates.x + 1.5}
                          y={region.coordinates.y - 3.5}
                          width={region.nameEn.length * 0.55 + 3}
                          height={4}
                          rx={0.3}
                          fill="rgba(10,10,15,0.92)"
                          stroke={color}
                          strokeWidth="0.15"
                        />
                        <text
                          x={region.coordinates.x + 2.2}
                          y={region.coordinates.y - 1.8}
                          fill={color}
                          fontSize="1.6"
                          fontFamily="monospace"
                        >
                          {region.icon} {region.nameZh}
                        </text>
                        <text
                          x={region.coordinates.x + 2.2}
                          y={region.coordinates.y - 0.3}
                          fill="rgba(180,180,190,0.8)"
                          fontSize="1"
                          fontFamily="monospace"
                        >
                          {region.nameEn}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Region count */}
            <div className="flex justify-between items-center px-2 pt-2">
              <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">
                顯示 {filteredRegions.length} / {regions.length} 產區
              </p>
              {selectedRegion && (
                <p className="font-mono text-[10px] text-neon-amber tracking-wider">
                  已選取: {selectedRegion.nameZh}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedRegion && (
          <div className="lg:w-[45%] animate-fade-in-up">
            <DetailPanel
              region={selectedRegion}
              onClose={() => setSelectedRegion(null)}
            />
          </div>
        )}
      </div>

      {/* Empty state when no selection */}
      {!selectedRegion && (
        <div className="mt-8 text-center py-12 glass-card">
          <p className="text-4xl mb-4">🌍</p>
          <p className="font-display text-xl text-text-warm mb-2">
            點擊地圖上的光點探索產區
          </p>
          <p className="font-mono text-xs text-charcoal-500 tracking-wider">
            Click a glowing dot to explore a region
          </p>
        </div>
      )}

      {/* Region quick-access grid */}
      <div className="mt-8">
        <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-4">
          All Regions 所有產區
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filteredRegions.map((region) => {
            const color = getMarkerColor(region.specialties.type);
            const isSelected = selectedRegion?.id === region.id;
            return (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region)}
                className={`text-left p-3 border transition-all duration-300 group ${
                  isSelected
                    ? 'bg-bg-tertiary'
                    : 'bg-bg-secondary hover:bg-bg-tertiary'
                }`}
                style={{
                  borderColor: isSelected ? color : 'var(--color-charcoal-700)',
                }}
              >
                <span className="text-lg">{region.icon}</span>
                <p className="font-display text-sm text-text-warm mt-1 truncate">
                  {region.nameZh}
                </p>
                <p className="font-mono text-[10px] text-charcoal-500 truncate">
                  {region.nameEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
