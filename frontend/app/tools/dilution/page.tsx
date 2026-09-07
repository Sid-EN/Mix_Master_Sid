'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

/* ─── Types ─── */
type Technique = 'stir' | 'shake' | 'build' | 'rocks';
type IceType = 'sphere' | 'largeCube' | 'standard' | 'crushed';

interface SimState {
  abv: number;
  volume: number;
  technique: Technique;
  duration: number;
  ice: IceType;
  chilled: boolean;
}

/* ─── Constants ─── */
const TECHNIQUE_OPTIONS: { value: Technique; label: string; en: string }[] = [
  { value: 'stir', label: '攪拌', en: 'Stir' },
  { value: 'shake', label: '搖盪', en: 'Shake' },
  { value: 'build', label: '直調', en: 'Build' },
  { value: 'rocks', label: '冰融', en: 'On the Rocks' },
];

const ICE_OPTIONS: { value: IceType; label: string }[] = [
  { value: 'sphere', label: '大冰球 Large Sphere' },
  { value: 'largeCube', label: '大方冰 Large Cube' },
  { value: 'standard', label: '標準冰塊 Standard' },
  { value: 'crushed', label: '碎冰 Crushed' },
];

const PRESETS: { emoji: string; name: string; state: SimState }[] = [
  { emoji: '🥃', name: 'Whisky On the Rocks', state: { abv: 40, volume: 60, technique: 'rocks', duration: 120, ice: 'sphere', chilled: false } },
  { emoji: '🍸', name: 'Stirred Martini', state: { abv: 30, volume: 90, technique: 'stir', duration: 30, ice: 'standard', chilled: true } },
  { emoji: '🍹', name: 'Shaken Daiquiri', state: { abv: 25, volume: 120, technique: 'shake', duration: 12, ice: 'standard', chilled: false } },
  { emoji: '🌿', name: 'Mojito Build', state: { abv: 15, volume: 200, technique: 'build', duration: 0, ice: 'crushed', chilled: false } },
  { emoji: '🧊', name: 'Julep', state: { abv: 25, volume: 90, technique: 'build', duration: 0, ice: 'crushed', chilled: false } },
];

const FUN_FACTS = [
  'Dave Arnold 的實驗證明，搖盪 12 秒即可達到最低溫度',
  '標準稀釋率約 25-30%，即 90ml 調酒會加入約 25ml 水',
  '碎冰的表面積是大冰球的 5-8 倍，融化速度遠超想像',
  '日式攪拌法講求精確旋轉，通常 40-50 次即達到完美稀釋',
];

/* ─── Calculation helpers ─── */
const BASE_RATE: Record<Technique, number> = {
  stir: 0.5,
  shake: 1.2,
  build: 0.3,
  rocks: 0.2,
};

const ICE_MULT: Record<IceType, number> = {
  sphere: 0.6,
  largeCube: 0.7,
  standard: 1.0,
  crushed: 2.0,
};

const TEMP_TARGET: Record<Technique, number> = {
  stir: -1,
  shake: -4,
  build: 5,
  rocks: 4,
};

const TAU: Record<Technique, number> = {
  stir: 12,
  shake: 6,
  build: 25,
  rocks: 30,
};

function calcDilution(s: SimState, t: number): number {
  const rate = BASE_RATE[s.technique] * ICE_MULT[s.ice] * (s.chilled ? 0.9 : 1);
  return rate * t;
}

function calcTemp(technique: Technique, t: number): number {
  const tStart = 20;
  const tTarget = TEMP_TARGET[technique];
  const tau = TAU[technique];
  return tTarget + (tStart - tTarget) * Math.exp(-t / tau);
}

function calcAbv(startAbv: number, vol: number, dilution: number): number {
  if (vol + dilution === 0) return startAbv;
  return (startAbv * vol) / (vol + dilution);
}

/* ─── SVG Chart Component ─── */
function Chart({
  title,
  data,
  currentX,
  yLabel,
  yMin,
  yMax,
  formatY,
}: {
  title: string;
  data: [number, number][];
  currentX: number;
  yLabel: string;
  yMin: number;
  yMax: number;
  formatY: (v: number) => string;
}) {
  const W = 480;
  const H = 240;
  const PAD = { top: 24, right: 20, bottom: 36, left: 52 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const xMax = 60;
  const toX = (v: number) => PAD.left + (v / xMax) * cw;
  const toY = (v: number) => PAD.top + ch - ((v - yMin) / (yMax - yMin)) * ch;

  const pts = data.map(([x, y]) => `${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(' ');

  const curIdx = data.findIndex(([x]) => x >= currentX);
  const curPt = curIdx >= 0 ? data[curIdx] : data[data.length - 1];

  const yTicks = 5;
  const yStep = (yMax - yMin) / yTicks;

  return (
    <div className="glass-card p-4">
      <h3 className="font-display text-sm text-gradient-amber mb-2">{title}</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
        {/* grid */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const val = yMin + yStep * i;
          const y = toY(val);
          return (
            <g key={`yg-${i}`}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="var(--color-charcoal-700)" strokeWidth={0.5} />
              <text x={PAD.left - 6} y={y + 3} textAnchor="end" fill="var(--color-charcoal-400)" fontSize={9} fontFamily="monospace">
                {formatY(val)}
              </text>
            </g>
          );
        })}
        {[0, 15, 30, 45, 60].map((s) => (
          <g key={`xg-${s}`}>
            <line x1={toX(s)} x2={toX(s)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-charcoal-700)" strokeWidth={0.5} />
            <text x={toX(s)} y={H - PAD.bottom + 14} textAnchor="middle" fill="var(--color-charcoal-400)" fontSize={9} fontFamily="monospace">
              {s}s
            </text>
          </g>
        ))}

        {/* axis labels */}
        <text x={W / 2} y={H - 4} textAnchor="middle" fill="var(--color-charcoal-400)" fontSize={10} fontFamily="monospace">
          時間 (s)
        </text>
        <text x={12} y={H / 2} textAnchor="middle" fill="var(--color-charcoal-400)" fontSize={10} fontFamily="monospace" transform={`rotate(-90, 12, ${H / 2})`}>
          {yLabel}
        </text>

        {/* line */}
        <polyline points={pts} fill="none" stroke="var(--color-neon-amber)" strokeWidth={2} strokeLinejoin="round" />

        {/* current dot */}
        {curPt && (
          <>
            <line x1={toX(curPt[0])} x2={toX(curPt[0])} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-neon-cyan)" strokeWidth={0.8} strokeDasharray="4 3" />
            <circle cx={toX(curPt[0])} cy={toY(curPt[1])} r={4} fill="var(--color-neon-cyan)" />
            <text x={toX(curPt[0]) + 8} y={toY(curPt[1]) - 6} fill="var(--color-neon-cyan)" fontSize={10} fontFamily="monospace" fontWeight="bold">
              {formatY(curPt[1])}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

/* ─── Gauge Component ─── */
function AbvGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180;
  const r = 70;
  const cx = 90;
  const cy = 85;
  const rad = (a: number) => ((a - 180) * Math.PI) / 180;
  const arcEnd = (a: number) => ({
    x: cx + r * Math.cos(rad(a)),
    y: cy + r * Math.sin(rad(a)),
  });

  const end = arcEnd(angle);
  const largeArc = angle > 180 ? 1 : 0;
  const bgArc = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
  const valArc = `M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;

  return (
    <svg viewBox="0 0 180 100" className="w-full" style={{ maxWidth: 220 }}>
      <path d={bgArc} fill="none" stroke="var(--color-charcoal-700)" strokeWidth={10} strokeLinecap="round" />
      <path d={valArc} fill="none" stroke="var(--color-neon-amber)" strokeWidth={10} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px var(--shadow-neon-amber))' }} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--color-neon-amber)" fontSize={26} fontWeight="bold" fontFamily="monospace">
        {value.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--color-charcoal-400)" fontSize={9} fontFamily="monospace">
        FINAL ABV
      </text>
    </svg>
  );
}

/* ─── Main Page ─── */
export default function DilutionSimulatorPage() {
  const [state, setState] = useState<SimState>({
    abv: 40,
    volume: 90,
    technique: 'stir',
    duration: 15,
    ice: 'standard',
    chilled: false,
  });

  const set = <K extends keyof SimState>(key: K, val: SimState[K]) =>
    setState((prev) => ({ ...prev, [key]: val }));

  // Clamp duration to 60 for chart, but allow up to 300 for presets like Whisky
  const maxDuration = Math.max(60, state.duration);

  const results = useMemo(() => {
    const dil = calcDilution(state, state.duration);
    const finalAbv = calcAbv(state.abv / 100, state.volume, dil) * 100;
    const finalVol = state.volume + dil;
    const dilPct = finalVol > 0 ? (dil / finalVol) * 100 : 0;
    const temp = calcTemp(state.technique, state.duration);
    return { dilution: dil, finalAbv, finalVol, dilPct, temp };
  }, [state]);

  const chartXMax = Math.max(60, state.duration);
  const steps = 120;

  const abvData = useMemo<[number, number][]>(() => {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = (i / steps) * chartXMax;
      const dil = calcDilution(state, t);
      return [t, calcAbv(state.abv / 100, state.volume, dil) * 100];
    });
  }, [state, chartXMax]);

  const tempData = useMemo<[number, number][]>(() => {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = (i / steps) * chartXMax;
      return [t, calcTemp(state.technique, t)];
    });
  }, [state.technique, chartXMax]);

  const abvRange = useMemo(() => {
    const vals = abvData.map(([, y]) => y);
    const mn = Math.floor(Math.min(...vals) / 5) * 5;
    const mx = Math.ceil(Math.max(...vals) / 5) * 5;
    return { min: Math.max(0, mn - 5), max: Math.min(100, mx + 5) };
  }, [abvData]);

  const tempRange = useMemo(() => {
    const vals = tempData.map(([, y]) => y);
    const mn = Math.floor(Math.min(...vals) / 5) * 5;
    const mx = Math.ceil(Math.max(...vals) / 5) * 5;
    return { min: mn - 2, max: mx + 2 };
  }, [tempData]);

  // Use the full chartXMax for data but scale the chart x-axis to chartXMax
  const chartAbvData = abvData;
  const chartTempData = tempData;
  const chartXMaxVal = chartXMax;

  return (
    <main className="min-h-screen px-4 sm:px-6 py-24 max-w-6xl mx-auto">
      {/* Back link */}
      <div className="mb-8 animate-fade-in">
        <Link href="/tools" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors">
          ← 工具箱 TOOLS
        </Link>
      </div>

      {/* Header */}
      <header className="mb-12 animate-fade-in">
        <h1 className="font-display text-3xl sm:text-4xl text-gradient-amber mb-2">
          🔬 稀釋率模擬器
        </h1>
        <p className="font-display text-lg text-gradient-amber opacity-80">
          Dilution &amp; ABV Simulator
        </p>
        <p className="font-mono text-sm text-charcoal-500 tracking-wider mt-2">
          探索冰塊、攪拌與搖盪如何改變你調酒的酒精濃度與風味平衡
        </p>
      </header>

      {/* Section 1: Interactive Simulator */}
      <section className="mb-16 animate-fade-in">
        <h2 className="font-display text-xl text-gradient-amber mb-6">
          互動模擬器 <span className="font-mono text-xs text-charcoal-500">INTERACTIVE SIMULATOR</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-5 glass-card p-6 space-y-5">
            {/* Starting ABV */}
            <div>
              <label className="block font-mono text-xs text-charcoal-400 mb-1">
                起始酒精濃度 Starting ABV
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" aria-label="數值調整"
                  min={0}
                  max={100}
                  step={0.5}
                  value={state.abv}
                  onChange={(e) => set('abv', Number(e.target.value))}
                  className="flex-1 accent-amber-400"
                />
                <span className="font-mono text-sm text-neon-amber w-14 text-right">{state.abv}%</span>
              </div>
            </div>

            {/* Volume */}
            <div>
              <label className="block font-mono text-xs text-charcoal-400 mb-1">
                液體總量 Total Volume (ml)
              </label>
              <input
                type="number"
                aria-label="數值輸入"
                min={1}
                max={1000}
                value={state.volume}
                onChange={(e) => set('volume', Math.max(1, Number(e.target.value)))}
                className="input-neon w-32"
              />
            </div>

            {/* Technique */}
            <div>
              <label className="block font-mono text-xs text-charcoal-400 mb-2">
                技法選擇 Technique
              </label>
              <div className="flex flex-wrap gap-2">
                {TECHNIQUE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => set('technique', opt.value)}
                    className={`px-3 py-1.5 font-mono text-xs border transition-all ${
                      state.technique === opt.value
                        ? 'border-neon-amber text-neon-amber bg-neon-amber/10'
                        : 'border-charcoal-600 text-charcoal-400 hover:border-charcoal-400'
                    }`}
                  >
                    {opt.label} <span className="text-charcoal-500">{opt.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-mono text-xs text-charcoal-400 mb-1">
                時間 Duration
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" aria-label="數值調整"
                  min={0}
                  max={state.technique === 'rocks' ? 300 : 60}
                  step={1}
                  value={state.duration}
                  onChange={(e) => set('duration', Number(e.target.value))}
                  className="flex-1 accent-amber-400"
                />
                <span className="font-mono text-sm text-neon-amber w-14 text-right">{state.duration}s</span>
              </div>
            </div>

            {/* Ice Type */}
            <div>
              <label className="block font-mono text-xs text-charcoal-400 mb-1">
                冰塊類型 Ice Type
              </label>
              <select
            aria-label="選項"
                value={state.ice}
                onChange={(e) => set('ice', e.target.value as IceType)}
                className="input-neon w-full"
              >
                {ICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Chilled Glass */}
            <div className="flex items-center gap-3">
              <label className="font-mono text-xs text-charcoal-400">
                杯子預冷 Chilled Glass
              </label>
              <button
                onClick={() => set('chilled', !state.chilled)}
                role="switch"
                aria-checked={state.chilled}
                aria-label="杯子預冷"
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  state.chilled ? 'bg-neon-amber/30 border-neon-amber' : 'bg-charcoal-700 border-charcoal-600'
                } border`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
                    state.chilled ? 'translate-x-6 bg-neon-amber' : 'bg-charcoal-400'
                  }`}
                />
              </button>
              <span className="font-mono text-xs text-charcoal-500">
                {state.chilled ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 space-y-6">
            {/* Big Numbers */}
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Gauge */}
                <div className="flex-shrink-0">
                  <AbvGauge value={results.finalAbv} />
                </div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="font-mono text-xs text-charcoal-500">稀釋量 Dilution</p>
                    <p className="font-mono text-2xl text-neon-amber">{results.dilution.toFixed(1)}<span className="text-sm text-charcoal-400">ml</span></p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-charcoal-500">稀釋百分比 Dilution %</p>
                    <p className="font-mono text-2xl text-neon-amber">{results.dilPct.toFixed(1)}<span className="text-sm text-charcoal-400">%</span></p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-charcoal-500">最終總量 Final Vol</p>
                    <p className="font-mono text-2xl text-neon-cyan">{results.finalVol.toFixed(1)}<span className="text-sm text-charcoal-400">ml</span></p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-charcoal-500">預估溫度 Est. Temp</p>
                    <p className="font-mono text-2xl text-neon-cyan">{results.temp.toFixed(1)}<span className="text-sm text-charcoal-400">°C</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <ChartSection
              abvData={chartAbvData}
              tempData={chartTempData}
              currentX={state.duration}
              abvRange={abvRange}
              tempRange={tempRange}
              xMax={chartXMaxVal}
            />
          </div>
        </div>
      </section>

      {/* Section 3: Presets */}
      <section className="mb-16 animate-fade-in">
        <h2 className="font-display text-xl text-gradient-amber mb-6">
          預設場景 <span className="font-mono text-xs text-charcoal-500">PRESET SCENARIOS</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setState(p.state)}
              className="btn-neon-amber !px-4 !py-2 !text-xs"
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>
      </section>

      {/* Section 4: Fun Facts */}
      <section className="animate-fade-in">
        <h2 className="font-display text-xl text-gradient-amber mb-6">
          知識補充 <span className="font-mono text-xs text-charcoal-500">DID YOU KNOW?</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FUN_FACTS.map((fact, i) => (
            <div key={i} className="glass-card p-5">
              <p className="font-mono text-xs text-charcoal-500 mb-1">💡 Fact #{i + 1}</p>
              <p className="text-sm text-charcoal-300 leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ─── Chart Section (extracted to keep JSX clean) ─── */
function ChartSection({
  abvData,
  tempData,
  currentX,
  abvRange,
  tempRange,
  xMax,
}: {
  abvData: [number, number][];
  tempData: [number, number][];
  currentX: number;
  abvRange: { min: number; max: number };
  tempRange: { min: number; max: number };
  xMax: number;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-gradient-amber">
        SVG 圖表 <span className="font-mono text-xs text-charcoal-500">LIVE CHARTS</span>
      </h3>
      <ScaledChart
        title="ABV 隨時間變化 — ABV over Time"
        data={abvData}
        currentX={currentX}
        yLabel="ABV %"
        yMin={abvRange.min}
        yMax={abvRange.max}
        xMax={xMax}
        formatY={(v) => `${v.toFixed(0)}%`}
      />
      <ScaledChart
        title="溫度隨時間變化 — Temperature over Time"
        data={tempData}
        currentX={currentX}
        yLabel="°C"
        yMin={tempRange.min}
        yMax={tempRange.max}
        xMax={xMax}
        formatY={(v) => `${v.toFixed(0)}°`}
      />
    </div>
  );
}

/* ─── Chart with dynamic X max ─── */
function ScaledChart({
  title,
  data,
  currentX,
  yLabel,
  yMin,
  yMax,
  xMax,
  formatY,
}: {
  title: string;
  data: [number, number][];
  currentX: number;
  yLabel: string;
  yMin: number;
  yMax: number;
  xMax: number;
  formatY: (v: number) => string;
}) {
  const W = 480;
  const H = 240;
  const PAD = { top: 24, right: 20, bottom: 36, left: 52 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const toX = (v: number) => PAD.left + (v / xMax) * cw;
  const toY = (v: number) => {
    if (yMax === yMin) return PAD.top + ch / 2;
    return PAD.top + ch - ((v - yMin) / (yMax - yMin)) * ch;
  };

  const pts = data.map(([x, y]) => `${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(' ');

  // Find current point by closest x
  let curPt: [number, number] = data[data.length - 1];
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] >= currentX) {
      curPt = data[i];
      break;
    }
  }

  const yTicks = 5;
  const yStep = yMax !== yMin ? (yMax - yMin) / yTicks : 1;

  // X ticks: adaptive
  const xTickCount = 4;
  const xStep = xMax / xTickCount;
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => Math.round(i * xStep));

  return (
    <div className="glass-card p-4">
      <h3 className="font-display text-sm text-gradient-amber mb-2">{title}</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
        {/* Y grid & labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const val = yMin + yStep * i;
          const y = toY(val);
          return (
            <g key={`yg-${i}`}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="var(--color-charcoal-700)" strokeWidth={0.5} />
              <text x={PAD.left - 6} y={y + 3} textAnchor="end" fill="var(--color-charcoal-400)" fontSize={9} fontFamily="monospace">
                {formatY(val)}
              </text>
            </g>
          );
        })}
        {/* X grid & labels */}
        {xTicks.map((s) => (
          <g key={`xg-${s}`}>
            <line x1={toX(s)} x2={toX(s)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-charcoal-700)" strokeWidth={0.5} />
            <text x={toX(s)} y={H - PAD.bottom + 14} textAnchor="middle" fill="var(--color-charcoal-400)" fontSize={9} fontFamily="monospace">
              {s}s
            </text>
          </g>
        ))}
        {/* Axis labels */}
        <text x={W / 2} y={H - 4} textAnchor="middle" fill="var(--color-charcoal-400)" fontSize={10} fontFamily="monospace">
          時間 (s)
        </text>
        <text x={12} y={H / 2} textAnchor="middle" fill="var(--color-charcoal-400)" fontSize={10} fontFamily="monospace" transform={`rotate(-90, 12, ${H / 2})`}>
          {yLabel}
        </text>
        {/* Data line */}
        <polyline points={pts} fill="none" stroke="var(--color-neon-amber)" strokeWidth={2} strokeLinejoin="round" />
        {/* Current position */}
        {curPt && (
          <>
            <line x1={toX(curPt[0])} x2={toX(curPt[0])} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-neon-cyan)" strokeWidth={0.8} strokeDasharray="4 3" />
            <circle cx={toX(curPt[0])} cy={toY(curPt[1])} r={4} fill="var(--color-neon-cyan)" />
            <text x={toX(curPt[0]) + 8} y={toY(curPt[1]) - 6} fill="var(--color-neon-cyan)" fontSize={10} fontFamily="monospace" fontWeight="bold">
              {formatY(curPt[1])}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
